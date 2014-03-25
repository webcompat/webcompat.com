# webcompat.com

Source code for webcompat.com

`>>>----It's a work in progress---->`

### Icon

Icon designed by Jeremy Lloyd.  Public domain via The Noun Project
http://thenounproject.com/term/light-switch/2235/

### Colors and Typography


* Blue - `#67cedc`
* Inset Shadow on Blue - `#181e31`
* Orange - `#f38326`
* Dark Orange - `#d47039`
* Beige - `#fdf3dd`

Fonts:
`Helvetica Neue`

## Test Deployment

If you'd like to run the site locally, type these commands into the terminal (which should work on Mac and Linux operating systems--instructions for Windows would make a great first contribution to this project!)


Install pip:

	$ sudo easy_install pip

###Installing and Setting up the Virtualenvwrapper
	
Install :
	
	$ sudo pip install virtualenv virtualenvwrapper
	
For Mac Users:

Open up your .bash_profile or .profile, and after your PATH statement, add the following
``` bash
# set where virutal environments will live
export WORKON_HOME=$HOME/.virtualenvs
# ensure all new environments are isolated from the site-packages directory
export VIRTUALENVWRAPPER_VIRTUALENV_ARGS='--no-site-packages'
# use the same directory for virtualenvs as virtualenvwrapper
export PIP_VIRTUALENV_BASE=$WORKON_HOME
# makes pip detect an active virtualenv and install to it
export PIP_RESPECT_VIRTUALENV=true
if [[ -r /usr/local/bin/virtualenvwrapper.sh ]]; then
    source /usr/local/bin/virtualenvwrapper.sh
else
    echo "WARNING: Can't find virtualenvwrapper.sh"
fi
```

For Linux Users:

    $ mkdir ~/virtualenvs
    $ echo "export WORKON_HOME=~/virtualenvs" >> ~/.bashrc
    $ echo "source /usr/local/bin/virtualenvwrapper.sh" >> ~/.bashrc
    $ echo "export PIP_VIRTUALENV_BASE=~/virtualenvs" >> ~/.bashrc
    $ source ~/.bashrc

Create virtualenv :
	
	$ mkvirtualenv webcompat
  
#### Running Webcompat.com locally

``` bash
# clone the repo
git clone https://github.com/webcompat/webcompat.com.git
# change to directory
cd webcompat
# checkout the dev branch
git checkout dev.webcompat.com
# set up config.py, filling in appropriate secrets
cp config.py.example config.py
# install dependencies
pip install -r requirements.txt
# start local server
python run.py
```

You should now have a local instance of the site running at `http://localhost:5000`. Please [file bugs](https://github.com/webcompat/webcompat.com/issues/new) if something went wrong!

### License

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
