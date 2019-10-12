import build_vocab
import pandas

vocab = build_vocab.find_suffixes(['I hate the cat','I hate moons that glow', 'I despise many children'])

print(vocab.word_dict)

print(vocab.get_POS_frequency(('I','PRP'),'VBP'))

vocab.save('vocabv1')