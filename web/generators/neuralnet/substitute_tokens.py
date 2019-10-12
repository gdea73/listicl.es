import settings
import argparse
from sys import stdout, stdin
import re

parser = argparse.ArgumentParser(description='Substitutes words with special behaviors with tokens.')

parser.add_argument('infile', nargs='?', type=argparse.FileType('r'),
                     default=stdin)
parser.add_argument('outfile', nargs='?', type=argparse.FileType('w'),
                     default=stdout)
parser.add_argument('-savequotes', nargs='?', type=argparse.FileType('w'),
                     default=False)

def main(infile, outfile, savequotes):
    
    corpus = infile.read()

    quotes = re.findall(settings.RE_TOKENS['__quote__'], corpus)

    for token, pattern in settings.RE_TOKENS.items():
        corpus = re.sub(pattern, token, corpus)

    outfile.write(corpus)
    
    if savequotes:
        savequotes.write('\n'.join(quotes))

if __name__ == "__main__":
    args = parser.parse_args()
    main(args.infile, args.outfile, args.savequotes)