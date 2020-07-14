

* [Running Tests](#running-tests)
  * [Backend Unit Tests](#backend-unit-tests)
  * [Functional Tests](#functional-tests)
* [Writing Tests](#writing-tests)
  * [Python Unit Tests](#python-unit-tests)
  * [JS Functional Tests](#js-functional-tests)
  * [Adding Data Fixtures](#adding-data-fixtures)

## Running Tests

Some of our tests are testing our backend code infrastructure and the others are testing the frontend logic of the application.

### Backend Unit Tests

Our tests are written in Python. We assume you have already installed the development Python modules with

```bash
pip install -r config/requirements-dev.txt
```

We are using the [pytest framework](https://docs.pytest.org/en/latest/) for running our Python unit tests. Use the following commands:

```bash
pip install -e .
pytest
```

This will display an output similar to this when all tests are passing.

```
========================= test session starts =======================
========================= 154 passed in 33.19s ======================
platform darwin -- Python 3.7.4, pytest-5.3.5, py-1.8.1, pluggy-0.13.1
rootdir: /Users/karl/code/webcompat.com
collected 154 items
tests/unit/test_api_urls.py ...........                        [  7%]
tests/unit/test_config.py ..                                   [  8%]
tests/unit/test_console_logs.py .....                          [ 11%]
tests/unit/test_form.py .................                      [ 22%]
tests/unit/test_helpers.py ............................        [ 40%]
tests/unit/test_http_caching.py ...                            [ 42%]
tests/unit/test_issues.py ......                               [ 46%]
tests/unit/test_rendering.py ......                            [ 50%]
tests/unit/test_tools_changelog.py ..                          [ 51%]
tests/unit/test_topsites.py ...                                [ 53%]
tests/unit/test_uploads.py ...                                 [ 55%]
tests/unit/test_urls.py .................................      [ 77%]
tests/unit/test_webhook.py ................................... [100%]

========================= 154 passed in 33.19s ======================
```

You can also run them with following:

```
npm run test:python
```

Running functional tests is a bit more involved. You can also run both test suites at once (see the next section).

Tests are also run automatically on [Circle CI](https://circleci.com/gh/webcompat/webcompat.com) for each commit. If you would like to skip running tests for a given commit, you can use use the magical `[ci skip]` string in your commit message. See the [Circle CI docs](https://circleci.com/docs/2.0/skip-build/) for more info.

### Frontend Unit Tests

We use [Intern](http://theintern.io/) to run JavaScript unit tests.

A [series of unit tests](https://github.com/webcompat/webcompat.com/tree/master/webcompat/static/js/lib/wizard/tests/) have been created for the JavaScript code managing the frontend of our application.

You can run them by using the command.

```
npm run test:unit-js
```

The output will be something similar to:

```
> webcompat@ test:unit-js /Users/karl/code/webcompat.com
> intern config=./webcompat/static/js/lib/wizard/tests/intern.json

✓ node - notify - subscribe throws an error if no channel or callback provided (0.001s)
✓ node - notify - subscribe returns and object with unsubscribe property (0s)
✓ node - notify - publishing to a channel calls callback fn (0.001s)
✓ node - notify - publishing to a channel with no listeners doesn't call callback fn (0s)
✓ node - notify - publishing data to callback makes it to callback fn (0s)
✓ node - notify - publishing no data to callback results in an empty object being passed to callback fn (0.001s)
✓ node - notify - callback fn is not called after unsubscribe (0s)
✓ node - utils - extractPrettyUrl extracts url without protocol and slashes (0s)
✓ node - utils - charsPercent returns percent of entered chars limiting percent to 100 (0s)
✓ node - utils - isSelfReport determines if report was filed for our own site (0s)
✓ node - utils - getDataURIFromPreview gets the data URI portion inside of a serialized data URI (0s)
✓ node - validation - isUrlValid detects if url is valid (0s)
✓ node - validation - isEmpty detects if string is empty trimming spaces (0s)
✓ node - validation - isImageTypeValid detects if uploaded image type is valid (0s)
✓ node - validation - blobOrFileTypeValid detects if uploaded file type is valid (0s)
✓ node - validation - isImageDataURIValid detects is data URI is valid image (0s)
✓ node - validation - isGithubUserNameValid detects if github username is valid (0s)
TOTAL: tested 1 platforms, 17 passed, 0 failed
```

### Functional Tests

We use [Intern](http://theintern.io/) to run functional tests.

> Note: This version is known to work with Firefox 74.0. If things aren't working with the current stable version of Firefox, please [file a bug!](https://github.com/webcompat/webcompat.com/issues/new).

Be sure that you have installed local npm dependencies and run the build before trying to run functional tests - if not, you will notice problems with the css. [See dev env setup](https://github.com/webcompat/webcompat.com/blob/master/docs/dev-env-setup.md) for details.


#### Install Java

> Java is used to run Selenium functional tests. Version 1.8.0+ is required.

To test if your version of Java is recent enough, type the `java -version` into your terminal.

```
> java -version
java version "1.8.0_51"
Java(TM) SE Runtime Environment (build 1.8.0_51-b16)
Java HotSpot(TM) 64-Bit Server VM (build 25.51-b03, mixed mode)
```

##### OS X:

Download from [java.com/en/download/](https://www.java.com/en/download/).

##### Ubuntu:

```
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer
```

#### Select the Firefox binary

The `firefox` binary will also need to be in your `PATH`. Here's how this can be done on OS X:

```bash
export PATH="/Applications/Firefox.app/Contents/MacOS/:$PATH"
```

#### Run the functional tests

If you are using your own test repo, your tests will fail. Change it back to the default, at least for running tests:

`ISSUES_REPO_URI = 'webcompat/webcompat-tests/issues'`.

Start the application server in test mode:

```bash
source env/bin/activate && python run.py -t
```

or with the short form

```bash
npm run start:test
```

> We start the server in test mode to mock the communications with GitHub API servers using local fixture data. The files in `/tests/fixtures/` directory will be served as responses.

In a separate terminal window or tab, run the tests:

```bash
npm run test:js
```

You can also run the functional tests as well as the Python tests in a separate tab, after starting the server, with:

```
npm test
```

Shortly after running this command, a progress indicator should appear in the terminal window and spin through each functional test in Firefox and then in Chrome. When all the tests complete, you'll see the final report of passes and failures in the terminal window that you ran the `intern-runner` command in.

To run a single test suite, where foo.js is the file found in the `tests/functional` directory:

```bash
npm run test:js functionalSuites=tests/functional/foo.js
```

To filter which tests *within* a single test suite you run, you can use the `grep` argument:

```bash
npm run test:js grep=tacos functionalSuites=tests/functional/foo.js
```

This will run any test within the foo.js suite that has "tacos" in its name.

Right now the tests are running in Firefox and Chrome as a default. You can specify which browsers you want to test by modifying `intern.json` in the project root.

By default, Chrome and Firefox will run in headless mode. To display the browser UI when running tests, remove the `headless` arguments for each browser from the `environments` key.

For a list of the recognized browser names, just refer to [Browser enum](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Browser.html)

## Writing Tests

Contributions that add or modify major functionality to the project should typically come with tests to ensure we're not breaking things (or won't in the future!). There's always room for more testing, so general contributions in this form are always welcome.

1. [Open an issue](https://github.com/webcompat/webcompat.com/issues) (if it doesn't exist yet)
2. Write the tests
3. Implement the feature
4. Send a pull request
5. The discussion around the code can start

### Python Unit Tests

Our Python unit tests are written using the [pytest](https://docs.pytest.org/en/latest/) framework.

#### History

Historically, we had been writing our tests with the Python standard [`unittest`](https://docs.python.org/3/library/unittest.html) module. We are slowly transitioning to pytest for some of the tests when we have to modify them. So you will find some test files with a mix of both unittest and pytest. If you feel converting the tests from unittest to pytest, please pick up one test file, open an issue and send a pull request with your modifications. See below for an example of pytest test skeleton.

#### Python Test organization

Unit tests placed in the [`tests/unit` directory](https://github.com/webcompat/webcompat.com/tree/master/tests/unit) will be automatically detected by pytest.

Unit tests are preferred for features or functionality that are independent of the browser front-end, i.e., API responses, application routes, etc.

#### pytest testing skeleton for webcompat

pytest has far less boilerplate requirements than the unittest module.

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for @@THIS_MODULE@@ methods."""

import pytest

import webcompat
# import the module you need to test
# example: from webcompat.api.helpers import get_html_comments


@pytest.fixture
def client():
    webcompat.app.config['TESTING'] = True
    with webcompat.app.test_client() as client:
        with webcompat.app.app_context():
            # intialize something
            pass
        yield client

def test_my_new_test(client):
    """Test docstring."""
    rv = client.get('/')
    assert b'yes! expected data' in rv.data
```

Check, for example, the [tests for the API helpers](https://github.com/webcompat/webcompat.com/blob/master/tests/unit/test_api_helpers.py)

#### Additional references:
* [pytest documentation](https://docs.pytest.org/en/latest/contents.html#toc)
* [Testing Flask Applications](https://flask.palletsprojects.com/en/1.1.x/testing/)


### JS Functional Tests

Functional tests are written in JavaScript, using [Intern](http://theintern.io/). There's a nice [guide on the Intern wiki](https://theintern.io/docs.html#Intern/4/docs/docs%2Fwriting_tests.md/functional-tests) that should explain enough to get you started.

#### Additional references:

* [Leadfoot](https://theintern.github.io/leadfoot/): the library that drives the browser (via Selenium).
* [ChaiJS](http://chaijs.com/api/assert/): the library used for assertions.
* [Intern docs](https://theintern.io/docs.html#Intern/4/docs/README.md): contains useful examples.

It's also recommended to look at the other test files in the `tests/functional` directory to see how things are commonly done.

### Adding Data Fixtures

To avoid hitting the GitHub API during the tests, we need to make sure to have local representations of the data. When running the tests, the webcompat Flask app will then use these data for answering instead of asking data.

🚨You need to make sure that your data are representative of what GitHub is sending. This is the danger with any fixtures is when the fixtures data are drifting from the reality of what the third party API is sending.

#### Set a mockable response

To indicate that the app should send fixture data, use the Python `@mockable_response` decorator for a Python API endpoint.

If the endpoint you are trying to mock has `GET` parameters, you will need to create a file that has the `GET` parameters encoded in the filename. The source of `@mockable_repsonse` explains how this is done:

```python
if get_args:
    # if there are GET args, encode them as a hash so we can
    # have different fixture files for different response states
    checksum = hashlib.md5(json.dumps(get_args)).hexdigest()
    file_path = FIXTURES_PATH + request.path + "." + checksum
    print('Expected fixture file: ' + file_path + '.json')
```

You can look at the server console's `Expected fixture file:` message to know what file it is expecting.

#### Data fixtures location

The [data fixtures](https://github.com/webcompat/webcompat.com/tree/master/tests/fixtures) are in the tests directory.

* `tests/fixtures/api/` follow the structure of the API hierarchy. For example
    * `tests/fixtures/api/` contains the requests done for `https://webcompat.com/api`
    * `tests/fixtures/api/issues/category` contains the requests done for `https://webcompa.com/api/issues/category`
* `tests/fixtures/webhooks` contains the fixture data for simulating the webhook requests.
* `tests/fixtures/config` contains the fixture which are related to configuration initialization
* `tests/fixtures` contains some example of images (This should probably go to another directory).