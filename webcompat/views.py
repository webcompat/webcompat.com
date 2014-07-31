#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import sys
import urllib
from flask import (flash, g, redirect, request, render_template, session,
                   url_for)
from flask.ext.github import GitHubError
from hashlib import md5
from .form import IssueForm
from .helpers import get_user_info, get_browser, get_browser_name, get_os
from .issues import report_issue, get_issue
from .models import db_session, User
from webcompat import github, app


@app.context_processor
def cache_buster():
    def bust_cache():
        return md5(app.config['STARTUP']).hexdigest()[:14]
    return dict(bust_cache=bust_cache)


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


@app.before_request
def before_request():
    g.user = None
    if 'user_id' in session:
        g.user = User.query.get(session['user_id'])


@app.after_request
def after_request(response):
    db_session.remove()
    return response


@github.access_token_getter
def token_getter():
    user = g.user
    if user is not None:
        return user.github_access_token


@app.template_filter('format_date')
def format_date(datestring):
    '''For now, just chops off crap.'''
    #2014-05-01T02:26:28Z
    return datestring[0:10]


@app.route('/login')
def login():
    next_url = request.args.get('next') or url_for('index')
    if session.get('user_id', None) is None:
        session['next_url'] = next_url
        return github.authorize('public_repo')
    else:
        return redirect(next_url)


@app.route('/logout')
def logout():
    next_url = request.args.get('next') or url_for('index')
    session.clear()
    flash(u'You were successfully logged out.', 'info')
    return redirect(next_url)


# OAuth2 callback handler that GitHub requires.
# If this moves, it needs to change in GitHub settings as well
@app.route('/callback')
@github.authorized_handler
def authorized(access_token):
    next_url = session.get('next_url') or url_for('index')
    if access_token is None:
        flash(u'Something went wrong trying to sign into GitHub. :(', 'error')
        return redirect(next_url)
    user = User.query.filter_by(github_access_token=access_token).first()
    if user is None:
        user = User(access_token)
        db_session.add(user)
    db_session.commit()
    session['user_id'] = user.id
    if session.get('form_data', None) is not None:
        return redirect(url_for('file_issue'))
    else:
        return redirect(next_url)


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
    bug_form = IssueForm(request.form)
    # add browser and version to bug_form object data
    ua_header = request.headers.get('User-Agent')
    bug_form.browser.data = get_browser(ua_header)
    bug_form.os.data = get_os(ua_header)
    browser_name = get_browser_name(ua_header)
    # GET means you want to file a report.
    if request.method == 'GET':
        return render_template('index.html', form=bug_form,
                               browser=browser_name)
    # Form submission.
    elif request.method == 'POST' and bug_form.validate():
        response = report_issue(request.form)
        return redirect(url_for('thanks', number=response.get('number')))
    else:
        # Validation failed, re-render the form with the errors.
        return render_template('index.html', form=bug_form)


@app.route('/issues')
def show_issues():
    '''Temporarily useless.'''
    return redirect(url_for('index'), code=307)


@app.route('/issues/<int:number>')
def show_issue(number):
    '''Route to display a single issue.'''
    if g.user:
        get_user_info()
    try:
        title = get_issue(number)['title']
    except GitHubError:
        e = sys.exc_info()
        print('GitHubError: ', e)
        title = 'Web bug'
    # temporarily provide a link to github (until we can modify issues)
    uri = 'https://github.com/{0}/{1}'.format(app.config['ISSUES_REPO_URI'], number)
    return render_template('issue.html', number=number, uri=uri, title=title)


@app.route('/thanks/<int:number>')
def thanks(number):
    issue = number
    uri = u"http://webcompat.com/issues/{0}".format(number)
    text = u"I just filed a bug on the internet: "
    encoded_issue = urllib.quote(uri.encode("utf-8"))
    encoded_text = urllib.quote(text.encode("utf-8"))
    if g.user:
        get_user_info()
    return render_template('thanks.html', number=issue,
                           encoded_issue=encoded_issue,
                           encoded_text=encoded_text)


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

# Non-production until we're ready for it.
if not app.config['PRODUCTION']:
    @app.route('/contributors')
    def contributors():
        '''Route to display contributors page.'''
        if g.user:
            get_user_info()
        return render_template('contributors.html')


@app.errorhandler(GitHubError)
def jumpship(e):
    print('jumpship! ', e)
    session.pop('user_id', None)
    flash('Something bad happened. Please try again?', 'error')
    return redirect(url_for('index'))


@app.errorhandler(404)
def not_found(err):
    message = "We can't find what you are looking for."
    return render_template('error.html',
                           error_code=404,
                           error_message=message), 404


@app.errorhandler(500)
def this_is_not_good(err):
    message = "Internal Server Error"
    return render_template('error.html',
                           error_code=500,
                           error_message=message), 500
