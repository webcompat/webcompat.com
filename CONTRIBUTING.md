# Contributions Guidelines

You are welcome to contribute to this project. Here are the guidelines we try to stick to in this project.


* [Questions or Problems](#questions-or-problems)
* [Filing an Issue](#filing-an-issue)
* [Triaging Issues](#triaging-issues)
  * [Closing Bugs as Invalid](#closing-bugs-as-invalid)
* [Finding an Issue to Work On](#finding-an-issue-to-work-on)
* [Feature Requests](#feature-requests)
* [Submission Guidelines](#submission-guidelines)
* [Coding Style](#coding-style)
* [Working Environment setup](#working-environment-setup)
  * [Simple setup](#simple-setup-mac-os-and-linux)
    * [Installing Project source code](#initializing-project-source-code)
  * [Detailed setup](#detailed-setup-all-platforms)
    * [Installing pip](#installing-pip)
    * [Installing virtualenv](#installing-virtualenv)
    * [Installing Project source code](#installing-project-source-code)
    * [Installing Grunt](#installing-grunt)
  * [Configuring The Server](#configuring-the-server)
  * [Starting The Server](#starting-the-server)
  * [Building the Project](#building-the-project)
* [Coding](#coding)
* [Running Tests](#running-tests)
  * [Functional Tests](#functional-tests)
  * [Functional Tests using Fixture Data](#functional-tests-using-fixture-data)
* [Writing Tests](#writing-tests)
  * [Python Unit Tests](#python-unit-tests)
  * [JS Functional Tests](#js-functional-tests)
* [Production Server Setup](#production-server-setup)
* [Acknowledgements](#acknowledgements)


## Questions or Problems

If you have a question about the site or about web compatibility in general, feel free to join us in the #webcompat channel on the Mozilla IRC network. [Here's how to join](https://wiki.mozilla.org/IRC#Connect_to_the_Mozilla_IRC_server).

Otherwise, you can try to ping Mike Taylor on the Freenode network with the following command `/msg miketaylr Hi, I have a question about webcompat.com`.

## Filing an Issue

If you're using webcompat.com and something is confusing, broken, or you think it could be done in a better way, please let us know. Issues are how the project moves forward&mdash;let us know what's bothering you.

* Search the [issues list](https://github.com/webcompat/webcompat.com/issues) for existing similar issues.  Consider adding to an existing issue if you find one.
* Choose a descriptive title.
* Provide a test, snippet of code or screenshot that illustrates the problem. This small gesture goes a long way towards getting a speedy fix.

## Triaging Issues

One way to contribute is to triage issues. This could be as simple as confirming a bug, or as complicated as debugging errors and providing fixes. A tiny bit of effort in someone else's issue can go a long way.

### Closing Bugs as Invalid

The wiki contains a [list of reasons why bugs might be closed as invalid](https://github.com/webcompat/webcompat.com/wiki/Invalid-Bugs). When in doubt, ask questions in the bug.

## Finding an Issue to Work On

The logic for the issue tracker is this -
* [*Milestones*](https://github.com/webcompat/webcompat.com/milestones) - initiatives in priority order (ignore the dates)
* [*Unprioritized*](https://github.com/webcompat/webcompat.com/milestones/Unprioritized%20issues) - new ideas, cool things, easy issues to tackle

Anything labeled ["status: good-first-bug"](https://github.com/webcompat/webcompat.com/labels/status:%20good%20first%20bug) is perfect for getting started!

> Note: We do not recommend working on more than two `good-first-bugs`. Take it slow and your time to get into the projects own flow. 


## Feature Requests

You can request a new feature by [submitting an issue](#filing-an-issue) to our repo.  If you would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first in an issue or irc so that we can better coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is successfully accepted into the project.
* **Small Changes** can be crafted and submitted as a Pull Request.


## Submission Guidelines

All code contributions should come in the form of a pull request, as a topic branch.

1. Have a quick search through existing issues and pull requests so you don't waste any of your time.

2. If no existing issue covers the change you want to make, please [open a new issue](https://github.com/webcompat/webcompat.com/issues/new) before you start coding.

3. Fork repository

    ![master](http://f.cl.ly/items/1E3f0A0I2A2b3T2L2I2c/forked.png)

    You'll probably want to [set up a local development environment](#working-environment-setup) to get that far. If you've already been through this process, make sure you've [set the main repo as an upstream remote](https://help.github.com/articles/configuring-a-remote-for-a-fork/) and make sure [your fork is up to date](https://help.github.com/articles/syncing-a-fork/) before sending pull requests.

4. Make your changes in a new branch

    ```bash
    # makes sure, you are on the master branch
    git checkout master 
    
    # if you are SURE your fork is up-to-date
    git pull origin master
    
    # OR 
    # if you are NOT SURE your fork is up-to-date
    git pull upstream master  
    
    # creates new branch
    git checkout -b issues/NumberOfIssue/VersionOfPR  
    ```

5. Create your patch; commit your changes. Referencing the issue number you're working on from the message is recommended.

    > Note: Please keep the title under 50 chars. If you'd like to provide more information, just add the details to the commit body.
    
    ```bash
    # check for changed files
    git status
    
    # add files to commit, e.g. as following
    git add file.js foldername/foldername2/file2.js 
    
    # add commit message including issue number
    git commit -m 'Issue #NumberOfIssue - Fixes broken layout on mobile browsers'    
    ```
    
6. Push your branch to GitHub:

    `git push origin issues/NumberOfIssue/VersionOfPR`

7. If you want to discuss your code or ask questions, please comment in the corresponding issue. You can link to the code you have pushed to your repository to ask for code review.

8. When your code is ready to be integrated into the project, use the GitHub site to send a [pull request](https://help.github.com/articles/creating-a-pull-request) to `webcompat.com:master`, aka the master branch of the repo you forked from. This will be the default choice.

    ![master](https://cldup.com/YVlLDGItPf-3000x3000.png)

9. Set the title of the pull request to reference the issue number. Please keep the title short, but descriptive or it will be cut off. You can provide further information in the commit body.

    `Fixes #NumberOfIssue - Fixes broken layout on mobile browsers`
    > Note: `Fix` or `Fixes` are keywords recognized automatically and will close the issue when the pull request gets merged.

10. When sending the pull request do not forget to call out someone for review by using the following convention:

    `r? @miketaylr`

    This will notify the person that your request is waiting for a review for merging. Ask a review only by one person, this will avoid misunderstandings and the ball is dropped. (Python: karlcow, miketaylr. JavaScript: magsout, miketaylr, tagawa, zoepage CSS: magsout, zoepage).

11. Continue discussion in the pull request.

    The discussion might lead to modify or abandon this specific pull request. This is the place where you can have a code review.

12. Once the Pull Request **got an explicit `r+`** from the reviewer(s), it is the responsibility of the reviewer (or the admin) to merge the branch. A pull request submitter should never merge the pull request themselves.

    The repo owners might choose to self-merge for urgent security or hot fixes.


After all that, if you'd like, you can send a pull request to add your name to our humans.txt file.

For product and design contributions, check out the [Design Repo](https://github.com/webcompat/design).

## Coding Style

### Syntax

 Try to take care to follow existing conventions. Some of these are defined in an [.editorconfig](https://github.com/webcompat/webcompat.com/blob/master/.editorconfig) file. You can download the plugin for your editor here http://editorconfig.org/#download.

### Python
As we are still very early in the project, we do not yet have that many conventions for naming, routes, APIs. If in doubt, ask us or open an issue.  All Python code should pass [pep8](http://pep8.readthedocs.org/en/1.4.6/intro.html).

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
We use cssnext as a tool for compiling css.

```
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

The js folder contains two subfolders: `lib` contains all project source files and `vendor` contains all third party libraries. The files out of the two sub folders contain the compiled source code.

> Note: All code changes should be made to the files in `lib`

@@something to write by miketaylr@@

## Working Environment setup

For testing code locally, you will need a very basic setup. There are a few requirements. These instructions have been made for working with Linux, Windows and MacOSX. You need:

* [Python](https://www.python.org/) 2.7
* [Node.js](https://nodejs.org/en/download/) Current LTS version
* [Github](https://github.com) account

> Note: If you install Python on Windows using the MSI installer, it is highly recommended to check the "Add to path"-box during installation. If you have not done so, see if one of the answers to the StackOverflow post [Adding Python path on Windows 7](http://stackoverflow.com/questions/6318156/adding-python-path-on-windows-7) can help you - it should also work fine for later versions of Windows.
>
> Windows typically doesn't have the *make* tool installed. Windows users without *make* should look at the "detailed setup" section below.
>
> As an alternative to Windows, a cloud IDE such as [Cloud 9](https://c9.io) can be used for a relatively easier setup. If you take this route, please update to the latest Python version with the following. (This is to avoid `InsecurePlatformWarning` errors that arise when the default Python 2.7.6 is used).

```
sudo apt-add-repository ppa:fkrull/deadsnakes-python2.7
sudo apt-get update
sudo apt-get install python2.7 python2.7-dev
```

In Ubuntu, sometimes even after installing Node.js, the command `node -v` does not show the installed version. To complete installation, a symbolic link has to be created to the sbin folder.

```
#remove old symbolic links if any
sudo rm -r /usr/bin/node

#add new symbolic link
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo ln -s /usr/bin/nodejs /usr/sbin/node
```


### Simple setup (Mac OS and Linux)
#### Initializing Project source code

We use [Grunt](http://gruntjs.com/) as a task runner to perform certain things (minify + concat JS assets, for example). You need to have [Node.js](https://nodejs.org/en/download/) to be able to run Grunt.

```bash
# clone the repo
git clone https://github.com/<username>/webcompat.com.git #replace your github username
# change to directory
cd webcompat.com
# check out submodules
npm run module
# initializing project
npm run setup
```

**Note**: if you got an error message, you may need to [install pip](#installing-pip) before running `make install` again.

**Note**: if you get an error message about missing rights to install the setup through npm, please *do not run `sudo npm`*. You just need to [fix you permissions](https://coderwall.com/p/t2mc9g/don-t-sudo-npm) for `usr/local`.

### Detailed setup (All platforms)
#### Installing pip

We use `pip` to install other Python packages. You may need to install `pip` if you haven't done so for another project or Python development.

To determine if you need to install pip, type the following command into the terminal:

```bash
pip --version
```

If you get an error message, Mac/Linux users can try to install `pip` with this command:

```bash
# (Mac/Linux)
sudo easy_install pip
```

(If `easy_install` isn't installed, you'll need to [install setuptools](https://pypi.python.org/pypi/setuptools#unix-wget).)

Windows users should simply download the most recent Python 2.7 installer and run it again, it installs `pip` by default.

#### Installing virtualenv
[Virtual Environment]( https://virtualenv.pypa.io/en/stable/) is a tool to create isolated environments for different projects so as to prevent conflicts.

```bash
# Install virtualenv
[sudo] pip install virtualenv
```

#### Installing Project source code

```bash
# clone the repo. Change username to your Github username
git clone git@github.com:username/webcompat.com.git
# change to directory
cd webcompat.com
# check out submodules
git submodule init
git submodule update
# set up virtual environment
[sudo] virtualenv env
source env/bin/activate
# install Pillow image lib dependencies (if you plan on hacking on image upload features)
#  OSX: http://pillow.readthedocs.org/en/3.0.x/installation.html#os-x-installation
#  Windows: http://pillow.readthedocs.org/en/3.0.x/installation.html#windows-installation
#  Linux: http://pillow.readthedocs.org/en/3.0.x/installation.html#linux-installation
# install rest of dependencies
pip install -r config/requirements.txt
# In Ubuntu: if ImportError: No module named flask.ext.github occurs, it means the dependencies in requirements.txt are installed in /usr/lib instead of <project_repository>/env/python<version>/site-packages.
# In this case, use virtual environment's pip from <project_repository>/env/lib/pip folder of the project repository instead of the global pip.
```


#### Installing Grunt

We use [Grunt](http://gruntjs.com/) as a task runner to perform certain tasks (minify + concat JS assets, for example). You need to have [Node.js](https://nodejs.org/en/download/) installed to be able to run Grunt. Once that's done, `npm` can be used to install Grunt and other build dependencies.


Install npm dependencies:

```bash
npm install
```

Then run grunt through npm (if you miss this step, when you try to start the server and view the site locally or run functional tests, you won't get the css!):

```bash
npm run build
```

**Note**: if you get an error message about missing rights to install the setup through npm, please *do not run `sudo npm`*. You just need to [fix you permissions](https://coderwall.com/p/t2mc9g/don-t-sudo-npm) for `usr/local`.

### Configuring The Server

To test issue submission, you need to create a repository on GitHub. Create a new repository make note of the name. For example, the user `miketaylr` has created a repository called "[test-repo](https://github.com/miketaylr/test-repo)" for this purpose.

```bash
# set up secrets.py, filling in appropriate secrets and pointers to repos
# Mac / Linux
cp config/secrets.py.example config/secrets.py
# Windows
copy config/secrets.py.example config/secrets.py
```

> Note: If you are using Cloud 9, you have to update run.py and replace `app.run(host=os.getenv("IP", "0.0.0.0"), port=int(os.getenv("PORT", 8080)))`.

You can now edit `secrets.py` and

1. Add the right values to the repo issues URIs. `ISSUES_REPO_URI = "<user>/<repo>/issues"`. For example, miketaylr's setup needs to say `ISSUES_REPO_URI = "miketaylr/test-repo/issues"`

2. You have the option of creating a "bot account" (a dummy account for the purpose of testing), or using your own account for local development. Either way, you'll need a personal access token to proceed &mdash; this is the oauth token we use to report issues on behalf of people who don't want to give GitHub oauth access (or don't have GitHub accounts).

  The [instructions for creating a personal access token](http://help.github.com/articles/creating-an-access-token-for-command-line-use) are given on GitHub. Select public_repo to grant access to the public repositories through the personal access token.  Once you have created the token you can add it in the variable `OAUTH_TOKEN = ""`. More advanced users might want to create an environment variable called `OAUTH_TOKEN`. Either way is fine.

3. Add the client id and client secret to secrets.py. If you're part of the webcompat GitHub organization, you can [get the client id and client secret from GitHub](https://github.com/organizations/webcompat/settings/applications/). Otherwise, create your own test and production applications ([instructions here](https://github.com/settings/applications/new)) &mdash; when prompted for a "Authorization callback URL", use `http://localhost:5000/callback`,(Cloud 9 users should use `http://yourapp.c9users.io:8000/callback`instead) and take note of the client id and client secret GitHub gives you.

  When you have the client id and client secret put them in the corresponding lines in secrets.py for the localhost application:

  ```
  # We're running on localhost, use the test application
  GITHUB_CLIENT_ID = os.environ.get('FAKE_ID') or "<client id goes here>"
  GITHUB_CLIENT_SECRET = os.environ.get('FAKE_SECRET') or  "<client secret goes here>"
  ```

  > Note: You can ignore the `FAKE_ID` and `FAKE_SECRET` environment variables, we use that as a hack for automated tests.

4. Click on login to authorize the application and get access to the issues.
![Login](https://cldup.com/HHtMlPhAod.png) 


> **Note**: If you get a 404 at GitHub when clicking "Login", it means you haven't filled in the `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET` in secrets.py.

![Auth 404](https://i.cloudup.com/8FDA5bVc7l.png)

### Starting The Server

```bash
# start local server
python run.py
```

or

```bash
# start local server
npm run start
```

You should now have a local instance of the site running at `http://localhost:5000/`. Please [file bugs](https://github.com/webcompat/webcompat.com/issues/new) if something went wrong!

### Building the Project

After certain kinds of changes are made, you need to build the project before serving it from a webserver will work

* CSS: a build will run cssnext, combine custom media queries, and concat all source files into webcompat.dev.css. You'll need to re-build the CSS to see any changes, so it's recommended to use a watch task (see `npm run watch`).
* JS: a build will run eslint, minify and concat source files.
* HTML templates: the changes should be served from disk without the need for rebuilding
* Python: the Flask local server will detect changes and restart automatically. No need to re-build.

You can build the entire project (CSS and JavaScript files and optimize images) by executing this command on Mac/Linux:

```bash
npm run build
```

and this command on Windows:

```bash
npm run watch
```

## Coding

Build the entire project (CSS and JavaScript files and optimize images) on the fly everytime you save a file to see changes immediately.

```bash
# watching CSS and JS
npm run watch
```

Linting static JS files with project coding styles.

```bash
# linting style JS
npm run lint
```

Fixing static JS files with project coding styles, if an error occurs.

```bash
# fixing linting style JS
npm run fix
```

By default, a build will *not* optimize images (which is done before deploys). If you'd like to optimize images, you can run `npm run imagemin`.

## Running Tests

You can run the Python unit tests from the project root with the `nosetests` command.

Running functional tests is a bit more involved (see the next section).

Tests are also run automatically on [Travis](https://travis-ci.org/webcompat/webcompat.com) for each commit. If you would like to skip running tests for a given commit, you can use use the magical `[ci skip]` string in your commit message. See the [Travis docs](http://docs.travis-ci.com/user/how-to-skip-a-build/#Not-All-Commits-Need-CI-Builds) for more info.

### Functional Tests

We use [Intern](http://theintern.io/) to run functional tests.

> Note: This version is known to work with Firefox 50.1.0. If things aren't working with the current stable version of Firefox, please [file a bug!](https://github.com/webcompat/webcompat.com/issues/new).

Be sure that you have installed local npm dependencies and run the build before trying to run functional tests - if not, you will notice problems with the css. [See dev env setup](#installing-grunt) for details.


#### Installing Java

> Java is used to run Selenium functional tests. Version 1.8.0+ is required.

To test if your version of Java is recent enough, type the `java -version` into your terminal.

```
> java -version
java version "1.8.0_51"
Java(TM) SE Runtime Environment (build 1.8.0_51-b16)
Java HotSpot(TM) 64-Bit Server VM (build 25.51-b03, mixed mode)
```

##### OS X:

Download from [java.com/en/download/](https://www.java.com/en/download/).

##### Ubuntu:

```
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer
```

The `firefox` binary will also need to be in your `PATH`. Here's how this can be done on OS X:

```bash
export PATH="/Applications/Firefox.app/Contents/MacOS/:$PATH"
```

If you are a member of webcompat organization in GitHub, edit `config/secrets.py`. The value of `ISSUES_REPO_URI` is the path of the repository containing test issues.

Change the value to : `ISSUES_REPO_URI = 'webcompat/webcompat-tests/issues'`.

Start the application server:

```bash
source env/bin/activate && python run.py
```

In a separate terminal window or tab, run the tests:

```bash
node_modules/.bin/intern-runner config=tests/intern
```

Shortly after running this command, you should see the browser open and various pages appear and disappear automatically for a minute or two. The tests are complete when the browser window closes and you see a report of how many passed or failed in the terminal window that you ran the `intern-runner` command in.

Many tests require the ability to log in with GitHub OAuth. This can be achieved by passing in a valid GitHub username: `user` and password: `pw` as command-line arguments:

```bash
node_modules/.bin/intern-runner config=tests/intern user=testusername pw=testpassword
```

**Note** Be aware that this will add the `testusername` and `testpassword` to your bash history. It is possible to run the tests without using a GitHub username and password as command-line arguments. In that case, the automatic login will fail and you then have 10 seconds to manually enter a username and password in the GitHub login screen that appears.

```bash
node_modules/.bin/intern-runner config=tests/intern user=testusername pw=testpassword
```

This will give you 10 extra seconds to enter a 2FA token when the inital login happens. By default there is no delay, so if you don't need this &mdash; you don't need to do anything differently.

To run a single test suite, where foo.js is the file found in the `tests/functional` directory:

```bash
node_modules/.bin/intern-runner config=tests/intern functionalSuites=tests/functional/foo.js user=testusername pw=testpassword
```

## Functional Tests using Fixture Data

It's possible to mock the communications with GitHub API servers using local fixture data. To run tests using these mocked repsonses, run the server in "test mode":

```bash
python run.py -t
```

You can then run intern tests or do local development and the files in the `/tests/fixtures/` directory will be served as responses.

## Adding Fixtures

To indicate that the app should send fixture data, use the `@mockable_response` decorator for an API endpoint.

If the endpoint you are trying to mock has `GET` parameters, you will need to create a file that has the `GET` parameters encoded in the filename. The source of `@mockable_repsonse` explains how this is done:

```python
if get_args:
    # if there are GET args, encode them as a hash so we can
    # have different fixture files for different response states
    checksum = hashlib.md5(json.dumps(get_args)).hexdigest()
    file_path = FIXTURES_PATH + request.path + "." + checksum
    print('Expected fixture file: ' + file_path + '.json')
```

You can look at the server console's `Expected fixture file:` message to know what file it is expecting.

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
buffer-size = 8192
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
buffer-size = 8192
```

Hopefully this will help you clear up a few struggles.

## Acknowledgements
A lot of this document was inspired directly by the excellent [Backbone.LayoutManager](https://github.com/tbranyen/backbone.layoutmanager/blob/master/CONTRIBUTING.md) and [Angular.js](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#issue) CONTRIBUTING files.