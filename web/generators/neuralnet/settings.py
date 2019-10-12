
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk import pos_tag
import math
from numpy.random import uniform
import re

QUOTELIST = './text_versions/quotes.txt'

anchors = set(stopwords.words('english'))

#anchors = anchors | {'this','the','for',"wasn't","that'll","you'll","you've","aren't","that",'of','I'}

class token_factory:

    def __init__(self, token_name):
        self.token_name = token_name

    def substitute(self):
        return self.token_name

class integer_factory:

    def __init__(self, high, low):
        self.high = high
        self.low = low
        
    def substitute(self):
        return int(uniform() * (self.high - self.low) + self.low)

class quote_factory:

    def __init__(self, quotelist):
        self.quotelist = quotelist

    def substitute(self):
        return '"{}"'.format(self.quotelist[ int(uniform(low = 0, high = len(self.quotelist))) ].strip())

class SpecialToken:

    def __init__(self, token_name, substitution_factory, regex , POS = None):
        self.token_name = token_name
        self.regex = regex
        self.POS = POS
        self.substitution_factory = substitution_factory

    def substitute(self):
        return self.substitution_factory.substitute()

class end_token_factory:

    def __init__(self,punc):
        self.punc = punc

    def substitute(self):
        return self.punc


with open(QUOTELIST, 'r') as f:
    quoteslist = f.readlines()

QUOTES_TOKEN = SpecialToken('__quote__', quote_factory(quoteslist), r'^__quote__$', '__quote__')

special_tokens = [
    SpecialToken('__yearnum__', integer_factory(2020, 1900),r'^([12][890]\d\d)$','__yearnum__'),
    SpecialToken('__num__', integer_factory(50,10), r'^(\d+)$', '__num__'),
    SpecialToken('__bignum__',integer_factory(1000000, 1000), r'^\d+?[,\d]*$', '__bignum__'),
    QUOTES_TOKEN,
    SpecialToken('__end__', end_token_factory(''), r'__end__', '__end__')
]

for anchor in anchors:
    special_tokens.append(
        SpecialToken('__{}__'.format(anchor), token_factory(anchor.capitalize()), r'^{}$'.format(str(anchor)), POS = '__{}__'.format(anchor))
    )

TOKENS_DICT = {
    token.token_name : token for token in special_tokens
}

def get_POS_tokens(sentence):
    token_assignments = []
    pre_factored_sentence = re.sub(r'"(.+?)"', QUOTES_TOKEN.token_name, sentence)
    tokenized_sentence = word_tokenize(pre_factored_sentence)
    for word, (lowered_word, pos) in zip(tokenized_sentence, pos_tag([word.lower() for word in tokenized_sentence])):
        for token in special_tokens:
            if re.match(token.regex, lowered_word):
                word = token.token_name
                if token.POS:
                    pos = token.POS
                break
        token_assignments.append((word, pos))
    token_assignments.append(('__end__','__end__'))
    return token_assignments
