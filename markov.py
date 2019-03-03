import markovify
import random

with open('headlines.txt') as f:
    text = f.read()

text.replace('\n', '. ')

text_model = markovify.Text(text, state_size=2)

for i in range(1):
    print(text_model.make_short_sentence(80))

# def get_next_two_nonblank_words(words, index):
#     while not words[index]:
#         index += 1
#     first_word = words[index]
#     index += 1
#     while not words[index]:
#         index += 1
#     second_word = words[index]
#     return (first_word, second_word)
# 
# bigrams = dict()
# words = text.replace('\n', ' ').replace('"', '').split(' ')
# 
# for i in range(len(words) - 1):
#     word = words[i]
#     next_word = words[i + 1]
#     if not word:
#         continue
#     #print('word: ' + word)
#     #print('next: ' + next_word)
#     if not word in bigrams:
#         #print('adding new word')
#         bigrams[word] = dict()
#     if not next_word in bigrams[word]:
#         #print('adding new next word')
#         bigrams[word][next_word] = 1
#     else:
#         #print('incrementing next word ({0})'.format(bigrams[word][next_word]))
#         bigrams[word][next_word] += 1
# 
# first_word = random.choice(list(bigrams))
# print('first_word: ' + first_word)
# sentence = first_word
# possibilities = list(bigrams[first_word])
# print(possibilities)


# for i in range(10):
#      if words[i]:
#          print(words[i] + ' : ' + str(bigrams[words[i]]))
