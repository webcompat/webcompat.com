# AB testing
## Configuration
You can enable/disable AB testing support by setting the environment variable `AB_TESTING=<True/False>`.
This will configure flask to load the static assets required for AB testing.

## Client side
We are using [TrafficCop](https://github.com/mozilla/trafficcop) for AB testing support. It's a lightweight
library that allows serving variations of a page either using a JS callback or by redirecting users with a
specific variation URL query parameter. The initialization of the experiments is happening in `static/lib/ab.js`.
There we can define experiments, variations and target percentages.

We are respecting DNT so users with DNT enabled will always in the default variation called `novariaton`.

## Server side
We can use the following helper methods for our AB experiments

* `ab_view`
  * A view decorator that allows selecting different views based on the AB variation parameter
* `ab_redirect`
  * A view decorator that allows us to trigger a redirect based on the AB variation parameter
* `ab_active`
  * A helper method that checks the TrafficCop cookies and returns which is the current active variation (if any).
