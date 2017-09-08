## Production Server Setup

The current instance of webcompat.com has a nginx front server in front of the Flask application. These are the few things you need to know if you wanted to replicate the current configuration of the server. You will need to adjust for your own environment.

The configuration file is often located at something similar to:

```
/etc/nginx/sites-available/webcompat.com.conf
```

It depends on your local system. So we encourage you to read any documentation of your local server. You would then create a symbolic link to your local /etc/nginx/sites-enabled/. The gist of the nginx configuration file holds into

```nginx
server {
  listen 80;
  root $HOME/webcompat.com;
  error_log $LOGS/nginx-error.log;
  server_name webcompat.com;
  location / {
    # serve static assets, or pass off requests to uwsgi/python
    try_files $HOME/webcompat.com/webcompat/static/$uri $uri @wc;
    }
  location @wc {
    uwsgi_pass unix:///tmp/uwsgi.sock;
    include uwsgi_params;
    }
  }
```

We also have the following content type handlers.

```nginx
##
# Gzip Settings
##

gzip on;
gzip_disable "msie6";

gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_buffers 16 8k;
gzip_http_version 1.0;

# Turn on gzip for all content types that should benefit from it.
gzip_types application/ecmascript;
gzip_types application/javascript;
gzip_types application/json;
gzip_types application/pdf;
gzip_types application/postscript;
gzip_types application/x-javascript;
gzip_types image/svg+xml;
gzip_types text/css;
gzip_types text/csv;
# "gzip_types text/html" is assumed.
gzip_types text/javascript;
gzip_types text/plain;
gzip_types text/xml;
```

We are also using [uWSGI](http://uwsgi-docs.readthedocs.org/en/latest/index.html).

```
upstream uwsgicluster {
  server 127.0.0.1:8080;
}
```

with the following configuration file `uwsgi.conf`

```
# our uWSGI script to run webcompat.com

description "uwsgi service"
start on runlevel [2345]
stop on runlevel [06]

respawn

# .ini files for staging.webcompat.com (staging.ini) and webcompat.com (production.ini) are in $HOME/vassals
exec /usr/local/bin/uwsgi --emperor $HOME/vassals
```

We have been using [uWSGI Emperor](http://uwsgi-docs.readthedocs.org/en/latest/Emperor.html) to manage two environments for staging and production. It gives us the possibility to test features which are not yet fully ready for production without messing the actual site.

`production.ini`

```ini
[uwsgi]

socket = $FOO/uwsgi.sock
chmod-socket = 666
chdir = $HOME/webcompat.com/
env = PRODUCTION=1
master = true
module = webcompat
callable = app
logto = $LOGS/uwsgi.log
buffer-size = 8192
```

and `development.ini`

```ini
[uwsgi]

socket = $FOO/uwsgi-staging.sock
chmod-socket = 664
gid = webcompat
uid = webcompat
chdir = $FOO/staging.webcompat.com/
env = DEVELOPMENT=1
module = webcompat
callable = app
logto = $FOO/staging-uwsgi.log
buffer-size = 8192

```
