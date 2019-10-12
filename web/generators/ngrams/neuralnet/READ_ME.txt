# Process for cleaning input corpus, building neuralnet, and generating listicles

1. Use 'filter_corpus' command on the scraped corpus to find article titles following your desired format
    * Ex. $python filter_corpus.py [infile: scraped buzzfeed titles] [outfile: filtered article titles]
    * Currently this command only filters for num-start articles (e.g. "47 things I like about fish"), but in the future arguments may be added to sort for other content styles

2. Use 'substitute_tokens' command on filtered article titles to clean corpus and extract numbers and other non-word datatypes
    * Ex. $python substitute_tokens.py [-save_quotes: filename to save extracted quotes (optional)] < [infile: filtered_titles] > [outfile: tokened_titles]
    * List of substitutions and regex rules can be found in 'settings.py' module

3. Use 'build_neuralnet' command to construct grammar neuralnet, and save result as pickled object.
    * Ex. $python build_neuralnet.py [infile: tokened_titles] [outfile: pickled grammar neuralnet object]

4. Use 'build_vocab' command to construct suffix probabilities graph and save result as pickled object.
    * Ex. $python build_vocab.py [infile: tokened_titles] [outfile: pickled vocab graph object]

5. 