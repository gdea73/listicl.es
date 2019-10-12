import settings
from sys import stdin, stdout
import argparse
from nltk import pos_tag
from nltk.tokenize import word_tokenize, sent_tokenize
import pickle
from scipy.stats import rv_discrete
from numpy import arange

parser = argparse.ArgumentParser(description='Build probability based neuralnet for sentence construction.')

parser.add_argument('infile', nargs='?', type=argparse.FileType('r'),
                     default=stdin)
parser.add_argument('outfile', nargs=1, type = str)

class WordPOSNode:
    
    def __init__(self, POS):
        self.POS = POS
        self.children = {}
        self.freq = 1
        self.num_children = 0
        
    def add_suffixPOS(self, POS):
        if not POS in self.children:
            self.children[POS] = WordPOSNode(POS)
        else:
            self.children[POS].increment()
        
        self.num_children += 1
        return self.children[POS]
            
    def increment(self):
        self.freq += 1
        
    def probability_nextPOS(self, POS):
        if not POS in self.children:
            return 0
        
        return self.children[POS].freq / self.num_children

    def get_POS_distribution(self):
        return [(child.POS, child.freq / self.num_children) for POS, child in self.children.items()]

    def traverse_POS(self, POS):
        assert(POS in self.children), 'POS: {} not a possible next POS.'.format(POS)
        return self.children[POS]
    
    def __str__(self):
        total_children = sum([child.freq for child in self.children.values()])
        return '\n'.join(['{}: %{}'.format(POS,str((child.freq/total_children * 100)//1)) for POS, child in self.children.items()])

    def choose_random_POS(self):
        if len(self.children) == 0:
            return '__end__'
        
        distribution = self.get_POS_distribution()
        return distribution[rv_discrete(values = (
            arange(len(self.children)), [px for x, px in distribution]
        )).rvs(size = 1)[0]][0]

    def generate_POS_path(self):
        if len(self.children) == 0 or self.POS == '__end__':
            return ['__end__']

        return [self.POS, *self.traverse_POS(self.choose_random_POS()).generate_POS_path()]

def generate(infile):
    tag_list = [
        tag 
        for sentence in infile.read().split('\n')
        for word, tag in settings.get_POS_tokens(sentence)
    ]
    #print(tag_list)
    #print(tag_list)
    root_node = WordPOSNode('__start__')
    sub_node = root_node
    for tag in tag_list:
        sub_node = sub_node.add_suffixPOS(tag)
        if tag == '__end__':
            sub_node = root_node
    
    return root_node

def save(filename, net_root):
    with open(filename, 'wb') as outpickle:
        pickle.dump(net_root, outpickle)

def load(filename):
    with open(filename, 'rb') as pickleobj:
        return pickle.load(pickleobj)

def main(infile, outfile):
    save(outfile, generate(infile))
        
if __name__ == "__main__":
    args = parser.parse_args()
    main(args.infile, args.outfile[0])
    
