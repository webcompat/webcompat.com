# Contributions Guidelines

You are welcome to contribute to this project. Here are the guidelines we try to stick to in this project.

 * [Question or Problem?](#question-or-problem)
 * [Issues and Bugs](#filing-an-issue)
 * [Triaging Issues](#triaging-issues)
 * [Feature Requests](#feature-requests)
 * [Submission Guidelines](#submission-guidelines)


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

## Feature Requests

You can request a new feature by [submitting an issue](#filing-an-issue) to our repo.  If you
would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first in an issue or irc so that we can better coordinate our efforts, prevent
duplication of work, and help you to craft the change so that it is successfully accepted into the
project.
* **Small Changes** can be crafted and submitted as a Pull Request.


## Submission Guidelines

All code contributions should come in the form of a [pull request](https://help.github.com/articles/creating-a-pull-request), as a topic branch. You'll probably want to [set up a local development environment](#working-environment-setup) to get that far.

* Have a quick search through existing issues and pull requests so you don't waste any of your time.
* Make your changes in a new branch

	`git checkout -b name-of-fix-branch master`

* Create your patch; commit your changes

	`git commit -a`

* Push your branch to GitHub:

	`git push origin name-of-fix-branch`

* In GitHub, send a pull request to `webcompat.com:dev.webcompat.com`*.

To do this, click on the Edit button at the top.

![master](https://i.cloudup.com/tgBan6xVWt-2000x2000.png)

Select the `dev.webcompat.com` branch on the left hand side.

![change](https://i.cloudup.com/TZGd2ze3DL-2000x2000.png)

And you should be good to go.

![ready](https://i.cloudup.com/gE8awVDEyE-2000x2000.png)

* Continue discussion in the pull request.

After all that, if you'd like, you can add your name to our humans.txt file.

* `dev.webcompat.com` is our "development" branch where we can test, experiment, and deploy changes to dev.webcompat.com before merging into `master` and pushing to webcompat.com.

## Coding Style
It's still early days for this project, so there are no strict coding guidelines (yet?).

All Python code should pass [pep8](http://pep8.readthedocs.org/en/1.4.6/intro.html).

When in doubt, follow the conventions you see used in the source already.


## Working Environment setup

If you'd like to run the site locally, here's how you can get set up (which should work on Mac and Linux operating systems&mdash;instructions for Windows would make a great first contribution to this project!)

The only requirement is having [pip installed](http://pip.readthedocs.org/en/latest/installing.html) and, of course Python. If you want to test issue submission, you need to [get the secrets](https://github.com/webcompat/webcompat.com/blob/dev.webcompat.com/config.py.example#L24-L38) for config.py and provide pointers to [repo issues URIs](https://github.com/webcompat/webcompat.com/blob/dev.webcompat.com/config.py.example#L40-L44).

``` bash
# Install virtualenv
[sudo] pip install virtualenv
```

Now let's move on the steps to grab the source code locally and work in a protected environment of python.

``` bash
# clone the repo
git clone git@github.com:webcompat/webcompat.com.git
# change to directory
cd webcompat.com
# set up virtual environment
virtualenv env
source env/bin/activate
# install dependencies
pip install -r requirements.txt
# set up config.py, filling in appropriate secrets and pointers to repos
cp config.py.example config.py
# start local server
python run.py
```

You should now have a local instance of the site running at `http://127.0.0.1:5000/`. Please [file bugs](https://github.com/webcompat/webcompat.com/issues/new) if something went wrong!

## Installing Grunt

We use [Grunt](http://gruntjs.com/) as a task runner to perform certain things (minify + concat JS assets, for example).

You need to have [Node.js](http://nodejs.org/download/) installed to be able to run Grunt. Once that's done, use `npm` to install the grunt dependencies. Version 0.10.0 or above is required.

First install the `grunt-cli` tool:

`npm install -g grunt-cli`

Then, from the project root:

`npm install`

You can then use the `grunt` command to run grunt tasks. `grunt --help` will list all the tasks.

### Acknowledgements
A lot of this document was inspired directly by the excellent [Backbone.LayoutManager](https://github.com/tbranyen/backbone.layoutmanager/blob/master/CONTRIBUTING.md), [CouchDB](https://github.com/apache/couchdb/blob/master/src/fauxton/CONTRIBUTING.md), and [Angular.js](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#issue) CONTRIBUTING files.

