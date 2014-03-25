# webcompat.com

Source code for webcompat.com

`>>>----It's a work in progress---->`

### Icon

Icon designed by Jeremy Lloyd.  Public domain via The Noun Project
http://thenounproject.com/term/light-switch/2235/

### Colors and Typography

Blue - #67cedc
Inset Shadow on Blue - #181e31
Orange - #f38326
Dark Orange - #d47039
Beige - #fdf3dd

Fonts
Helvetica Neue

### Developing Locally

If you'd like to run the site locally, type these commands into the terminal (which should work on Mac and Linux operating systems--instructions for Windows would make a great first contribution to this project!)

The only requiement is having [Virtualenv installed](http://www.virtualenv.org/en/latest/virtualenv.html#installation) (and presumably Python).

``` bash
# clone the repo
git clone git@github.com:webcompat/webcompat.com.git
# change to directory
cd webcompat
# checkout the dev branch
git checkout dev.webcompat.com
# initialize virtualenv
virtualenv env
# activate virtual environment
source env/bin/activate
# install dependencies
pip install -r requirements.txt
# start local server
python run.py
```

You should now have a local instance of the site running at `http://localhost:5000`. Please file bugs if something went wrong!

### License

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
