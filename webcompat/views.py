#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Module for the main routes of webcompat.com."""
from hashlib import sha1
import logging
import os
import urlparse
from uuid import uuid4

from flask import abort
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import send_from_directory
from flask import session
from flask import url_for

from flask_firehose import push
from form import AUTH_REPORT
from form import get_form
from form import PROXY_REPORT
from helpers import ab_current_experiments
from helpers import ab_init
from helpers import add_csp
from helpers import add_sec_headers
from helpers import bust_cache
from helpers import cache_policy
from helpers import form_type
from helpers import get_browser_name
from helpers import get_referer
from helpers import get_user_info
from helpers import is_blacklisted_domain
from helpers import is_valid_issue_form
from helpers import prepare_form
from helpers import set_referer
from issues import report_issue
from webcompat import app
from webcompat.db import session_db
from webcompat.db import User
from webcompat import github


@app.teardown_appcontext
def shutdown_session(exception=None):
    """Clear the session."""
    session_db.remove()


@app.before_request
def before_request():
    """Set parameters in g before each request."""
    g.user = None
    if 'user_id' in session:
        g.user = User.query.get(session['user_id'])
    g.referer = get_referer(request) or url_for('index')
    g.request_headers = request.headers
    request.nonce = sha1(uuid4().hex).hexdigest()

    # Set AB testing values
    g.current_experiments = ab_current_experiments()


@app.after_request
def after_request(response):
    """Remove/Add a couple of things after the request."""
    session_db.remove()
    add_sec_headers(response)
    add_csp(response)
    ab_init(response)
    return response


@github.access_token_getter
def token_getter():
    """Grab the user token."""
    user = g.user
    if user is not None:
        return user.access_token


@app.template_filter('format_date')
def format_date(datestring):
    """For now, just chops off crap."""
    # 2014-05-01T02:26:28Z
    return datestring[0:10]


@app.route('/login')
def login():
    """Set the login route."""
    if session.get('user_id', None) is None:
        if app.config['TESTING']:
            session['username'] = 'testuser'
            session['avatar_url'] = '/test-files/fixtures/avatar.png?'
            return authorized()
        else:
            # manually set the referer so we know where to come back to
            # when we return from GitHub
            set_referer(request)
            return github.authorize('public_repo')
    else:
        return redirect(g.referer)


@app.route('/logout')
def logout():
    """Set the logout route."""
    session.clear()
    flash(u'You were successfully logged out.', 'info')
    return redirect(g.referer)


# OAuth2 callback handler that GitHub requires.
# If this moves, it needs to change in GitHub settings as well
@app.route('/callback')
@github.authorized_handler
def authorized(access_token=None):
    """Set the callback route for oauth2 with GitHub."""
    if app.config['TESTING']:
        access_token = 'thisisatest'
    if access_token is None:
        flash(u'Something went wrong trying to sign into GitHub. :(', 'error')
        return redirect(g.referer)
    user = User.query.filter_by(access_token=access_token).first()
    if user is None:
        user = User(access_token)
        session_db.add(user)
    session_db.commit()
    session['user_id'] = user.user_id
    if session.get('form', None) is not None:
        return redirect(url_for('file_issue'))
    else:
        return redirect(g.referer)


# This route won't ever be viewed by a human being--there's not
# a corresponding template. It exists just to submit an issue after
# a user auths with GitHub.
@app.route('/file')
def file_issue():
    """File an issue on behalf of the user that just gave us authorization."""
    form_data = session.get('form', None)
    if not session:
        abort(401)
    if session and (form_data is None):
        abort(403)
    json_response = report_issue(session['form'])
    # Get rid of stashed form data
    session.pop('form', None)
    session['show_thanks'] = True
    return redirect(url_for('show_issue', number=json_response.get('number')))


@app.route('/', methods=['GET'])
def index():
    """Set the main view where people come to report issues."""
    push('/css/dist/webcompat.min.css', **{
        'as': 'style',
        'rel': 'preload'
    })
    push(bust_cache('/js/dist/webcompat.min.js'), **{
        'as': 'script',
        'rel': 'preload'
    })
    push('/img/svg/icons/svg-leaf_right.svg', **{
        'as': 'img',
        'rel': 'preload'
    })
    push('/img/svg/icons/svg-leaf_left.svg', **{
        'as': 'img',
        'rel': 'preload'
    })
    ua_header = request.headers.get('User-Agent')
    bug_form = get_form({'user_agent': ua_header})
    # browser_name is used in topbar.html to show the right add-on link
    browser_name = get_browser_name(ua_header)
    # GET means you want to file a report.
    if g.user:
        get_user_info()
    return render_template('index.html', form=bug_form, browser=browser_name)


@app.route('/issues')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def show_issues():
    """Route to display global issues view."""
    push('/css/dist/webcompat.min.css', **{
        'as': 'style',
        'rel': 'preload'
    })
    push(bust_cache('/js/dist/webcompat.min.js'), **{
        'as': 'script',
        'rel': 'preload'
    })
    push(bust_cache('/js/dist/issues.min.js'), **{
        'as': 'script',
        'rel': 'preload'
    })
    if g.user:
        get_user_info()
    categories = app.config['CATEGORIES']
    return render_template('list-issue.html', categories=categories)


@app.route('/issues/new', methods=['GET', 'POST'])
def create_issue():
    """Create a new issue or prefill a form for submission.

    * HTTP GET with (optional) parameters
      * create a form with prefilled data.
      * parameters:
        * url: URL of the Web site
        * src: source of the request (web, addon, etc.)
        * label: controled list of labels
    * HTTP POST with a JSON payload
      * create a form with prefilled data
      * content-type is application/json
      * json may include:
        * title
        * User agent string
        * OS identification
        * labels list
        * type of bugs
        * short summary
        * full description
        * tested in another browser
        * body
        * utm_ params for Google Analytics
    * HTTP POST with an attached form
      * submit a form to GitHub to create a new issue
      * form submit type:
        * authenticated: Github authentification
        * anonymous: handled by webcompat-bot

    Any deceptive requests will be ended as a 400.
    See https://tools.ietf.org/html/rfc7231#section-6.5.1
    """
    push('/css/dist/webcompat.min.css', **{
        'as': 'style',
        'rel': 'preload'
    })
    push(bust_cache('/js/dist/webcompat.min.js'), **{
        'as': 'script',
        'rel': 'preload'
    })
    # Starting a logger
    log = app.logger
    log.setLevel(logging.INFO)
    if g.user:
        get_user_info()
    # We define which type of requests we are dealing with.
    request_type = form_type(request)
    # Form Prefill section
    if request_type == 'prefill':
        form_data = prepare_form(request)
        bug_form = get_form(form_data)
        session['extra_labels'] = form_data['extra_labels']
        source = form_data.pop('utm_source', None)
        campaign = form_data.pop('utm_campaign', None)
        return render_template('new-issue.html', form=bug_form, source=source,
                               campaign=campaign, nonce=request.nonce)
    # Issue Creation section
    elif request_type == 'create':
        # Check if there is a form
        if not request.form:
            log.info('POST request without form.')
            abort(400)
        # Adding parameters to the form
        form = request.form.copy()
        extra_labels = session.pop('extra_labels', None)
        if extra_labels:
            form['extra_labels'] = extra_labels
        # Logging the ip and url for investigation
        log.info('{ip} {url}'.format(
            ip=request.remote_addr,
            url=form['url'].encode('utf-8')))
        # Check if the form is valid
        if not is_valid_issue_form(form):
            abort(400)
        if form.get('submit_type') == PROXY_REPORT:
            # Checking blacklisted domains
            domain = urlparse.urlsplit(form['url']).hostname
            if is_blacklisted_domain(domain):
                msg = app.config['IS_BLACKLISTED_DOMAIN'].format(form['url'])
                flash(msg, 'notimeout')
                return redirect(url_for('index'))
            # Anonymous reporting
            json_response = report_issue(form, proxy=True)
            session['show_thanks'] = True
            return redirect(
                url_for('show_issue', number=json_response.get('number')))
        # Authenticated reporting
        if form.get('submit_type') == AUTH_REPORT:
            if g.user:  # If you're already authed, submit the bug.
                json_response = report_issue(form)
                session['show_thanks'] = True
                return redirect(url_for('show_issue',
                                        number=json_response.get('number')))
            else:
                # Stash form data into session, go do GitHub auth
                session['form'] = form
                return redirect(url_for('login'))
    else:
        abort(400)


@app.route('/issues/<int:number>')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def show_issue(number):
    """Route to display a single issue."""
    push('/css/dist/webcompat.min.css', **{
        'as': 'style',
        'rel': 'preload'
    })
    push(bust_cache('/js/dist/webcompat.min.js'), **{
        'as': 'script',
        'rel': 'preload'
    })
    push(bust_cache('/js/dist/issues.min.js'), **{
        'as': 'script',
        'rel': 'preload'
    })
    if g.user:
        get_user_info()
    if session.get('show_thanks'):
        flash(number, 'thanks')
        session.pop('show_thanks')
    return render_template('issue.html', number=number)


@app.route('/me')
def me_redirect():
    """Set a redirect to /activity/<username>, for logged in users."""
    if not g.user:
        abort(401)
    get_user_info()
    return redirect(url_for('show_user_page', username=session['username']))


@app.route('/activity/<username>')
def show_user_page(username):
    """Set the route for user activity.

    (this dupes some of the functionality of /me, but allows directly visiting
    this endpoint via a bookmark)

    If the user is not logged in, send back a 401.
    Make sure we have username and avatar details from Github
    If the username matches, render the template as expected.
    If it doesn't match, abort with 403 until we support looking at
    *other* users activity.
    """
    if not g.user:
        abort(401)
    get_user_info()
    if username == session['username']:
        return render_template('user-activity.html', user=username)
    else:
        abort(403)


@app.route('/rate_limit')
def show_rate_limit():
    """Retired route. 410 Gone.

    Decision made on March 2017. See
    https://github.com/webcompat/webcompat.com/issues/1437
    """
    msg = app.config['SHOW_RATE_LIMIT']
    return (msg, 410, {'content-type': 'text/plain; charset=utf-8'})


if app.config['LOCALHOST']:
    @app.route('/uploads/<path:filename>')
    def download_file(filename):
        """Route just for local environments to send uploaded images.

        In production, nginx handles this without needing to touch the
        Python app.
        """
        return send_from_directory(
            app.config['UPLOADS_DEFAULT_DEST'], filename)

    @app.route('/test-files/<path:filename>')
    def get_test_helper(filename):
        """Route to get ahold of test-related files, only on localhost."""
        path = os.path.join(app.config['BASE_DIR'], 'tests')
        return send_from_directory(path, filename)


@app.route('/about')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def about():
    """Route to display about page."""
    if g.user:
        get_user_info()
    return render_template('about.html')


@app.route('/privacy')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def privacy():
    """Route to display privacy page."""
    if g.user:
        get_user_info()
    return render_template('privacy.html')


@app.route('/contact')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contact():
    """Route to display contact page."""
    if g.user:
        get_user_info()
    return render_template('contact.html')


@app.route('/contributors')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contributors():
    """Route to display contributors page."""
    if g.user:
        get_user_info()
    return render_template('contributors.html')


@app.route('/contributors/report-bug')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contributors_bug_report():
    """Route to display contributors/report-bug page."""
    if g.user:
        get_user_info()
    return render_template('contributors/report-bug.html')


@app.route('/contributors/reproduce-bug')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contributors_bug_reproduce():
    """Route to display contributors/reproduce-bug page."""
    if g.user:
        get_user_info()
    return render_template('contributors/reproduce-bug.html')


@app.route('/contributors/diagnose-bug')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contributors_bug_diagnosis():
    """Route to display contributors/diagnose-bug page."""
    if g.user:
        get_user_info()
    return render_template('contributors/diagnose-bug.html')


@app.route('/contributors/site-outreach')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contributors_bug_outreach():
    """Route to display contributors/site-outreach page."""
    if g.user:
        get_user_info()
    return render_template('contributors/site-outreach.html')


@app.route('/contributors/build-tools')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contributors_other_tools():
    """Route to display contributors/build-tools page."""
    if g.user:
        get_user_info()
    return render_template('contributors/build-tools.html')


@app.route('/contributors/web-platform-research')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contributors_other_research():
    """Route to display contributors/web-platform-research page."""
    if g.user:
        get_user_info()
    return render_template('contributors/web-platform-research.html')


@app.route('/contributors/organize-webcompat-events')
@cache_policy(private=True, uri_max_age=0, must_revalidate=True)
def contributors_other_events():
    """Route to display contributors/organize-webcompat-events page."""
    if g.user:
        get_user_info()
    return render_template('contributors/organize-webcompat-events.html')


@app.route('/tools/cssfixme')
def cssfixme():
    """Route for returning 410.

    Previously home of a CSS fixing tool.
    """
    msg = app.config['CSS_FIX_ME']
    return (msg, 410, {'content-type': 'text/plain; charset=utf-8'})


@app.route('/dashboard')
def dashboard():
    """Route for dashboards index.

    This used to be hosted on webcompat.com.
    This is now living on the dashboard Web site."""
    return redirect('https://webcompat-dashboard.herokuapp.com/', code=308)


@app.route('/dashboard/triage')
def dashboard_triage():
    """Route to handle dashboard triage.

    This used to be hosted on webcompat.com.
    This is now living on the dashboard Web site."""
    return redirect(
        'https://webcompat-dashboard.herokuapp.com/triage', code=308)


@app.route('/csp-report', methods=['POST'])
def log_csp_report():
    """Route to record CSP header violations.

    This route can be enabled/disabled by setting CSP_LOG to True/False
    in config/__init__.py. It's enabled by default.
    """
    expected_mime = 'application/csp-report'

    if app.config['CSP_LOG']:
        if expected_mime not in request.headers.get('content-type', ''):
            return ('Wrong Content-Type.', 400)
        with open(app.config['CSP_REPORTS_LOG'], 'a') as r:
            r.write(request.data + '\n')
        return ('', 204)
    else:
        return ('Forbidden.', 403)


@app.route('/.well-known/<path:subpath>')
@cache_policy(private=False, uri_max_age=31104000, must_revalidate=False)
def wellknown(subpath):
    """Route for returning 404 for the currently unused well-known routes."""
    if subpath == 'security.txt':
        msg = app.config['WELL_KNOWN_SECURITY']
        status_code = 200
    else:
        msg = app.config['WELL_KNOWN_ALL'].format(subpath=subpath)
        status_code = 404
    return (msg, status_code, {'content-type': 'text/plain; charset=utf-8'})
