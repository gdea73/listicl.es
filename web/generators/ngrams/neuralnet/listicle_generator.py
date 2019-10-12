from build_neuralnet import WordPOSNode, load
from build_vocab import SuffixFrequencies, load
import argparse
import pickle
from scipy.stats import rv_discrete
from numpy import arange,array, random
import settings
from collections import Counter
#import random

parser = argparse.ArgumentParser(description='Generate a procedurally-generated listicle')

parser.add_argument('suffixesfile', nargs=1, type=str)
parser.add_argument('grammarfile', nargs=1, type = str)
parser.add_argument('seed', nargs='?', type = int, default = 1000)

class BadPathError(Exception):
    
    def __init__(self, badword):
        self.badword = badword

def generate(POS_root, suffixes):
    pass

def get_next_word(POS_node, preword, vocab, exclude):
    if len(POS_node.children) == 1 and '__end__' in POS_node    .children:
        return ('__end__', '__end__')

    suffix_pos_freqs = Counter()
    for word in vocab.get_suffixes(preword).keys():
        if not word in exclude:
            suffix_pos_freqs[word[1]] += 1
    
    #print(suffix_pos_freqs)

    words_and_probs = list(zip(*[
        (word, POS_node.probability_nextPOS(word[1]) * 1 / suffix_pos_freqs[word[1]])   
        for word in vocab.get_suffixes(preword).keys() 
        if suffix_pos_freqs[word[1]] > 0 and not word in exclude
    ]))

    if len(words_and_probs) == 0:
        raise BadPathError(preword)
    words, probs = words_and_probs[0], array(words_and_probs[1])
    scale = sum(probs)
    if scale == 0:
        raise BadPathError(preword)
    probs = probs/scale
    dist = rv_discrete(values = (arange(len(probs)), (probs) ) )
    return words[dist.rvs(size = 1)[0]]

class listicle_node:

    def __init__(self, word, generator_node):
        self.word = word,
        self.generator_node = generator_node
        self.value = word[0]

    def __str__(self):
        return self.value + self.generator_node.POS

def recurse_listicle(prev_node, prev_word, vocab, exclude = set()):

    if prev_word == ('__end__','__end__'):
        return []

    while True:
        curr_word = get_next_word(prev_node, prev_word, vocab, exclude)
        curr_node = prev_node.traverse_POS(curr_word[1])

        try:
            return (listicle_node(curr_word, curr_node), *recurse_listicle(curr_node, curr_word, vocab))
        except BadPathError as err:
            exclude.add(err.badword)
    
def generate_listicle(root, vocab):
    
    listicle_str = ''
    for node in recurse_listicle(root, ('__start__','__start__'), vocab):
        if node.value in settings.TOKENS_DICT:
            node.value = str(settings.TOKENS_DICT[node.value].substitute())
        if '"' in node.value:
            listicle_str += ' ' + str(node.value)
        elif not '\'' in node.value and not node.value in 'T()’“”.,;!?:':
            listicle_str += ' ' + str(node.value)
        else:
            listicle_str += str(node.value)
    return listicle_str

if __name__ == "__main__":
    args = parser.parse_args()
    vocab = load(args.suffixesfile[0])
    root_node = load(args.grammarfile[0])
    random.seed(args.seed)
    print(generate_listicle(root_node, vocab))




