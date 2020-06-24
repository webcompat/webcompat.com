- [Development Environment Setup](#development-environment-setup)
  - [Simple setup](#simple-setup)
    - [Fork the webcompat.com project](#fork-the-webcompatcom-project)
    - [Install Python 3.7](#install-python-37)
    - [Install nodejs](#install-nodejs)
    - [Initializing project source code](#initializing-project-source-code)
  - [Detailed setup (all platforms)](#detailed-setup-all-platforms)
    - [Installing Windows Subsystem for Linux](#installing-windows-subsystem-for-linux)
    - [Installing pip](#installing-pip)
    - [Fork the webcompat.com project](#fork-the-webcompatcom-project-1)
    - [Installing project source code](#installing-project-source-code)
    - [Installing npm dependencies](#installing-npm-dependencies)
  - [Configuring the server](#configuring-the-server)
    - [Test repository](#test-repository)
    - [Store your settings](#store-your-settings)
  - [Starting the server](#starting-the-server)
    - [Getting error messages?](#getting-error-messages)
  - [Building the project](#building-the-project)

## Development Environment Setup

For testing code locally, you will need a very basic setup. There are a few requirements. These instructions have been made for working with Linux, Windows and macOS. You need:

- [GitHub account](https://github.com/join)
- [Python](https://www.python.org/) 3.7.3 minimum
- [Node.js](https://nodejs.org/en/download/) (current LTS version)
- [GitHub](https://github.com) account
- [Git](https://git-scm.com/download/win) 2.13.2 minimum

### Simple setup

#### Fork the webcompat.com project

Go to https://github.com/webcompat/webcompat.com/ and click on the Fork button (top right). This will create a copy of the project in your own account environmment on GitHub.

#### Install Python 3.7

This project requires Python 3. This is not available per default on most platforms. You will need to install it on your computer. The [download section](https://www.python.org/downloads/) of the Python website has binaries for most platforms. Choose the 3.7.3 or more version minimum.

#### Install nodejs

This project requires NodeJS for building the application and running certain tests. The NodeJS website provides installers in the [downloads section](https://nodejs.org/en/download/). Choose the [current LTS version](https://nodejs.org/en/about/releases/) if you don't have NodeJS installed, or have an older version.

#### Initializing project source code

Now that you got a copy of the project on your github account, you will clone it locally on your computer. Open a shell console on your computer.

```bash
# clone the repo
# change <username> to your GitHub username
git clone https://github.com/<username>/webcompat.com.git
# change to directory
cd webcompat.com
# initializing project
npm run setup
```

**Note**: if you got an error message, you may need to [install pip](#installing-pip) before running `npm run setup` again.

**Note**: if you get an error message about missing rights to install the setup through npm, please _do not run `sudo npm`_. You just need to [fix your permissions](https://coderwall.com/p/t2mc9g/don-t-sudo-npm) for `usr/local`.

### Detailed setup (all platforms)

#### Installing Windows Subsystem for Linux

Once [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) and Ubuntu distribution are installed, open the Ubuntu terminal and finish any installation prompts, if necessary.

From the terminal, you can install python, pip, and nodejs and npm with the following commands:

```bash
sudo apt-get update
sudo apt-get install python3.7
sudo apt-get install python3-pip
sudo apt-get install nodejs
sudo apt install npm
```

It's a good idea to update npm after this (to speed up `npm install`): `sudo npm install npm -g`

At this point, you can skip over the [Installing pip](#installing-pip) section and continue with the [Installing virtualenv](#installing-virtualenv) directions.

#### Installing pip

We use `pip` to install other Python packages. You may want to check the version of pip associated with your system.

```bash
pip --version
# or in case python2.7 is the default on your system.
pip3 --version
```

If you get an error message, follow the docs on [installing pip](https://pip.pypa.io/en/stable/installing/) for your platform.

**Note**: Windows and Linux users can do the following via the terminal:

```bash
sudo apt install python3-pip
```

#### Fork the webcompat.com project

Go to https://github.com/webcompat/webcompat.com/ and click on the Fork button (top right). This will create a copy of the project in your own account environmment on GitHub.

#### Installing project source code

```bash
# clone the repo (change <username> to your GitHub username)
git clone git@github.com:<username>/webcompat.com.git
# change to project directory
cd webcompat.com
# set up virtual environment. This creates env/ folder which will have all the tools to be able to work with python 3 on your project.
python3 -m venv env
# This will isolate your folder for python modules installation and will remove any uninted effects with other projects.
source env/bin/activate
# optionally install Pillow image lib dependencies (only required if you plan on hacking on image upload features)
#  OSX: https://pillow.readthedocs.io/en/stable/installation.html#macos-installation
#  Windows: https://pillow.readthedocs.io/en/stable/installation.html#windows-installation
#  Linux: https://pillow.readthedocs.io/en/stable/installation.html#linux-installation
# install rest of dependencies
pip install -r config/requirements-dev.txt
# In Ubuntu: if ImportError: No module named flask.ext.github occurs, it means the dependencies in requirements-dev.txt are installed in /usr/lib instead of <project_repository>/env/python<version>/site-packages.
# In this case, use virtual environment's pip from <project_repository>/env/lib/pip folder of the project repository instead of the global pip.
```

#### Installing npm dependencies

We use a handful of npm packages to build the project.

Install npm dependencies:

```bash
npm install
```

When that is done, you can build the site via the `npm run build` command (if you miss this step, when you try to start the server and view the site locally or run functional tests, you won't get the compiled css or templates!):

```bash
npm run build
```

This will be using webpack to compile all the assets and put them in the right directories, you will see a detailed list of output.

**Note**: if you get an error message about missing rights to install the setup through npm, please _do not run `sudo npm`_. You just need to [fix your permissions](https://coderwall.com/p/t2mc9g/don-t-sudo-npm) for `usr/local`.

### Configuring the server

#### Test repository

By default, environment.py sets `ISSUES_REPO_URI` to `webcompat/webcompat-tests/issues` for local development. This way we can file test issues without worrying about making noise in the real issues. You probably don't need to change this.

If you would prefer to have your own sandbox for test issues, you may choose to create a repository on GitHub. For example, the user `miketaylr` has created a repository called "[test-repo](https://github.com/miketaylr/test-repo)" for this purpose.

**Important:** If you create your own test issue repository, it needs to have exactly the same milestones that we have in our [test-repository](https://github.com/webcompat/webcompat-tests/milestones): needstriage, sitewait, duplicate, incomplete, contactready, needscontact, invalid, needsdiagnosis, wontfix, worksforme, non-compat and fixed.

#### Store your settings

Your secrets are stored in `.env` at the root of your project directory. The `.env` file will follow this syntax:

```
# Secrets. DO NOT SHARE.
GITHUB_CLIENT_ID='your_github_id'
GITHUB_CLIENT_SECRET='your_github_secret'
OAUTH_TOKEN='your_token'
SECRET_KEY = 'a_secret_key'
HOOK_SECRET_KEY = 'SECRETS'
```

Do not be afraid to put any secrets in there, this file is part of the `.gitignore` and will not be committed into the code.


1.  You have the option of creating a "bot account" (a dummy account for the purpose of testing), or using your own account for local development. Either way, you'll need a personal access token to proceed – this is the oauth token we use to report issues on behalf of people who don't want to give GitHub OAuth access (or don't have GitHub accounts).

    The [instructions for creating a personal access token](http://help.github.com/articles/creating-an-access-token-for-command-line-use) are given on GitHub. Select public_repo to grant access to the public repositories through the personal access token. Once you have created the token you can add it in the variable `OAUTH_TOKEN = ""`.

2.  Add values for `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Create your own local application ([instructions here](https://github.com/settings/applications/new)) &mdash; when prompted for an "Authorization callback URL", use `http://localhost:5000/callback`, and take note of the client ID and client secret GitHub gives you.

    > **Note**: Cloud 9 users should use `http://yourapp.c9users.io:8000/callback` for the Authorization callback URL instead.

    When you have the client ID and client secret, put them in the corresponding lines in `.env`:

    ```py
    GITHUB_CLIENT_ID='your_github_id'
    GITHUB_CLIENT_SECRET='your_github_secret'
    ```


3.  Click on **Log in** to authorize the application and get access to the issues.
    ![Login](https://cldup.com/HHtMlPhAod.png)

    > **Note**: If you get a 404 at GitHub when clicking **Log in**, it means you haven't filled in the `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET` in `.env`.

    ![Auth 404](https://i.cloudup.com/8FDA5bVc7l.png)


### Starting the server

```bash
# start local server
flask run
```

You should see this:

```
 * Serving Flask app "webcompat:app" (lazy loading)
 * Environment: development
 * Debug mode: on
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
 * Restarting with stat
Writing logs to: /Users/username/code/webcompat.com/tmp
Statuses Initialization…
Oooops.
We can't find /Users/username/code/webcompat.com/data/milestones.json
Double check that everything is configured properly
in .env and try again. Good luck!

Fetching milestones from Github…
 * Debugger is active!
 * Debugger PIN: 327-604-721
Writing logs to: /Users/username/code/webcompat.com/tmp
Statuses Initialization…
Oooops.
We can't find /Users/username/code/webcompat.com/data/milestones.json
Double check that everything is configured properly
in .env and try again. Good luck!

Fetching milestones from Github…
Milestones saved in data/
Milestones in memory
Milestones saved in data/
Milestones in memory
```

or you can type

```bash
# start local server
npm run start
```

> **Note**: If you are using Cloud 9, you have to update `run.py` and replace `app.run(host=os.getenv("IP", "0.0.0.0"), port=int(os.getenv("PORT", 8080)))`.

You should now have a local instance of the site running at `http://localhost:5000/`.

#### Getting error messages?

Please [file bugs](https://github.com/webcompat/webcompat.com/issues/new) if you need further assistance.
First you should have a look at the logs located in `webcompat.com/tmp`.

When you start the local server, it will print the location of the logs to the console:

```bash
Statuses Initialization…
Writing logs to: /Users/username/code/webcompat.com/tmp
…
```

The logs are saved in the file `webcompat.log`.

### Building the project

After certain kinds of changes are made, you need to build the project before serving it from a webserver will work.

- CSS: a build will run cssnext, combine custom media queries, and concat all source files into webcompat.dev.css. You'll need to rebuild the CSS to see any changes, so it's recommended to use a watch task (see `npm run watch`).
- JS: a build will run eslint and minify, and concat source files.
- JS templates (`.jst` files): if you are making changes to a Backbone template in a `.jst` file, you will need to re-run the `build` command to update the pre-compiled `templates.js` file before you will see the results.
- HTML templates: the changes should be served from disk without the need for rebuilding.
- Python: the Flask local server will detect changes and restart automatically. No need to rebuild.

You can build the entire project (CSS stylesheets, JavaScript scripts, and optimized images) by executing this command on macOS/Linux:

```bash
npm run build
```

and this command on Windows:

```bash
npm run watch
```

Linting means that you check that the code respects some syntactic rules defined for this project.

```bash
# linting style, JS and python.
npm run lint
```

Fixing static JS files with project coding styles, if an error occurs:

```bash
# fixing linting style JS
npm run fix
```

By default, a build will _not_ optimize images (which is done before deploys). If you'd like to optimize images, you can run `npm run imagemin`.
