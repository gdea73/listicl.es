#!/bin/env python3

from bs4 import BeautifulSoup
import dryscrape
import urllib.request
import re
import time
import sys

listicle_pattern = re.compile("^[0-9]+ .*")

WEB_ARCHIVE_BASE_URL = (
    'http://web.archive.org/web/{0}/https://www.buzzfeed.com/index.xml'
)
WEB_ARCHIVE_SNAPSHOT_URL_PREFIX = (
    'http://web.archive.org/web'
)
BUZZFEED_SNAPSHOT_URL_FORMAT_PATTERN = (
        re.compile('/web/20[0-1][0-9]*/https://www.buzzfeed.com/index.xml')
)

# visiting pages breaks the unmaintained "dryscrape" library, so only one year
# can be processed per iteration of this script
def get_buzzfeed_RSS_URLs(year):
    urls = list()
    session = dryscrape.Session()
    year_archive_URL = WEB_ARCHIVE_BASE_URL.format(str(year) + '0101000000*')
    # print('year archive URL: {0}'.format(year_archive_URL))
    session.visit(year_archive_URL)
    page = session.body()
    soup = BeautifulSoup(page, 'lxml')
    capture_divs = soup.find_all('div', class_='captures')
    for div in capture_divs:
        archive_URL = div.a.get('href')
        # print('archive URL: {0}'.format(archive_URL))
        if BUZZFEED_SNAPSHOT_URL_FORMAT_PATTERN.match(archive_URL):
            urls.append(archive_URL)
    return urls

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('usage: {0} [year]'.format(sys.argv[0]))
        exit(1)
    # print('searching archive.org for Buzzfeed RSS snapshots from {0}'.format(sys.argv[1]))
    snapshot_RSS_URLs = get_buzzfeed_RSS_URLs(sys.argv[1])
    for url in snapshot_RSS_URLs:
        print(url)
