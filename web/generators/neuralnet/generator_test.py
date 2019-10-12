import listicle_generator
from build_vocab import SuffixFrequencies
import build_vocab
from build_neuralnet import WordPOSNode
import build_neuralnet

vocab = build_vocab.load('./text_versions/vocab/vocabv0')
root_node = build_neuralnet.load('./text_versions/grammar/num_grammar')

print(listicle_generator.generate_listicle(root_node, vocab))