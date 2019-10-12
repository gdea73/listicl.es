import re
import argparse
from sys import stdin, stdout

parser = argparse.ArgumentParser(description='Filter for article names with number starts, and substitutes tokens for special words.')

parser.add_argument('infile', nargs='?', type=argparse.FileType('r'),
                     default=stdin)
parser.add_argument('outfile', nargs='?', type=argparse.FileType('w'),
                     default=stdout)


def num_start_filter(infile, outfile):
    
    num_start_titles = '\n'.join([
        title for title in infile.read().split('\n') if re.match(r'^\d+\s', title)
    ])

    outfile.write(num_start_titles)

if __name__ == "__main__":
    args = parser.parse_args()
    num_start_filter(args.infile, args.outfile)
    


