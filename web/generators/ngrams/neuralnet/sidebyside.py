import settings
import argparse
from sys import stdin, stdout
import pandas

parser = argparse.ArgumentParser()

parser.add_argument('infile', nargs='?', type=argparse.FileType('r'),
                     default=stdin)

parser.add_argument('outfile', nargs='?', type=argparse.FileType('w'),
                     default=stdout)

def main(infile, outfile):

    parsed_titles = []
    for title in infile.readlines()[:10]:
        parsed_titles.extend(settings.get_POS_tokens(title))

    outfile.write(str(parsed_titles))

if __name__ == "__main__":
    args = parser.parse_args()
    main(args.infile, args.outfile)

