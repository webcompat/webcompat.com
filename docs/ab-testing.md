# AB testing
## Configuration
You can enable/disable AB testing support by configuring the following environment variables:

`FORM_V1_VARIATION`: expects a string of the format '{int} {int}'
`FORM_V2_VARIATION`: expects a string of the format '{int} {int}'
`EXP_MAX_AGE`: expects a number which defines when the experiment cookie expires

These are read by the `config.AB_EXPERIMENT` dictionary in `./config/__init__.py` and converted to a tuple.
This will configure flask to set cookies to responses. For example, setting the variables to the following:

```
export FORM_V1_VARIATION = "0 20"
export FORM_V2_VARIATION = "20 100"
export EXP_MAX_AGE = 604800
```

This will result in the `AB_EXPERIMENTS` dictionary with the following values:

```
AB_EXPERIMENTS = {
    'exp-1': {
        'variations': {
            'ui-var-1': (0, 20),
            'ui-var-2': (20, 100)
        },
        'max-age': 604800  # 1 week
    }
```

This will setup an experiment with 2 variations.
Users will have 20% chance to participate in `exp-1` variation `variation-1` and
80% chance to participate in `exp` variation `variation-2`. You can define multiple experiments.

For example:

```
AB_EXPERIMENTS = {
    'exp-1': {
        'variations': {
            'ui-var-1': (0, 20),
            'ui-var-2': (20, 100)
        },
        'max-age': 604800  # 1 week,
    },
    'exp-2': {
        'variations': {
            'variation-1': (0, 40),
            'variation-2': (40, 50),
            'variation-3': (50, 100)
        },
        'max-age': 86400  # 1 day
    }
}
```

## How it works
On each request, the AB helper randomly selects a number and if the number falls within the range
of the experiment variation, user participates in this experiment's variation. This is implemented
by adding setting a cookie with name `<experiment_id>` and value `<variation>`. Each experiment
expires after `<max-age>` seconds.

## Usage
We can use the following helper method for our AB experiments

* `ab_active`
  * Returns experiment variation if the variation is still active or `False`

For example, given the configuration above, here is a code snippet on how to implement AB in a view:

```
from flask import Flask

from webcompat.helpers import ab_active
app = Flask(__name__)

@app.route('/')
def example():
    if ab_active('exp-1') == 'ui-var-1':
        return 'UI variation 1'
    elif ab_active('exp-1') == 'ui-var-2':
        return 'UI variation 2'
    else:
        return 'Default variation'

```
