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

def build_ngram_model(stdin):

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
        ngram_model = build_ngram_model(stdin)
        generated_text = generate_text(ngram_model)
        for line in generated_text:
            print(line)

if __name__ == '__main__':
    main()
