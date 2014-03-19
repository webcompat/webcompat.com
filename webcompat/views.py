# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from webcompat import github, app
from flask import (g, redirect, url_for, request, session, render_template,
                   render_template_string)
from flask.ext.github import GitHub
from models import db_session, User


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


@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    if request.method == 'POST' and g.user:
        # um, validation. probably should use wtfform?
        if request.form['title'] is not None:
            title = request.form['title']
        body = request.form['body']
        github.post('repos/miketaylr/nobody-look-at-this/issues',
                    {'title': title, 'body': body})
        return "something useful like a link"

    elif request.method == 'GET':
        if g.user:
            user_info = github.get('user')
            return render_template('index.html',
                                   person=user_info.get('login'),
                                   gravatar=user_info.get('gravatar_id'))
        else:
            t = 'Hello! <a href="{{ url_for("login") }}">Login</a>'
            return render_template_string(t)


@github.access_token_getter
def token_getter():
    user = g.user
    if user is not None:
        return user.github_access_token


# This is the OAuth2 callback handler that Github requires.
@app.route('/callback')
@github.authorized_handler
def authorized(access_token):
    if access_token is None:
        return 'OH CRAP'

    user = User.query.filter_by(github_access_token=access_token).first()
    if user is None:
        user = User(access_token)
        db_session.add(user)
    user.github_access_token = access_token
    db_session.commit()

    session['user_id'] = user.id
    return redirect(url_for('index'))


@app.route('/login')
def login():
    if session.get('user_id', None) is None:
        return github.authorize('public_repo')
    else:
        return 'Already logged in'


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))


@app.errorhandler(404)
def not_found(err):
    return render_template('404.html'), 404
