#!/usr/bin/python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""
Script for assigning priority to sites.

The rule is as follows:
    Critical: alexa top 100 in worldwide
    Important: alexa top 101-1000 in worldwide or alexa top 100 in tier 1 countries/regions
    Normal: alexa top 1001-10000 or alexa top 101-1000 in tier 1 countries/regions
"""

import argparse
import datetime

from tools.topsites.tranco import Tranco
from tools.topsites.alexa import Alexa
from tools.topsites.siterank import SiteRank
from tools.topsites.siterank import DATA_PATH
from tools.topsites.utils import parse_site_dom_element

REGIONS = ['US', 'FR', 'IN', 'DE', 'TW', 'ID', 'HK', 'SG', 'PL',
           'GB', 'RU']


def main() -> None:
    description = "Script to fetch and update top site ranking from Tranco and optionally Alexa."
    parser = argparse.ArgumentParser(description=description)

    parser.add_argument(
        "--retrieve-regional",
        action="store_true",
        help="Whether to retrieve regional ranking from Alexa (access and secret keys will be required).",
    )

    parser.add_argument(
        "--ats_access_key",
        help="AWS access key.",
        type=str,
    )
    parser.add_argument(
        "--ats_secret_key",
        help="AWS secret key.",
        type=str,
    )

    args = parser.parse_args()
    retrieve_regional = args.retrieve_regional

    if retrieve_regional:
        end_date = datetime.datetime(2022, 12, 14).date()
        today = datetime.datetime.now().date()

        if today > end_date:
            print('Alexa APIs has been deprecated on December 15, 2022. Regional rankings will not be updated.')
            retrieve_regional = False
        else:
            print('Warning: Alexa APIs will be deprecated on December 15, 2022.')

            if not (args.ats_secret_key and args.ats_access_key):
                print('Please specify secret and access key for Alexa API.')
                return

    tranco = Tranco(DATA_PATH)
    tranco_list = tranco.get_list()
    siterank = SiteRank()

    # Get global ranking
    for (i, domain) in enumerate(tranco_list, start=1):
        siterank.save_global_rank(domain, i)

    # Get ranking per country
    if retrieve_regional:
        alexa = Alexa(args.ats_access_key, args.ats_secret_key)
        for country_code in REGIONS:
            sites = alexa.query_topsites(country_code=country_code)
            for site in sites:
                url, rank = parse_site_dom_element(site)
                siterank.save_regional_rank(url, rank, country_code)

        siterank.commit_regional()

    siterank.commit_global()

    siterank.cleanup_db(retrieve_regional)
    tranco.cleanup()


if __name__ == "__main__":
    main()


