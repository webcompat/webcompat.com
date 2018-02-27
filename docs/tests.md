* [Running Tests](#running-tests)
  * [Functional Tests](#functional-tests)
  * [Functional Tests using Fixture Data](#functional-tests-using-fixture-data)
* [Writing Tests](#writing-tests)
  * [Python Unit Tests](#python-unit-tests)
  * [JS Functional Tests](#js-functional-tests)

## Running Tests

You can run the Python unit tests from the project root with the `nosetests` command.

You can also run them with following:

```
npm run test:python
```

Running functional tests is a bit more involved. You can also run both test suites at once (see the next section).

Tests are also run automatically on [Travis](https://travis-ci.org/webcompat/webcompat.com) for each commit. If you would like to skip running tests for a given commit, you can use use the magical `[ci skip]` string in your commit message. See the [Travis docs](http://docs.travis-ci.com/user/how-to-skip-a-build/#Not-All-Commits-Need-CI-Builds) for more info.

### Functional Tests

We use [Intern](http://theintern.io/) to run functional tests.

> Note: This version is known to work with Firefox 50.1.0. If things aren't working with the current stable version of Firefox, please [file a bug!](https://github.com/webcompat/webcompat.com/issues/new).

Be sure that you have installed local npm dependencies and run the build before trying to run functional tests - if not, you will notice problems with the css. [See dev env setup](#installing-grunt) for details.


#### Installing Java

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

The `firefox` binary will also need to be in your `PATH`. Here's how this can be done on OS X:

```bash
export PATH="/Applications/Firefox.app/Contents/MacOS/:$PATH"
```

If you are a member of webcompat organization in GitHub, edit `config/secrets.py`. The value of `ISSUES_REPO_URI` is the path of the repository containing test issues.

Change the value to : `ISSUES_REPO_URI = 'webcompat/webcompat-tests/issues'`.

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

You can also run the functional tests as well as the python tests in a seperate tab, after starting the server with:

```
npm test
```

Shortly after running this command, you should see the browser open and various pages appear and disappear automatically for a minute or two. The tests are complete when the browser window closes and you see a report of how many passed or failed in the terminal window that you ran the `intern-runner` command in.

To run a single test suite, where foo.js is the file found in the `tests/functional` directory:

Note: the extra `--` is how you pass arguments to the npm script. Don't forget it!

```bash
npm run test:js -- --functionalSuites=tests/functional/foo.js
```

Right now the tests are running in Firefox as a default. You can specify which browsers you want to test with using the `browsers` argument. Like this:

```bash
npm run test:js -- --browsers=chrome,firefox
```

For a list of the recognized browser names, just refer to [Browser enum](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Browser.html)

## Adding Fixtures

To indicate that the app should send fixture data, use the `@mockable_response` decorator for an API endpoint.

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

## Writing Tests

Contributions that add or modify major functionality to the project should typically come with tests to ensure we're not breaking things (or won't in the future!). There's always room for more testing, so general contributions in this form are always welcome.

### Python Unit Tests

Our Python unit tests are vanilla flavored [`unittest`](https://docs.python.org/2/library/unittest.html) tests. Unit tests placed in the `tests` directory will be automatically detected by nose&mdash;no manual registration is necessary.

Unit tests are preferred for features or functionality that are independent of the browser front-end, i.e., API responses, application routes, etc.

Important documentation links:
* [Writing nose tests](https://nose.readthedocs.org/en/latest/writing_tests.html)
* [`unittest`](https://docs.python.org/2/library/unittest.html)
* [Testing Flask](http://flask.pocoo.org/docs/0.10/testing/)

### JS Functional Tests

Functional tests are written in JavaScript, using [Intern](http://theintern.io/). There's a nice [guide on the Intern wiki](https://github.com/theintern/intern/wiki/Writing-Tests-with-Intern#functional-testing) that should explain enough to get you started.

Important documentation links:
* [Leadfoot](https://theintern.github.io/leadfoot/): the library that drives the browser (via Selenium).
* [ChaiJS](http://chaijs.com/api/assert/): the library used for assertions.
* [Intern wiki](https://github.com/theintern/intern/wiki): contains useful examples.

It's also recommended to look at the other test files in the `tests/functional` directory to see how things are commonly done.
