#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import json
import urllib

from flask import abort
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import send_from_directory
from flask import url_for
from form import AUTH_REPORT
from form import IssueForm
from form import PROXY_REPORT
from helpers import get_browser
from helpers import get_browser_name
from helpers import get_os
from helpers import get_referer
from helpers import get_user_info
from helpers import thanks_page
from helpers import set_referer
from issues import report_issue
from webcompat.db import session_db
from webcompat.db import User

from webcompat import app
from webcompat import github
from webcompat.api.endpoints import get_rate_limit


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
    return redirect(url_for('thanks', number=response.get('number')))


@app.route('/', methods=['GET', 'POST'])
def index():
    '''Main view where people come to report issues.'''
    bug_form = IssueForm()
    # add browser and version to bug_form object data
    ua_header = request.headers.get('User-Agent')
    bug_form.browser.data = get_browser(ua_header)
    bug_form.os.data = get_os(ua_header)
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
def show_issues():
    '''Route to display global issues view.'''
    if g.user:
        get_user_info()
    categories = app.config['CATEGORIES']
    return render_template('list-issue.html', categories=categories)


@app.route('/issues/new', methods=['POST'])
def create_issue():
    # copy the form so we can add the full UA string to it.
    form = request.form.copy()
    form['ua_header'] = request.headers.get('User-Agent')
    if form.get('submit-type') == AUTH_REPORT:
        if g.user:  # If you're already authed, submit the bug.
            response = report_issue(form)
            return thanks_page(request, response)
        else:  # Stash form data into session, go do GitHub auth
            session['form_data'] = form
            return redirect(url_for('login'))
    elif form.get('submit-type') == PROXY_REPORT:
        response = report_issue(form, proxy=True).json()
        return thanks_page(request, response)


@app.route('/issues/<int:number>')
def show_issue(number):
    '''Route to display a single issue.'''
    if g.user:
        get_user_info()
    return render_template('issue.html', number=number)


@app.route('/thanks/<int:number>')
def thanks(number):
    issue = number
    uri = u"https://webcompat.com/issues/{0}".format(number)
    text = u"I just filed a bug on the internet: "
    encoded_issue = urllib.quote(uri.encode("utf-8"))
    encoded_text = urllib.quote(text.encode("utf-8"))
    if g.user:
        get_user_info()
    return render_template('thanks.html', number=issue,
                           encoded_issue=encoded_issue,
                           encoded_text=encoded_text)


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


@app.route('/about')
def about():
    '''Route to display about page.'''
    if g.user:
        get_user_info()
    return render_template('about.html')


@app.route('/privacy')
def privacy():
    '''Route to display privacy page.'''
    if g.user:
        get_user_info()
    return render_template('privacy.html')


@app.route('/contributors')
def contributors():
    '''Route to display contributors page.'''
    if g.user:
        get_user_info()
    return render_template('contributors.html')


@app.route('/tools/cssfixme')
def cssfixme():
    '''Route for CSS Fix me tool'''
    return render_template('cssfixme.html')
