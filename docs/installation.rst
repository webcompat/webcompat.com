============
Installation
============

To install your own instance of Webcompat.com, you will need a couple of environment setup. These steps will lead you through installing the project for your own usage on your private computer.

Working Environment setup
-------------------------

For testing code locally, you will need a very basic setup. There are a
few requirements. These instructions have been made for working with
Linux and MacOSX. If you install it successfully on Windows, we will
appreciate a pull request on this documentation.

-  Python 2.7
-  node 0.10.0
-  Github account with a fake repo

Simple setup
~~~~~~~~~~~~

Initializing Project source code
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

We use `Grunt`_ as a task runner to perform certain things (minify +
concat JS assets, for example). You need to have `Node.js`_ installed to
be able to run Grunt.

.. code:: bash

    # clone the repo
    git clone https://github.com/<username>/webcompat.com.git #replace your github username
    # change to directory
    cd webcompat.com
    # initializing project
    [sudo] make install

**Note**: if you got an error message, you may need to `install pip`_
before running ``make install`` again.

Detailed setup
~~~~~~~~~~~~~~

Installing pip
^^^^^^^^^^^^^^

We use ``pip`` to install other Python packages. You may need to install
``pip`` if you haven’t do so for another project or Python development.

To determine if you need to, type the following command into the
terminal:

.. code:: bash

    type pip

If you see something like ``pip is /usr/bin/pip``, you can proceed to
install ``virtualenv`` (or go back and use ``make install``). The exact
path will likely be different.

If you see something like ``-bash: type: pip: not found``, you will need
to install ``pip`` like so:

.. code:: bash

    sudo easy_install pip

(If ``easy_install`` isn’t installed, you’ll need to `install
setuptools`_.)

Installing virtualenv
^^^^^^^^^^^^^^^^^^^^^

.. code:: bash

    # Install pip (if not already installed)

    # Install virtualenv
    [sudo] pip install virtualenv

Installing Project source code
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code:: bash

    # clone the repo
    git clone git@github.com:username/webcompat.com.git
    # change to directory
    cd webcompat.com
    # set up virtual environment
    [sudo] virtualenv env
    source env/bin/activate
    # install dependencies
    pip install -r requirements.txt

Installing Grunt
^^^^^^^^^^^^^^^^

We use `Grunt`_ as a task runner to perform certain things (minify +
concat JS assets, for example). You need to have `Node.js`_ installed to
be able to run Grunt. Once that’s done, use ``npm`` to install the grunt
dependencies. Version 0.10.0 or above is required.

First install the ``grunt-cli`` tool:

.. code:: bash

    [sudo] npm install -g grunt-cli
    [sudo] npm install
    grunt

Configuring The Server
~~~~~~~~~~~~~~~~~~~~~~

To test issue submission, you need to create a fake repo on github.
Let’s assume your username is ``miketaylr``. Create a new repository
called ``nobody-look-at-this`` (or the name of your choice).

.. code:: bash

    # set up config.py, filling in appropriate secrets and pointers to repos
    cp config.py.example config.py

You can now edit ``config.py`` and

1. provide pointers to `repo issues URIs`_.
   ``ISSUES_REPO_URI = "<user>/<repo>/issues"``. With the example, we
   chose it would be
   ``ISSUES_REPO_URI = "miketaylr/nobody-look-at-this/issues"``
2. It is **mandatory** to create your own personal bot for local
   development. The `instructions for creating a bot token`_ are given
   on GitHub. Once you created the token you can add it to the variable
   ``BOT_OAUTH_TOKEN = ""``. This is the oauth token we use to report
   issues on behalf of people who don’t want to give GitHub oauth access
   (or don’t have GitHub accounts).
3. `get the secrets`_ for config.py

**Note**: If you get a 404 at GitHub when clicking “Login”, it means you
haven’t `filled in the ``GITHUB_CLIENT_ID`` or
``GITHUB_CLIENT_SECRET```_.

.. figure:: https://i.cloudup.com/8FDA5bVc7l.png
   :alt: Auth 404

   Auth 404

Configuring The Test Repo Labels
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The user interface of WebCompat is currently highly dependent of the labelling system in the github repo. It means you need to have the right set of labels. At this stage we create them by hand (we should `probably create a script`_ for initializing a repo on github with the right labels). The main labels to create are:

- ``status-needsdiagnosis``
- ``status-needscontact ``
- ``status-contactready``
- ``status-sitewait``
- ``status-closed-duplicate``
- ``status-closed-fixed``
- ``status-closed-invalid``

There are a couple of additional labels with ``browser-`` and ``os-``.


Starting The Server
~~~~~~~~~~~~~~~~~~~

.. code:: bash

    # start local server
    python run.py

or

.. code:: bash

    # start local server
    make start

You should now have a local instance of the site running at
``http://localhost:5000/``. Please `file bugs`_ if something went wrong!

Building Project
~~~~~~~~~~~~~~~~

You can build the entire project (CSS and JavaScript files and optimize
images) by executing this command:

.. code:: bash

    make build

.. _Grunt: http://gruntjs.com/
.. _Node.js: http://nodejs.org/download/
.. _repo issues URIs: https://github.com/webcompat/webcompat.com/blob/master/config.py.example#L68-L73
.. _instructions for creating a bot token: http://help.github.com/articles/creating-an-access-token-for-command-line-use
.. _get the secrets: https://github.com/webcompat/webcompat.com/blob/master/config.py.example#L46-L66
.. _filled in the ``GITHUB_CLIENT_ID`` or ``GITHUB_CLIENT_SECRET``: https://github.com/webcompat/webcompat.com/blob/master/config.py.example#L47-L49
.. _file bugs: https://github.com/webcompat/webcompat.com/issues/new
.. _install pip: #installing-pip
.. _install setuptools: https://pypi.python.org/pypi/setuptools#unix-wget
.. _probably create a script: https://github.com/webcompat/webcompat.com/issues/557
