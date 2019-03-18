#!/bin/env python3

import fileinput
import random
import sys

ITERATION_SEPARATOR = ','

def print_usage():
    print('Generate text using randomized word ngrams from standard input.\n')
    print('Usage: {0} [n] [start token] [end token] [minimum length] [maximum length] [iterations] '
        + '[filenames...]\n'.format(sys.argv[0]))
    print('n: the number of words to consider simultaneously when generating text.')
    print('start token: predetermined first word of output text')
    print('end token: delimeter at which a given text generation iteration stops; '
        + 'not included in generated text. Must be distinct from the start token.')
    print('minimum length: each iteration will be retried until the minimum length is reached.')
    print('maximum length: length at which to cease generating text if no end token found.')
    print('    note: the [min, max] length range is inclusive.')
    print('filenames: optional list of files to read in lieu of stdin.')

# selects one of the possible suffixes to a given ngram mapping
# weights them according to their relative frequency in the corpus
def weighted_select(ngram_mapping):
    # TODO write this
    total_count = 0
    delimiters = list()
    delimiters.append(0)
    for count in ngram_mapping.values():
        total_count += count
        # maintain running sum of suffix frequency
        delimiters.append(delimiters[-1] + count)
    random_index = random.randrange(total_count)
    # index into the running sum to determine the suffix for selection
    suffix_index = 1
    # print('delimiters: {0}'.format(delimiters))
    while delimiters[suffix_index] < random_index:
        suffix_index += 1
    # compensate for 1-indexed array of delimiters
    suffix_index -= 1
    # print('suffix_index: {0}'.format(suffix_index))
    # the keys are most likely returned in insertion order, but the choice should still be random
    suffixes = list(ngram_mapping.keys())
    # print('suffixes: {0}'.format(suffixes))
    return suffixes[suffix_index].split(' ')

class NgramModel:
    def __init__(self, n):
        self.prefixes = dict()
        self.n = n
    
    def build(self, corpus):
        for i in range(len(corpus) - (self.n - 1)):
            word = corpus[i]
            # build the suffix
            suffix = ''
            for j in range(1, self.n):
                # words in the suffix are joined with spaces for use as the dictionary key
                suffix += corpus[i + j] + ' '
            suffix = suffix.rstrip(' ')

            if not word in self.prefixes:
                # the first word of this ngram has not been seen before; register the prefix
                # print('new prefix: {0}'.format(word))
                self.prefixes[word] = dict()
            # count the suffix occurrence
            if not suffix in self.prefixes[word]:
                # register the suffix within the mapping, so its count can be incremented to 1 below
                self.prefixes[word][suffix] = 0
            # known suffix; increment its occurence count
            self.prefixes[word][suffix] += 1

    # returns an ngram beginning with the given prefix in the form of a list of words
    def generate_ngram(self, prefix):
        # print('generating {0}gram for prefix: {1}'.format(self.n, prefix))
        words = list()
        words.append(prefix)
        words += weighted_select(self.prefixes[prefix])
        # print('ngram: {0}'.format(' '.join(words)))
        return words


def generate_ngram_iteration(ngram_model, n, start_token, end_token, min_length, max_length):
    done_generating = False
    generated_words = list()
    ngram_prefix = start_token
    generated_words.append(start_token)

    while not done_generating:
        ngram = ngram_model.generate_ngram(ngram_prefix)
        if end_token in ngram:
            if len(generated_words) >= min_length:
                stop_index = ngram.index(end_token)
                if stop_index == 0:
                    print('warning: ngram generated beginning with an end token')
                # add the ngram up until (but not including) the end token to complete the iteration
                for i in range(1, stop_index):
                    generated_words.append(ngram[i])
                break
            # retry ngram generation if an end token is reached before the minimum length
        else:
            generated_words += ngram[1:]
            if len(generated_words) + n > max_length:
                break
        # use the last word generated as the prefix for the next ngram
        ngram_prefix = ngram[n - 1] 
        
    return generated_words

def main():
    if len(sys.argv) < 7:
        print_usage()
        exit(0)
    n = int(sys.argv[1])
    if n < 1:
        print('n must be a positive integer; exiting.')
        exit(1)

    start_token = sys.argv[2]
    end_token = sys.argv[3]
    min_length = int(sys.argv[4])
    max_length = int(sys.argv[5])
    iterations = int(sys.argv[6])

    # read stdin line for line
    stdin = ''
    for line in fileinput.input(sys.argv[7:]):
        stdin += line.replace('\n', '') + ' '

    if n == 1:
        # just shuffle stdin word-by-word in the degenerate case of the "1gram"
        shuffled_text = stdin.split(' ')
        random.shuffle(shuffled_text)

        for i in range(iterations):
            generated_words = list()
            while len(generated_words) < min_length:
                generated_words = list()
                # begin at a random index, and scan forwards until a start token is found
                word_index = random.randrange(len(shuffled_text))
                while shuffled_text[word_index] != start_token:
                    word_index += 1
                    # wrap around the shuffled text should the starting index reach the end
                    word_index %= len(shuffled_text)
                while True:
                    word = shuffled_text[word_index]
                    if word == end_token or len(generated_words) >= max_length:
                        break

                    generated_words.append(word)
                    word_index += 1
                    word_index %= len(shuffled_text)

            # print and terminate the iteration with a separator
            generated_text = [word for word in generated_words]
            print(generated_text)
            print(ITERATION_SEPARATOR)
    else:
        ngram_model = NgramModel(n)
        ngram_model.build(stdin.split(' '))
        for i in range(iterations):
            generated_words = list()
            # generate_ngram_iteration will ensure it meets the minimum length
            generated_words = generate_ngram_iteration(ngram_model, n, start_token, end_token,
                min_length, max_length)
            print(' '.join(generated_words))
            print(ITERATION_SEPARATOR)

if __name__ == '__main__':
    main()
