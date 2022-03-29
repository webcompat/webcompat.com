#!/usr/bin/python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

def node_text(tree, tag_name):
    """Extract the text node in a tree for a specific tag_name.

    It will only work with unique text nodes.
    """
    node = tree.getElementsByTagName(tag_name)[0]
    return node.childNodes[0].data


def parse_site_dom_element(el):
    url = node_text(el, 'aws:DataUrl')
    rank = int(node_text(el, 'aws:Rank'))
    return url, rank
