# Contributions Guidelines

You are welcome to contribute to this project.



## Working Environment setup

If you'd like to run the site locally, type these commands into the terminal (which should work on Mac and Linux operating systems--instructions for Windows would make a great first contribution to this project!)

The only requiement is having [pip installed](http://pip.readthedocs.org/en/latest/installing.html) (and, uh, Python). You probably want to [get the secrets](https://github.com/webcompat/webcompat.com/blob/dev.webcompat.com/config.py.example#L19-L22) for config.py as well.

Here are the steps for configuring your work environment on Unix (Linux, MacOSX, etc.).

``` bash
# Install virtualenv
sudo pip install virtualenv
# Install virtualenvwrapper
sudo pip install virtualenvwrapper
# Configuring your environment
echo "export WORKON_HOME=$HOME/.virtualenvs" > ~/.bashrc
echo "export PROJECT_HOME=$HOME/Devel" > ~/.bashrc
echo "source /usr/local/bin/virtualenvwrapper.sh" > ~/.bashrc
source ~/.bashrc
```

Now let's move on the steps to grab the source code locally and work in a protected environment of python.

``` bash
# In the location of your choice
# clone the repo
git clone git@github.com:webcompat/webcompat.com.git
# change to directory
cd webcompat.com
# checkout the dev branch
git checkout dev.webcompat.com
# Set up environment
# * Will install the virtualenvironment
# * will install the requirements
# * will set the default dir for working
mkvirtualenv -a /Your/full/path/webcompat.com/ -r requirements.txt webcompatcom
# set up config.py, filling in appropriate secrets
cp config.py.example config.py
# start local server
python run.py
```

You should now have a local instance of the site running at `http://127.0.0.1:5000/`. Please [file bugs](https://github.com/webcompat/webcompat.com/issues/new) if something went wrong!

To leave the working environment, just type:

```bash
deactivate
```

If you want to work again on the project, you just need to do:

```bash
workon webcompatcom
```

It will move you to the right directory in your environment.


## Creating Issues
## Proposing Code Changes
