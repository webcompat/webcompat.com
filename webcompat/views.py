#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import json
import os
import sys
import time
import urllib
from flask import (flash, g, redirect, request, render_template, session,
                   url_for, abort)
from flask.ext.github import GitHubError
from form import (build_formdata, get_browser, get_os,
                  IssueForm, AUTH_REPORT, PROXY_REPORT)
from hashlib import md5
from helpers import get_user_info
from issues import (report_issue, proxy_report_issue, get_user_issues,
                    get_contact_ready, proxy_get_contact_ready,
                    get_needs_diagnosis, proxy_get_needs_diagnosis,
                    proxy_request)
from models import db_session, User
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
    bug_form.browser.data = get_browser(
        request.headers.get('User-Agent'))
    bug_form.os.data = get_os(
        request.headers.get('User-Agent'))
    # GET means you want to file a report.
    if request.method == 'GET':
        if g.user:
            try:
                get_user_info()
                user_issues = get_user_issues(session['username'])
            except GitHubError:
                e = sys.exc_info()
                print('GitHubError: ', e)
            contact_ready = get_contact_ready()
            needs_diagnosis = get_needs_diagnosis()
        else:
            user_issues = []
            contact_ready = proxy_get_contact_ready()
            needs_diagnosis = proxy_get_needs_diagnosis()
        return render_template('index.html', form=bug_form,
                               user_issues=user_issues,
                               contact_ready=contact_ready,
                               needs_diagnosis=needs_diagnosis)
    # Form submission.
    elif request.method == 'POST' and bug_form.validate():
        if request.form.get('submit-type') == AUTH_REPORT:
            if g.user:  # If you're already authed, submit the bug.
                response = report_issue(request.form)
                return redirect(url_for('thanks',
                                number=response.get('number')))
            else:  # Stash form data into session, go do GitHub auth
                session['form_data'] = request.form
                return redirect(url_for('login'))
        elif request.form.get('submit-type') == PROXY_REPORT:
            # `response` here is a Requests Response object, because
            # the proxy_report_issue crafts a manual request with Requests
            response = proxy_report_issue(request.form)
            return redirect(url_for('thanks', number=response.get('number')))
    else:
        # Validation failed, re-render the form with the errors.
        return render_template('index.html', form=bug_form)


@app.route('/issues')
def show_issues():
    return redirect(url_for('index'), code=307)


@app.route('/issues/<number>')
def show_issue(number):
    '''Route to display a single issue.'''
    if not number.isdigit():
        abort(404)
    if g.user:
        get_user_info()
    # temporarily provide a link to github (until we can modify issues)
    uri = 'https://github.com/{0}/{1}'.format(app.config['ISSUES_REPO_URI'], number)
    return render_template('issue.html', number=number, uri=uri)


@app.route('/api/issues/<number>')
def proxy_issue(number):
    '''XHR endpoint to get issue data from GitHub, either as an authed
    user, or as one of our proxy bots.'''
    if not number.isdigit():
        abort(404)
    if request.is_xhr and request.headers.get('accept') == 'application/json':
        if g.user:
            issue = github.get('repos/{0}/{1}'.format(
                app.config['ISSUES_REPO_URI'], number))
        else:
            issue = proxy_request('get', '/{0}'.format(number))
        return json.dumps(issue)
    else:
        abort(406)


@app.route('/api/issues/<number>/comments')
def proxy_comments(number):
    '''XHR endpoint to get issues comments from GitHub, either as an authed
    user, or as one of our proxy bots.'''
    if not number.isdigit():
        abort(404)
    if request.is_xhr and request.headers.get('accept') == 'application/json':
        if g.user:
            comments = github.get('repos/{0}/{1}/comments'.format(
                app.config['ISSUES_REPO_URI'], number))
        else:
            comments = proxy_request('get', '/{0}/comments'.format(number))
        return json.dumps(comments)
    else:
        abort(406)


@app.route('/thanks/<number>')
def thanks(number):
    if number.isdigit():
        issue = number
        uri = u"http://webcompat.com/issues/{0}".format(number)
        text = u"I just filed a bug on the internet: "
        encoded_issue = urllib.quote(uri.encode("utf-8"))
        encoded_text = urllib.quote(text.encode("utf-8"))
    else:
        abort(404)
    if g.user:
        get_user_info()
    return render_template('thanks.html', number=issue,
                           encoded_issue=encoded_issue,
                           encoded_text=encoded_text)


@app.route('/about')
def about():
    if g.user:
        get_user_info()
    return render_template('about.html')


@app.route('/privacy')
def privacy():
    if g.user:
        get_user_info()
    return render_template('privacy.html')


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
def not_found(err):
    message = "Internal Server Error"
    return render_template('error.html',
                           error_code=500,
                           error_message=message), 500
