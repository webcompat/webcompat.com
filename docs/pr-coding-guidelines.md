- [Pull Request Guidelines](#pull-request-guidelines)
  - [Make your changes in a new branch](#make-your-changes-in-a-new-branch)
  - [Edit and prepare for the commit](#edit-and-prepare-for-the-commit)
  - [Add commit message including issue number](#add-commit-message-including-issue-number)
  - [Push your branch to GitHub on your fork](#push-your-branch-to-github-on-your-fork)
  - [Send a pull request](#send-a-pull-request)
  - [Asking for review](#asking-for-review)
- [Coding Style and Project Conventions](#coding-style-and-project-conventions)
  - [Syntax](#syntax)
  - [Python](#python)
  - [CSS](#css)
    - [Naming conventions](#naming-conventions)
    - [CSS and JS](#css-and-js)
    - [Folder and file](#folder-and-file)
    - [Framework, plugin](#framework-plugin)
  - [Javascript](#javascript)
    - [Linting](#linting)

## Pull Request Guidelines

All code contributions should come in the form of a pull request, as a topic branch.

1. Have a quick search through existing issues and pull requests so you don't waste any of your time.
2. If no existing issue covers the change you want to make, please [open a new issue](https://github.com/webcompat/webcompat.com/issues/new) before you start coding.
3. Fork repository

    ![master](http://f.cl.ly/items/1E3f0A0I2A2b3T2L2I2c/forked.png)

    You'll probably want to [set up a local development environment](#working-environment-setup) to get that far. If you've already been through this process, make sure you've [set the main repo as an upstream remote](https://help.github.com/articles/configuring-a-remote-for-a-fork/) and make sure [your fork is up to date](https://help.github.com/articles/syncing-a-fork/) before sending pull requests.

### Make your changes in a new branch

 ```bash
 # makes sure, you are on the master branch
 git checkout master

 # if you are SURE your fork is up-to-date
 git pull origin master

 # OR
 # if you are NOT SURE your fork is up-to-date
 git pull upstream master

 # creates new branch
 git checkout -b Issue_Number/PR_Version
 # For example:
 # git checkout -b 4567/1
 # Issue 4567
 # First attempt at a PR
 ```

### Edit and prepare for the commit

Start editing the code with your favorite editor. Try as much as possible to be atomic in your commit. For example, you might want to add tests and commit them together (See below for the commit message format). Then continue coding the functions that will make the tests pass and commit this.

Check the files which have been modified, erased or added.

```bash
# check for changed files
git status
```

Add the files which are new.

```bash
 # add files to commit, e.g. as following
 git add file.js foldername/foldername2/file2.js
```


### Add commit message including issue number

```bash
git commit -m 'Issue #4567 - Fixes broken layout on mobile browsers'
```

Probably one of the most important sections if you want to avoid nitpicking on the code review. Commit messages **must** be written according to the following template:

1. The text `Issue` followed by the number of the issue with a hash sign: `Issue #4567`
2. a space, a dash and a space ` - `
3. A short message explaining what the commit does. Start if possible by a verb explaining what the code does, not what you did. For example, `Adds this feature` instead of `Adding this feature`. Note: Please keep the title under 50 chars. If you'd like to provide more information, just add the details to the commit body.

Summary:

`Issue #NumberOfIssue -  Short message`


### Push your branch to GitHub on your fork

```bash
git push origin Issue_Number/PR_Version
```

If you want to discuss your code or ask questions, please comment in the corresponding issue. You can link to the code you have pushed to your repository to ask for code review. If you are not sure that this is ready, you may open a pull request with a draft status.

### Send a pull request

When your code is ready to be integrated into the project, use the GitHub site to send a [pull request](https://help.github.com/articles/creating-a-pull-request) to `webcompat.com:master`, aka the master branch of the repo you forked from. This will be the default choice.

![master](https://cldup.com/YVlLDGItPf-3000x3000.png)

Set the title of the pull request to reference the issue number. Please keep the title short, but descriptive or it will be cut off. You can provide further information in the commit body.

`Fixes #Issue_Number - Fixes broken layout on mobile browsers`

> Note: `Fix` or `Fixes` are keywords recognized automatically and will close the issue when the pull request gets merged.

### Asking for review

When sending the pull request do not forget to call out someone for review by using the github widget for asking reviewers. This will notify the person that your request is waiting for a review for merging. Ask a review only by one person, this will avoid misunderstandings and the ball is dropped.

* Python: karlcow, miketaylr, ksy36
* JavaScript: magsout, miketaylr, ksy36
* CSS: magsout


Continue discussion in the pull request. The discussion might lead to modify or abandon this specific pull request. This is the place where you can have a code review.

Once the Pull Request **got an explicit positive review** from the reviewer(s) and **circleci automatic tests are green**, it is the responsibility of the reviewer (or the admin) to merge the branch. A pull request submitter should never merge the pull request themselves (even if they have the appropriate rights for it).

The repo owners might choose to self-merge for urgent security or hot fixes.

After all that, if you'd like, you can send a pull request to add your name to our humans.txt file.

For product and design contributions, check out the [Design Repo](https://github.com/webcompat/design).

## Coding Style and Project Conventions

### Syntax

 Try to take care to follow existing conventions. Some of these are defined in an [.editorconfig](https://github.com/webcompat/webcompat.com/blob/master/.editorconfig) file. You can download the plugin for your editor here http://editorconfig.org/#download.

### Python

The project is developed with Python 3.

We do not have that many conventions for naming, routes, APIs. If in doubt, ask us or open an issue. Try to be consistent.  All Python code should pass [pycodestyle](http://pycodestyle.pycqa.org/en/latest/intro.html).

You can check this by installing the pycodestyle module. This is usually installed through the requirements file in the project.  If you wish to install it yourself on your computer, you can do.

    pip install --user pycodestyle

Once at the root of the project you can run it with

    pycodestyle --ignore=E402,W504 webcompat/ tests/

That will show you the list of errors and their explanations. Another tool, we have used for checking consistency of the code is `flake8` + `hacking`. [Hacking](https://github.com/openstack-dev/hacking) is a set of [OpenStack guidelines](http://docs.openstack.org/developer/hacking/) which is used by the community for the stability of their projects. You will see that there's nothing really hard about it.

    pip install --user hacking

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

#### Linting

To make it easier for everyone to contribute, we use [eslint](http://eslint.org/) for JavaScript and [stylelint](https://stylelint.io/) for CSS to keep the code base steady. You can view the JavaScript's rules in our [ESLint config](https://github.com/webcompat/webcompat.com/blob/master/.eslintrc#L34) and the CSS's rules in our [stylelint config](https://github.com/webcompat/webcompat.com/blob/master/.stylelintrc#L3). For further explanation of the rules, please have a look at the [ESLint documentation](http://eslint.org/docs/rules/) and [stylelint documentation](https://stylelint.io/user-guide/rules/).

For the linting process, we use [Prettier](http://jlongster.com/A-Prettier-Formatter).

In order to avoid errors during a Pull Request, `npm run lint` will be executed before each commit.

`npm run lint` checks all relevant JavaScript and CSS files and displays, if something needs to be fixed.

If you get an error displayed, there are two ways to fix it.
1. You can run `npm run lint:fix` automatically, which is great for small issues like missing spaces or lines in various files.
2. You can correct it manually as every error message includes the file and line of the error as well as the rule which was violated will be displayed..

Hopefully this will help you clear up a few struggles.
