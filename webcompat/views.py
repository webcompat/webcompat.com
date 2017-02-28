#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import json
import logging
import os

from flask import abort
from flask import flash
from flask import g
from flask import make_response
from flask import redirect
from flask import render_template
from flask import request
from flask import send_from_directory
from flask import session
from flask import url_for

from form import AUTH_REPORT
from form import PROXY_REPORT
from helpers import cache_policy
from helpers import get_browser_name
from helpers import get_form
from helpers import get_referer
from helpers import get_user_info
from helpers import set_referer
from issues import report_issue
from webcompat import app
from webcompat import github
from webcompat.api.endpoints import get_rate_limit
from webcompat.db import User
from webcompat.db import session_db


@app.teardown_appcontext
def shutdown_session(exception=None):
    session_db.remove()


@app.before_request
def before_request():
    g.user = None
    if 'user_id' in session:
        g.user = User.query.get(session['user_id'])
    g.referer = get_referer(request) or url_for('index')
    g.request_headers = request.headers


@app.after_request
def after_request(response):
    session_db.remove()
    return response


@github.access_token_getter
def token_getter():
    user = g.user
    if user is not None:
        return user.access_token


@app.template_filter('format_date')
def format_date(datestring):
    '''For now, just chops off crap.'''
    # 2014-05-01T02:26:28Z
    return datestring[0:10]


@app.route('/login')
def login():
    if session.get('user_id', None) is None:
        # manually set the referer so we know where to come back to
        # when we return from GitHub
        set_referer(request)
        return github.authorize('public_repo')
    else:
        return redirect(g.referer)


@app.route('/logout')
def logout():
    session.clear()
    flash(u'You were successfully logged out.', 'info')
    return redirect(g.referer)


# OAuth2 callback handler that GitHub requires.
# If this moves, it needs to change in GitHub settings as well
@app.route('/callback')
@github.authorized_handler
def authorized(access_token):
    if access_token is None:
        flash(u'Something went wrong trying to sign into GitHub. :(', 'error')
        return redirect(g.referer)
    user = User.query.filter_by(access_token=access_token).first()
    if user is None:
        user = User(access_token)
        session_db.add(user)
    session_db.commit()
    session['user_id'] = user.user_id
    if session.get('form_data', None) is not None:
        return redirect(url_for('file_issue'))
    else:
        return redirect(g.referer)


# This route won't ever be viewed by a human being--there's not
# a corresponding template. It exists just to submit an issue after
# a user auths with GitHub.
@app.route('/file')
def file_issue():
    '''File an issue on behalf of the user that just gave us authorization.'''
    response = report_issue(session['form_data'])
    # Get rid of stashed form data
    session.pop('form_data', None)
    session['show_thanks'] = True
    return redirect(url_for('show_issue', number=response.get('number')))


@app.route('/', methods=['GET', 'POST'])
def index():
    '''Main view where people come to report issues.'''
    ua_header = request.headers.get('User-Agent')
    bug_form = get_form(ua_header)
    # browser_name is used in topbar.html to show the right add-on link
    browser_name = get_browser_name(ua_header)
    # GET means you want to file a report.
    if request.method == 'GET':
        if g.user:
            get_user_info()
        return render_template('index.html', form=bug_form,
                               browser=browser_name)
    # Validate, then create issue.
    elif bug_form.validate_on_submit():
        return create_issue()

    else:
        # Validation failed, re-render the form with the errors.
        return render_template('index.html', form=bug_form,
                               browser=browser_name)


@app.route('/issues')
@cache_policy(private=True, uri_max_age=86400)
def show_issues():
    '''Route to display global issues view.'''
    if g.user:
        get_user_info()
    categories = app.config['CATEGORIES']
    return render_template('list-issue.html', categories=categories)


@app.route('/issues/new', methods=['GET', 'POST'])
@cache_policy(private=True, uri_max_age=86400)
def create_issue():
    """Creates a new issue.

    GET will return an HTML response for reporting issues
    POST will create a new issue
    """
    if request.method == 'GET':
        bug_form = get_form(request.headers.get('User-Agent'))
        if g.user:
            get_user_info()
        if request.args.get('src'):
            session['src'] = request.args.get('src')
        return render_template('new-issue.html', form=bug_form)
    # copy the form so we can add the full UA string to it.
    form = request.form.copy()
    # see https://github.com/webcompat/webcompat.com/issues/1141
    # see https://github.com/webcompat/webcompat.com/issues/1237
    spamlist = ['qiangpiaoruanjian', 'cityweb.de']
    for spam in spamlist:
        if spam in form.get('url'):
            msg = (u'Anonymous reporting for domain {0} '
                   'is temporarily disabled. Please contact '
                   'miket@mozilla.com '
                   'for more details.').format(spam)
            flash(msg, 'notimeout')
            return redirect(url_for('index'))
    form['ua_header'] = request.headers.get('User-Agent')
    form['reported_with'] = session.pop('src', 'web')
    # Logging the ip and url for investigation
    log = app.logger
    log.setLevel(logging.INFO)
    log.info('{ip} {url}'.format(ip=request.remote_addr, url=form['url']))
    # form submission for 3 scenarios: authed, to be authed, anonymous
    if form.get('submit-type') == AUTH_REPORT:
        if g.user:  # If you're already authed, submit the bug.
            response = report_issue(form)
            session['show_thanks'] = True
            return redirect(url_for('show_issue',
                                    number=response.get('number')))
        else:  # Stash form data into session, go do GitHub auth
            session['form_data'] = form
            return redirect(url_for('login'))
    elif form.get('submit-type') == PROXY_REPORT:
        response = report_issue(form, proxy=True).json()
        session['show_thanks'] = True
        return redirect(url_for('show_issue', number=response.get('number')))


@app.route('/issues/<int:number>')
@cache_policy(private=True, uri_max_age=86400)
def show_issue(number):
    '''Route to display a single issue.'''
    if g.user:
        get_user_info()
    if session.get('show_thanks'):
        flash(number, 'thanks')
        session.pop('show_thanks')
    content = render_template('issue.html', number=number)
    response = make_response(content)
    return response


@app.route('/me')
def me_redirect():
    '''This route redirects to /activity/<username>, for logged in users.'''
    if not g.user:
        abort(401)
    get_user_info()
    return redirect(url_for('show_user_page', username=session['username']))


@app.route('/activity/<username>')
def show_user_page(username):
    '''The logic for this route is as follows:

    (this dupes some of the functionality of /me, but allows directly visiting
    this endpoint via a bookmark)

    If the user is not logged in, send back a 401.
    Make sure we have username and avatar details from Github
    If the username matches, render the template as expected.
    If it doesn't match, abort with 403 until we support looking at
    *other* users activity.
    '''
    if not g.user:
        abort(401)
    get_user_info()
    if username == session['username']:
        return render_template('user-activity.html', user=username)
    else:
        abort(403)


@app.route('/rate_limit')
def show_rate_limit():
    body, status_code, response_headers = get_rate_limit()
    rl = json.loads(body)
    if g.user:
        rl.update({"user": session.get('username')})
    else:
        rl.update({"user": "webcompat-bot"})
    # The "rate" hash (shown at the bottom of the response above) is
    # deprecated and is scheduled for removal in the next version of the API.
    # see https://developer.github.com/v3/rate_limit/
    if "rate" in rl:
        rl.pop("rate")
    return (render_template('ratelimit.txt', rl=rl), 200,
            {"content-type": "text/plain"})


if app.config['LOCALHOST']:
    @app.route('/uploads/<path:filename>')
    def download_file(filename):
        '''Route just for local environments to send uploaded images.

        In production, nginx handles this without needing to touch the
        Python app.
        '''
        return send_from_directory(
            app.config['UPLOADS_DEFAULT_DEST'], filename)

    @app.route('/test-files/<path:filename>')
    def get_test_helper(filename):
        '''Route to get ahold of test-related files, only on localhost.
        '''
        path = os.path.join(app.config['BASE_DIR'], 'tests')
        return send_from_directory(path, filename)


@app.route('/about')
@cache_policy(private=True, uri_max_age=86400)
def about():
    '''Route to display about page.'''
    if g.user:
        get_user_info()
    return render_template('about.html')


@app.route('/privacy')
@cache_policy(private=True, uri_max_age=86400)
def privacy():
    '''Route to display privacy page.'''
    if g.user:
        get_user_info()
    return render_template('privacy.html')


@app.route('/contributors')
@cache_policy(private=True, uri_max_age=86400)
def contributors():
    '''Route to display contributors page.'''
    if g.user:
        get_user_info()
    return render_template('contributors.html')


@app.route('/tools/cssfixme')
def cssfixme():
    '''Route for CSS Fix me tool'''
    return render_template('cssfixme.html')
