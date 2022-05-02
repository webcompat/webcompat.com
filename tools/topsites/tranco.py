#!/usr/bin/python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import requests
from datetime import datetime, timedelta

TRANCO_API = 'https://tranco-list.eu/api/lists/date/'
CSV_FILE_PREFIX = 'tranco_'


class Tranco:
    def __init__(self, data_path: str) -> None:
        self.data_path = data_path
        self.file_path = ''

    def get_file_path(self, list_id: str) -> str:
        return os.path.join(self.data_path, list_id + '.csv')

    def get_creation_date(self) -> str:
        day_before = (datetime.utcnow() - timedelta(days=1))
        return day_before.strftime('%Y-%m-%d')

    def get_latest_list_data(self, creation_date: str) -> dict:
        headers = {'user-agent': 'webcompat-topsites-service'}
        response = requests.get(TRANCO_API + creation_date, headers)
        response.raise_for_status()
        return response.json()

    def download_csv(self, list_id: str, size: int, creation_date: str) -> str:
        data = self.get_latest_list_data(creation_date)

        if 'download' in data:
            download_url = data['download'] + str(size)
            dr = requests.get(download_url, stream=True)
            dr.raise_for_status()

            file_bytes = dr.content
            with open(self.get_file_path(list_id), 'wb') as f:
                f.write(file_bytes)
            lst = file_bytes.decode('utf-8')
            return lst

    def get_list(self, size: int = 10000) -> list:
        creation_date = self.get_creation_date()
        list_id = CSV_FILE_PREFIX + creation_date
        self.file_path = self.get_file_path(list_id)

        if os.path.exists(self.file_path):
            with open(self.file_path) as f:
                csv = f.read()
        else:
            csv = self.download_csv(list_id, size, creation_date)

        return list(map(lambda x: x[x.index(',') + 1:], csv.splitlines()))

    def cleanup(self) -> None:
        os.remove(self.file_path)
