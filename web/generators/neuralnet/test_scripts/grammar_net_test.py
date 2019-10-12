import build_neuralnet
from build_neuralnet import WordPOSNode

net = build_neuralnet.load('text_versions/netv1')
#print(net.get_POS_distribution())
#print(net.generate_sentence())

#net = net.traverse_POS('__num__')

#print(net.generate_sentence())
print(net.generate_sentence())