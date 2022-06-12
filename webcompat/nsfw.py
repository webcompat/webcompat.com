#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Helpers methods for nsfw detection."""

import re

from webcompat.db import SiteNSFW
from webcompat.db import site_nsfw_db
from webcompat.helpers import get_domains

NSFW_LABEL = 'nsfw'


def is_url_nsfw(url):
    return site_nsfw_db.query(SiteNSFW).filter_by(url=url).first()


def get_nsfw_label(hostname):
    """Query the nsfw DB for hostname or domain."""
    if hostname:
        if is_url_nsfw(hostname):
            return NSFW_LABEL

        # If hostname not found, try less-level domain (>2)
        # If hostname is lv4.lv3.example.com, find lv3.example.com/example.com
        domains = get_domains(hostname)
        for domain in domains:
            if is_url_nsfw(domain):
                return NSFW_LABEL

    return None


def moderate_screenshot(body):
    pattern = re.compile(r'<img alt="Screenshot" [^>]*src="([^"]+)"[^>]*>')
    clean_body = re.sub(
        pattern,
        'Screenshot removed - possible explicit content.',
        body
    )
    return clean_body
