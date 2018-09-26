* [Simple setup](#simple-setup-mac-os-and-linux)
    * [Installing Project source code](#initializing-project-source-code)
  * [Detailed setup](#detailed-setup-all-platforms)
    * [Installing Windows Substem for Linux](#installing-windows-subsytem-for-linux)
    * [Installing pip](#installing-pip)
    * [Installing virtualenv](#installing-virtualenv)
    * [Installing Project source code](#installing-project-source-code)
    * [Installing npm dependencies](#installing-npm-dependencies)
  * [Configuring The Server](#configuring-the-server)
  * [Starting The Server](#starting-the-server)
  * [Building the Project](#building-the-project)

## Development Environment setup

For testing code locally, you will need a very basic setup. There are a few requirements. These instructions have been made for working with Linux, Windows and MacOSX. You need:

* [Python](https://www.python.org/) 2.7
* [Node.js](https://nodejs.org/en/download/) Current LTS version
* [GitHub](https://github.com) account
* [Git](https://git-scm.com/download/win)

> Note: Windows users should install the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) with the Ubuntu distribution and continue setup in the [Installing Windows Substem for Linux](#installing-windows-subsytem-for-linux) section. It may be possible to get the application running via other means, but we don't offer support for other setups.

> Note: A cloud IDE such as [Cloud 9](https://c9.io) can also be used. If you take this route, please update to the latest Python version with the following. (This is to avoid `InsecurePlatformWarning` errors that arise when the default Python 2.7.6 is used).

```shell
sudo apt-add-repository ppa:fkrull/deadsnakes-python2.7
sudo apt-get update
sudo apt-get install python2.7 python2.7-dev
```

In Ubuntu, sometimes even after installing Node.js, the command `node -v` does not show the installed version. To complete installation, a symbolic link has to be created to the sbin folder.

```shell
# remove old symbolic links if any
sudo rm -r /usr/bin/node

# add new symbolic link
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo ln -s /usr/bin/nodejs /usr/sbin/node
```

> Note: If in Windows 10 you receive an error message about already having node installed, it can be fixed by removing existing installations and installing again. You probably only want to do this if you don't rely on existing node setups for other projects.

```shell
# removing existing nodejs installations
sudo apt-get --purge remove node
sudo apt-get --purge remove nodejs

# installing
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
```

### Simple setup
#### Initializing Project source code

```bash
# clone the repo
git clone https://github.com/<username>/webcompat.com.git #replace your github username
# change to directory
cd webcompat.com
# initializing project
npm run setup
```

**Note**: if you got an error message, you may need to [install pip](#installing-pip) before running `npm run setup` again.

**Note**: if you get an error message about missing rights to install the setup through npm, please *do not run `sudo npm`*. You just need to [fix you permissions](https://coderwall.com/p/t2mc9g/don-t-sudo-npm) for `usr/local`.

### Detailed setup (All platforms)

#### Installing Windows Substem for Linux

Once [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) and Ubuntu distribution are installed, open the Ubuntu terminal and finish any installation prompts, if necessary.

From the terminal, you can install python, pip, and nodejs and npm with the following commands:

```bash
sudo apt-get update
sudo apt-get install python
sudo apt-get install python-pip
sudo apt-get install nodejs
sudo apt install npm
```

It's a good idea to update npm after this (to speed up `npm install`): `sudo npm install npm -g`

At this point, you can skip over the [Installing pip](#installing-pip) section and continue with the [Installing virtualenv](#installing-virtualenv) directions.

#### Installing pip

We use `pip2` to install other Python packages. You may need to install `pip2` if you haven't done so for another project or Python development, or only have Python 3 installed on your system.

To determine if you need to install `pip2`, type the following command into the terminal:

```bash
pip2 --version
```

If you get an error message, follow the docs on [installing Pip](https://pip.pypa.io/en/stable/installing/) for your platform.

Note: Windows and Linux users can do the following via the terminal:

```bash
sudo apt install python-pip
```

#### Installing virtualenv
[Virtual Environment]( https://virtualenv.pypa.io/en/stable/) is a tool to create isolated environments for different projects so as to prevent conflicts.

```bash
# Install virtualenv
[sudo] pip2 install virtualenv
```

#### Installing Project source code

```bash
# clone the repo. Change <username> to your GitHub username
git clone git@github.com:<username>/webcompat.com.git
# change to directory
cd webcompat.com
# set up virtual environment
virtualenv env
source env/bin/activate
# optionally install Pillow image lib dependencies (only required if you plan on hacking on image upload features)
#  OSX: http://pillow.readthedocs.org/en/3.0.x/installation.html#os-x-installation
#  Windows: http://pillow.readthedocs.org/en/3.0.x/installation.html#windows-installation
#  Linux: http://pillow.readthedocs.org/en/3.0.x/installation.html#linux-installation
# install rest of dependencies
pip2 install -r config/requirements.txt
# In Ubuntu: if ImportError: No module named flask.ext.github occurs, it means the dependencies in requirements.txt are installed in /usr/lib instead of <project_repository>/env/python<version>/site-packages.
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

**Note**: if you get an error message about missing rights to install the setup through npm, please *do not run `sudo npm`*. You just need to [fix you permissions](https://coderwall.com/p/t2mc9g/don-t-sudo-npm) for `usr/local`.

### Configuring the Server

### Test repository

You need to create a repository on GitHub which is used to submit issues via the GitHub API. For example, the user `miketaylr` has created a repository called "[test-repo](https://github.com/miketaylr/test-repo)" for this purpose.

**Important:** Your repository needs to have exactly the same milestones like we have in our [test-repository](https://github.com/webcompat/webcompat-tests/milestones): needstriage, sitewait, duplicate, incomplete, contactready, needscontact, invalid, needsdiagnosis, wontfix, worksforme, non-compat and fixed.

### Store your settings

```bash

### Store your settings

```bash
# set up secrets.py, filling in appropriate secrets and pointers to repos
# Mac / Linux
cp config/secrets.py.example config/secrets.py
# Windows
copy config/secrets.py.example config/secrets.py
```

> Note: If you are using Cloud 9, you have to update `run.py` and replace `app.run(host=os.getenv("IP", "0.0.0.0"), port=int(os.getenv("PORT", 8080)))`.

You can now edit `secrets.py` and

1. Add the right values to the repo issues URIs. `ISSUES_REPO_URI = "<user>/<repo>/issues"`. For example, miketaylr's setup needs to say `ISSUES_REPO_URI = "miketaylr/test-repo/issues"`

2. You have the option of creating a "bot account" (a dummy account for the purpose of testing), or using your own account for local development. Either way, you'll need a personal access token to proceed &mdash; this is the oauth token we use to report issues on behalf of people who don't want to give GitHub OAuth access (or don't have GitHub accounts).

  The [instructions for creating a personal-access token](http://help.github.com/articles/creating-an-access-token-for-command-line-use) are given on GitHub. Select public_repo to grant access to the public repositories through the personal access token.  Once you have created the token you can add it in the variable `OAUTH_TOKEN = ""`. More advanced users might want to create an environment variable called `OAUTH_TOKEN`. Either way is fine.

3. Add the client ID and client secret to `secrets.py`. If you're part of the [webcompat GitHub organization](https://github.com/webcompat), you can [get the client ID and client secret from GitHub](https://github.com/organizations/webcompat/settings/applications/). Otherwise, create your own test and production applications ([instructions here](https://github.com/settings/applications/new)) &mdash; when prompted for an "Authorization callback URL", use `http://localhost:5000/callback` (Cloud 9 users should use `http://yourapp.c9users.io:8000/callback`instead), and take note of the client ID and client secret GitHub give you.

  When you have the client ID and client secret, put them in the corresponding lines in `secrets.py` for the localhost application:

  ```py
  # We're running on localhost, use the test application
  GITHUB_CLIENT_ID = os.environ.get('FAKE_ID') or "<client id goes here>"
  GITHUB_CLIENT_SECRET = os.environ.get('FAKE_SECRET') or  "<client secret goes here>"
  ```

  > Note: You can ignore the `FAKE_ID` and `FAKE_SECRET` environment variables; we use that as a hack for automated tests.

4. Click on **Log in** to authorize the application and get access to the issues.
![Login](https://cldup.com/HHtMlPhAod.png)


> **Note**: If you get a 404 at GitHub when clicking **Log in**, it means you haven't filled in the `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET` in `secrets.py`.

![Auth 404](https://i.cloudup.com/8FDA5bVc7l.png)

### Starting the Server

```bash
# start local server
python run.py
```

or

```bash
# start local server
npm run start
```

You should now have a local instance of the site running at `http://localhost:5000/`.

#### Getting error messages?

Please [file bugs](https://github.com/webcompat/webcompat.com/issues/new) in case you need further assistance.
First you should have a look at the logs located in `webcompat.com/tmp`.

When you start the local server, it will also print the location to the console:

```bash
> python run.py
Statuses Initialization…
Writing logs to: /Users/acooluser/projects/webcompat.com/tmp
…
```


### Building the Project

After certain kinds of changes are made, you need to build the project before serving it from a webserver will work

* CSS: a build will run cssnext, combine custom media queries, and concat all source files into webcompat.dev.css. You'll need to re-build the CSS to see any changes, so it's recommended to use a watch task (see `npm run watch`).
* JS: a build will run eslint, minify and concat source files.
* JS templates (`.jst` files): if you are making changes to a Backbone template in a `.jst` file, you will need to re-run the `build` command to update the pre-compiled `templates.js` file before you will see the results.
* HTML templates: the changes should be served from disk without the need for rebuilding.
* Python: the Flask local server will detect changes and restart automatically. No need to re-build.

You can build the entire project (CSS stylesheets, JavaScript scripts, and optimized images) by executing this command on macOS/Linux:

```bash
npm run build
```

and this command on Windows:

```bash
npm run watch
```

Linting static JS files with project coding styles:

```bash
# linting style JS
npm run lint
```

Fixing static JS files with project coding styles, if an error occurs:

```bash
# fixing linting style JS
npm run fix
```

By default, a build will *not* optimize images (which is done before deploys). If you'd like to optimize images, you can run `npm run imagemin`.
