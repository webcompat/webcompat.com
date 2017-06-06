* [Pull Request Guidelines](#pull-request-guidelines)
* [Coding Style and Project Conventions](#coding-style-and-project-conventions)

## Pull Request Guidelines

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

## Coding Style and Project Conventions

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

#### Linting

To make it easier for everyone to contribute, we use [eslint](http://eslint.org/) to keep the code base steady. You can view the rules in our [ESLint config](https://github.com/webcompat/webcompat.com/blob/master/.eslintrc#L34). For further explanation of the rules, please have a look at the [ESLint documentation](http://eslint.org/docs/rules/).

For the linting process, we use [Prettier](http://jlongster.com/A-Prettier-Formatter).

In order to avoid errors during a Pull Request, `npm run lint` will be executed before each commit.

`npm run lint` checks all relevant JavaScript files and displays, if something needs to be fixed.

If you get an error displayed, there are two ways to fix it.
1. You can run `npm run fix` automatically, which is great for small issues like missing spaces or lines in various files.
2. You can correct it manually as every error message includes the file and line of the error as well as the rule which was violated will be displayed..

Hopefully this will help you clear up a few struggles.
