# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from flask import g, redirect, url_for, request, session, render_template
from models import db_session, User
from webcompat import github, app
from datetime import datetime
import os
import template_filters
import time


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


@app.route('/')
@app.route('/index')
def index():
    last_modified = time.ctime(os.path.getmtime(
                               os.path.join(os.getcwd(),
                                            'webcompat/templates/index.html')))
    date_string = datetime.strptime(last_modified, '%a %b %d %H:%M:%S %Y')
    return render_template('index.html', last_modified=date_string)


@app.route('/login')
def login():
    if session.get('user_id', None) is None:
        return github.authorize('public_repo')
    else:
        return 'Already logged in'


# OAuth2 callback handler that GitHub requires.
# If this moves, it needs to change in GitHub settings as well
@app.route('/callback')
@github.authorized_handler
def authorized(access_token):
    if access_token is None:
        # TODO: http://flask.pocoo.org/docs/patterns/flashing/
        # redirect back to index, flash a message that something is wrong.
        return 'OH CRAP'
    user = User.query.filter_by(github_access_token=access_token).first()
    if user is None:
        user = User(access_token)
        db_session.add(user)
    user.github_access_token = access_token
    db_session.commit()

    session['user_id'] = user.id
    return redirect(url_for('new_issue'))


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    # TODO: flash message, "You were successfully logged out"
    return redirect(url_for('index'))


@app.route('/issues')
@app.route('/issues/')
def show_issues():
    return redirect(url_for('new_issue'), code=307)


#TODO: /issues/new/<issue> redirect 307 to github repo issue
@app.route('/issues/new', methods=['GET', 'POST'])
def new_issue():
    if request.method == 'GET':
            if g.user:
                user_info = github.get('user')
                return render_template('new_issue.html',
                                       person=user_info.get('login'),
                                       gravatar=user_info.get('gravatar_id'))
            else:
                return redirect(url_for('login'))

    elif request.method == 'POST' and g.user:
        # um, validation. probably should use wtfform?
        if request.form['title'] is not None:
            title = request.form['title']
        body = request.form['body']
        github.post('repos/miketaylr/nobody-look-at-this/issues',
                    {'title': title, 'body': body})
        return "something useful like a link"


@app.route('/about')
def about():
    return render_template('about.html')


@app.errorhandler(404)
def not_found(err):
    return render_template('404.html'), 404
