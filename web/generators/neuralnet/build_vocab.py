import settings
from sys import stdin
import argparse
from nltk import pos_tag
from nltk.tokenize import word_tokenize
from collections import Counter
import pickle
import settings

parser = argparse.ArgumentParser(description='Build probability based vocab for sentence grammar nueralnet, outputs pickled data structure for lookup.')

parser.add_argument('infile', nargs='?', type=argparse.FileType('r'),
                     default=stdin)

parser.add_argument('outfile', nargs=1, type = str)

class SuffixFrequencies:

    def __init__(self):
        self.word_dict = {'no_prefix' : Counter()}
    
    def add_pair(self, word, suffix):
        if not word in self.word_dict:
            self.word_dict[word] = Counter()

        self.word_dict['no_prefix'][suffix] += 1
        self.word_dict[word][suffix] += 1

    def get_suffixes(self, word):
        return self.word_dict[word]

    def get_pair_frequency(self, word, suffix):
        try:
            return self.word_dict[word][suffix]
        except KeyError:
            return 0

    def get_POS_frequency(self, word, POS):
        if word not in self.word_dict:
            raise Exception('Word {} is not in suffix libarary. Cannot calculate the frequency of suffix POS'.format(word))

        return sum([
            freq
            for suffix_tup, freq in self.word_dict[word].items()
            if suffix_tup[1] == POS
        ])

    def save(self, filename):
        with open(filename, 'wb') as outpickle:
            pickle.dump(self, outpickle)

def find_suffixes(articles):
    
    j = 1 # modulates how many words are grabbed for suffixes

    freq_dict = SuffixFrequencies()

    for article_title in articles:
        words = (('__start__', '__start__'), *settings.get_POS_tokens(article_title))
        for i, word in enumerate(words):
            if i + j < len(words):
                freq_dict.add_pair(word, words[i + j])
    
    return freq_dict

def load(filename):
    with open(filename, 'rb') as pickleobj:
        return pickle.load(pickleobj)

def main(infile, outfile):
    find_suffixes(infile.read().split('\n')).save(outfile)

if __name__ == "__main__":
    args = parser.parse_args()
    main(args.infile, args.outfile[0])