from bs4 import BeautifulSoup
import urllib.request

# Parse URLs in format https://www.buzzfeed.com/archive/2018/1
base_url = 'https://www.buzzfeed.com/archive/'
# Archive runs from 2006 to 2019
for year in range(2006, 2020):
    for month in range (1, 13):
        url = base_url + str(year) + '/' + str(month)
        try:
            page = urllib.request.urlopen(url)
            #print('Successfully loaded ' + url)
            soup = BeautifulSoup(page, 'html.parser')
            #print('Succesfully parsed ' + url)
            headlines = soup.find_all('h2', class_='link-gray xs-mb05 xs-pt05 sm-pt0 xs-text-4 sm-text-2 bold')
            for title in headlines:
                content = title.contents
                print(str(content)[2:-2])
        except:
            pass
            #print('Error with url ' + url)
