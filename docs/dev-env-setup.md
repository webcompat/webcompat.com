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

## Development Environment setup

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
