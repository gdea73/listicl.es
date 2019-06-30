#!/usr/bin/env python3

from bs4 import BeautifulSoup
import urllib.request
import re

# 1-indexed to correspond with numeric month
days_in_month = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

BUZZFEED_URL = 'https://www.buzzfeed.com'
ARCHIVE_URL = '{}/archive'.format(BUZZFEED_URL)

def article_URL_nonenglish(url):
	article_URI = url[len(BUZZFEED_URL) + 1:]
	return re.match('^[a-z]{2}/', article_URI)

def get_headlines_for_date(year, month, day):
	# Parse URLs in format https://www.buzzfeed.com/archive/2018/12/24
	url = '{base}/{year}/{month}/{day}'.format(
		base = ARCHIVE_URL, year = year, month = month, day = day
	)
	try:
		page = urllib.request.urlopen(url)
		soup = BeautifulSoup(page, 'html.parser')
		headline_links = soup.find_all('a', class_='js-card__link link-gray')
		for link in headline_links:
			url = link['href']
			if article_URL_nonenglish(url):
				# print('URL {} deemed non-English; skipping.'.format(url))
				continue
			headline = link.contents
			print('{}'.format(headline[0]))
			# input()
	except:
		# print('Error with URL ' + url)
		return False
	return True

if __name__ == '__main__':
	# Archive runs from 2006 to 2019
	for year in range(2019, 2019 + 1):
		for month in range(1, 12 + 1):
			for day in range(1, days_in_month[month] + 1):
				# if the first day of a month cannot be retrieved, move on to the next month
				if not get_headlines_for_date(year, month, day) and day == 1:
					break
