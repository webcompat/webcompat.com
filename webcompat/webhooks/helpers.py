#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import json
import re
import requests
import tldextract

from webcompat import app
from webcompat.db import issue_db
from webcompat.db import WCIssue
from webcompat.helpers import extract_url


def api_post(endpoint, payload, issue):
    '''Helper method to post junk to GitHub.'''
    headers = {
        'Authorization': 'token {0}'.format(app.config['OAUTH_TOKEN'])
    }
    uri = 'https://api.github.com/repos/{0}/{1}/{2}'.format(
        app.config['ISSUES_REPO_URI'], issue, endpoint)
    requests.post(uri, data=json.dumps(payload), headers=headers)


def parse_and_set_label(body, issue_number):
    '''Parse the labels from the body in comment:

    <!-- @browser: value -->. Currently this only handles a single label,
    because that's all that we set in webcompat.com.
    '''
    match_list = re.search(r'<!--\s@(\w+):\s([^\d]+?)\s[\d\.]+\s-->', body)
    if match_list:
        # perhaps we do something more interesting depending on
        # what groups(n)[0] is in the future.
        # right now, match_list.groups(0) should look like:
        # ('browser', 'firefox')
        browser = match_list.groups(0)[1].lower()
        dash_browser = '-'.join(browser.split())
        set_label('browser-' + dash_browser, issue_number)


def set_label(label, issue_number):
    '''Do a GitHub POST request to set a label for the issue.'''
    # POST /repos/:owner/:repo/issues/:number/labels
    # ['Label1', 'Label2']
    payload = [label]
    api_post('labels', payload, issue_number)


def extract_domain_name(url):
    '''Extract the domain name from a given URL'''
    prefix_blacklist = 'www.'
    domain_blackList = ['.google.com', '.live.com', '.yahoo.com', '.go.com']
    parts = tldextract.extract(url)
    # Handles specific cases where 'www' is the domain (www.net, www.org)
    if parts.domain == '' or parts.domain == 'www':
        return parts.suffix
    # Using only the domain in large domains with a number of subdomains would
    # not yield much information. To improve accuracy, we include the subdomain
    # in the domain
    elif any(domain in url for domain in domain_blackList):
        subdomain = parts.subdomain
        if prefix_blacklist in subdomain:
            # Handles cases of starting 'www' included in subdomain
            subdomain = parts.subdomain.replace(prefix_blacklist, '')
        return '.'.join([subdomain, parts.domain])
    else:
        return parts.domain


def dump_to_db(title, body, issue_number):
    '''Store issue details to issue_db'''
    url = extract_url(body)
    domain = extract_domain_name(url)
    issue_db.add(WCIssue(issue_number, title, url, domain, body))
    issue_db.commit()
