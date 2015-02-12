# Contributions Guidelines

You are welcome to contribute to this project. Here are the guidelines we try to stick to in this project.


* [Question or Problem](#question-or-problem)
* [Filing an Issue](#filing-an-issue)
* [Triaging Issues](#triaging-issues)
* [Finding an Issue to Work On](#finding-an-issue-to-work-on)
* [Feature Requests](#feature-requests)
* [Submission Guidelines](#submission-guidelines)
* [Coding Style](#coding-style)
* [Working Environment setup](#working-environment-setup)
  * [Simple setup](#simple-setup)
    * [Installing Project source code](#initializing-project-source-code)
  * [Detailed setup](#detailed-setup)
    * [Installing pip](#installing-pip)
    * [Installing virtualenv](#installing-virtualenv)
    * [Installing Project source code](#installing-project-source-code)
    * [Installing Grunt](#installing-grunt)
  * [Configuring The Server](#configuring-the-server)
  * [Starting The Server](#starting-the-server)
  * [Building Project](#building-project)
* [Coding](#coding)
* [Running Tests](#running-tests)
  * [Functional Tests](#functional-tests)
* [Writing Tests](#writing-tests)
  * [Python Unit Tests](#python-unit-tests)
  * [JS Functional Tests](#js-functional-tests)
* [Production Server Setup](#production-server-setup)
* [Acknowledgements](#acknowledgements)


## Question or Problem

If you have a question about the site or about web compatibility in general, feel free to join us in the #webcompat channel on the Mozilla IRC network. [Here's how to join](https://wiki.mozilla.org/IRC#Connect_to_the_Mozilla_IRC_server).

Otherwise, you can try to ping Mike Taylor on the Freenode network with the following command `/msg miketaylr hi I have a question about webcompat.com`.

## Filing an Issue

If you're using webcompat.com and something is confusing, broken, or you think it could be done in a better way, please let us know. Issues are how the project moves forward&mdash;let us know what's bothering you.

* Search the [issues
  list](https://github.com/webcompat/webcompat.com/issues)
  for existing similar issues.  Consider adding to an existing issue if you
  find one.
* Choose a descriptive title.
* Provide a test, snippet of code or screenshot that illustrates the problem. This small
  gesture goes a long way towards getting a speedy fix.

## Triaging Issues

One way to contribute is to triage issues. This could be as simple as confirming a bug, or as complicated as debugging errors and providing fixes. A tiny bit of effort in someone else's issue can go a long way.

## Finding an Issue to Work On

The logic for the issue tracker is this -
* [*Milestones*](https://github.com/webcompat/webcompat.com/milestones) - initiatives in priority order (ignore the dates)
* [*Unprioritized*](https://github.com/webcompat/webcompat.com/milestones/Unprioritized%20issues) - new ideas, cool things, easy issues to tackle

Anything labeled ["Good-first-patch"](https://github.com/webcompat/webcompat.com/labels/good-first-patch) is perfect for getting started!

## Feature Requests

You can request a new feature by [submitting an issue](#filing-an-issue) to our repo.  If you
would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first in an issue or irc so that we can better coordinate our efforts, prevent
duplication of work, and help you to craft the change so that it is successfully accepted into the
project.
* **Small Changes** can be crafted and submitted as a Pull Request.


## Submission Guidelines

All code contributions should come in the form of a [pull request](https://help.github.com/articles/creating-a-pull-request), as a topic branch.

* Have a quick search through existing issues and pull requests so you don't waste any of your time.

* Fork repository

![master](http://f.cl.ly/items/1E3f0A0I2A2b3T2L2I2c/forked.png)

You'll probably want to [set up a local development environment](#working-environment-setup) to get that far. If you've already been through this process, make sure you've [set the main repo as an upstream remote](https://help.github.com/articles/configuring-a-remote-for-a-fork/) and make sure [your fork is up to date](https://help.github.com/articles/syncing-a-fork/) before sending pull requests.

* Make your changes in a new branch

  `git checkout -b name-of-fix-branch`

* Create your patch; commit your changes. Referencing the issue number you're working on from the message is recommended.

	`git commit -m 'Issue #123 - Fixes broken layout on mobile browsers`

* Push your branch to GitHub:

	`git push origin name-of-fix-branch`

* In GitHub, send a pull request to `webcompat.com:master`, aka the master branch of the repo you forked from. This will be the default choice.

![master](https://cldup.com/YVlLDGItPf-3000x3000.png)

When sending the pull request do not forget to call out someone for review by using the following convention:

`r? @miketaylr`

This will notify the person that your request is waiting for a review for merging. Ask a review only by one person, this will avoid misunderstandings and the ball is dropped. (Python: karlcow, miketaylr. JavaScript: magsout, miketaylr, tagawa CSS: magsout).

* Continue discussion in the pull request.

The discussion might lead to modify or abandon this specific pull request. This is the place where you can have a code review.

After all that, if you'd like, you can send a pull request to add your name to our humans.txt file.

For product and design contributions, check out the [Design Repo](https://github.com/webcompat/design)

## Coding Style

### Syntax

 Try to take care to follow existing conventions. Some of these are defined in an [.editorconfig](https://github.com/webcompat/webcompat.com/blob/master/.editorconfig) file. You can download the plugin for your editor here http://editorconfig.org/#download

### Python
As we are still very early in the project, we do not have yet that much conventions for naming, routes, APIs. In doubt, ask us or open an issue.  All Python code should pass [pep8](http://pep8.readthedocs.org/en/1.4.6/intro.html).

You can check this by installing the pep8 module.

    sudo pip install pep8

Once at the root of the project you can run it with

    pep8 --show-source --show-pep8 .

That will show you the list of errors and their explanations. Another tool, we have used for checking consistency of the code is `flake8` + `hacking`. [Hacking](https://github.com/openstack-dev/hacking) is a set of [OpenStack guidelines](http://docs.openstack.org/developer/hacking/) which is used by the community for the stability of their projects. You will see that there's nothing really hard about it.

    sudo pip install hacking

will install the relevant flake8 and hacking modules. In the same fashion, if you do

    flake8 .

You will get in return the list of mistakes. Some of the basics recommendations are:

* Modules are sorted by alphabetical order.
* Do not do relative imports (such as `from .foo import bar`)
* Import only modules not function name (because of possible name clashes)
* Group modules by categories (sys, libraries, project)
* When multilines docstrings are used. The first sentence is short and explains the module. Separated by a blank line.
* docstrings sentences are finished by a period.

When in doubt, follow the conventions you see used in the source already.

### CSS
We use cssnext as a tool for compiling css

````
This is a CSS transpiler (CSS4+ to CSS3) that allows you to use tomorrow's CSS syntax today. It transforms CSS specs that are not already implemented in popular browsers into more compatible CSS.
```
More info here : https://github.com/cssnext/cssnext

#### Naming conventions

 We use a very simple syntax based on BEM and it looks like:
  - ComponentName
  - ComponentName--modifierName
  - ComponentName-descendantName
  - ComponentName.is-stateOfComponent

#### CSS and JS
All classes that depend on javascript are prefixed by js-* . These classes are handled by JavaScript, no styles are applied.

#### Folder and file
The main stylesheet is main.css. There are @import statements to all other files, which are stored in the folder: Components, Page, layout, vendor.

#### Framework, plugin
We do not use frameworks. However we use libraries, such suitcss-components-grid, suitcss-utils-display.

### Javascript

@@something to write by miketaylr@@

## Working Environment setup

See docs/installation.rst

## Coding


 ``` bash
 # watching CSS and JS
 make watch
 ```


## Running Tests

You can run the Python unit tests from the project root with the `nosetests` command.

Running functional tests is a bit more involved (see the next section).

### Functional Tests

We use [Intern](http://theintern.io/) to run functional tests.

To run them, make sure you download the Selenium standalone server from the repo root:

``` bash
wget http://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar
```

The `firefox` binary will also need to be in your `PATH`. Here's how this can be done on OS X:

``` bash
export PATH="/Applications/Firefox.app/Contents/MacOS/:$PATH"
```

Now start Selenium:

``` bash
java -jar selenium-server-standalone-2.44.0.jar
```

In a separate terminal window or tab, start the application servers:

``` bash
source env/bin/activate && python run.py
```

In another separate terminal window or tab, run the tests:

``` bash
node_modules/.bin/intern-runner config=tests/intern
```

Shortly after running this command, you should see the browser open and various pages appear and disappear automatically for a minute or two. The tests are complete when the browser window closes and you see a report of how many passed or failed in the terminal window that you ran the `intern-runner` command in.

Many tests require the ability to log in with GitHub OAuth. This can be achieved by passing in a valid GitHub username: `user` and password: `pw` as command-line arguments:

``` bash
node_modules/.bin/intern-runner config=tests/intern user=testusername pw=testpassword
```

**Note** Be aware that this will add the `testusername` and `testpassword` to your bash history. It is possible to run the tests without using a GitHub username and password as command-line arguments. In that case, the automatic login will fail and you then have 10 seconds to manually enter a username and password in the GitHub login screen that appears.

## Writing Tests

Contributions that add or modify major functionality to the project should typically come with tests to ensure we're not breaking things (or won't in the future!). There's always room for more testing, so general contributions in this form are always welcome.

### Python Unit Tests

Our Python unit tests are vanilla flavored [`unittest`](https://docs.python.org/2/library/unittest.html) tests. Unit tests placed in the `tests` directory will be automatically detected by nose&mdash;no manual registration is necessary.

Unit tests are preferred for features or functionality that are independent of the browser front-end, i.e., API responses, application routes, etc.

Important documentation links: 
* [Writing nose tests](https://nose.readthedocs.org/en/latest/writing_tests.html)
* [`unittest`](https://docs.python.org/2/library/unittest.html)
* [Testing Flask](http://flask.pocoo.org/docs/0.10/testing/)

### JS Functional Tests

Functional tests are written in JavaScript, using [Intern](http://theintern.io/). There's a nice [guide on the Intern wiki](https://github.com/theintern/intern/wiki/Writing-Tests-with-Intern#functional-testing) that should explain enough to get you started. 

Important documentation links:
* [Leadfoot](https://theintern.github.io/leadfoot/): the library that drives the browser (via Selenium).
* [ChaiJS](http://chaijs.com/api/assert/): the library used for assertions. 
* [Intern wiki](https://github.com/theintern/intern/wiki): contains useful examples. 

It's also recommended to look at the other test files in the `tests/functional` directory to see how things are commonly done.

## Production Server Setup

The current instance of webcompat.com has a nginx front server in front of the Flask application. These are the few things you need to know if you wanted to replicate the current configuration of the server. You will need to adjust for your own environment.

The configuration file is often located at something similar to:

```
/etc/nginx/sites-available/webcompat.com.conf
```

It depends on your local system. So we encourage you to read any documentation of your local server. You would then create a symbolic link to your local /etc/nginx/sites-enabled/. The gist of the nginx configuration file holds into

```nginx
server {
  listen 80;
  root $HOME/webcompat.com;
  error_log $LOGS/nginx-error.log;
  server_name webcompat.com;
  location / {
    # serve static assets, or pass off requests to uwsgi/python
    try_files $HOME/webcompat.com/webcompat/static/$uri $uri @wc;
    }
  location @wc {
    uwsgi_pass unix:///tmp/uwsgi.sock;
    include uwsgi_params;
    }
  }
```

We also have the following content type handlers.

```nginx
##
# Gzip Settings
##

gzip on;
gzip_disable "msie6";

gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_buffers 16 8k;
gzip_http_version 1.0;

# Turn on gzip for all content types that should benefit from it.
gzip_types application/ecmascript;
gzip_types application/javascript;
gzip_types application/json;
gzip_types application/pdf;
gzip_types application/postscript;
gzip_types application/x-javascript;
gzip_types image/svg+xml;
gzip_types text/css;
gzip_types text/csv;
# "gzip_types text/html" is assumed.
gzip_types text/javascript;
gzip_types text/plain;
gzip_types text/xml;
```

We are also using [uWSGI](http://uwsgi-docs.readthedocs.org/en/latest/index.html).

```
upstream uwsgicluster {
  server 127.0.0.1:8080;
}
```

with the following configuration file `uwsgi.conf`

```
# our uWSGI script to run webcompat.com

description "uwsgi service"
start on runlevel [2345]
stop on runlevel [06]

respawn

# .ini files for staging.webcompat.com (staging.ini) and webcompat.com (production.ini) are in $HOME/vassals
exec /usr/local/bin/uwsgi --emperor $HOME/vassals
```

We have been using [uWSGI Emperor](http://uwsgi-docs.readthedocs.org/en/latest/Emperor.html) to manage two environments for staging and production. It gives us the possibility to test features which are not yet fully ready for production without messing the actual site.

`production.ini`

```ini
[uwsgi]

socket = $FOO/uwsgi.sock
chmod-socket = 666
chdir = $HOME/webcompat.com/
env = PRODUCTION=1
master = true
module = webcompat
callable = app
logto = $LOGS/uwsgi.log
```

and `staging.ini`

```ini
[uwsgi]

socket = $FOO/uwsgi2.sock
chmod-socket = 666
chdir = $HOME/staging.webcompat.com/
env = DEVELOPMENT=1
module = webcompat
callable = app
logto = $LOGS/staging-uwsgi.log
```

Hopefully this will help you to clear up a few struggles.

## Acknowledgements
A lot of this document was inspired directly by the excellent [Backbone.LayoutManager](https://github.com/tbranyen/backbone.layoutmanager/blob/master/CONTRIBUTING.md), [CouchDB](https://github.com/apache/couchdb/blob/master/src/fauxton/CONTRIBUTING.md), and [Angular.js](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#issue) CONTRIBUTING files.
