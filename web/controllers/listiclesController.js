const { execSync } = require('child_process');

const SEED_SEP = ':';

const generation_methods = {
	ngrams: ngrams
}

function ngrams(seed) {
	const generator_dir = './generators/ngrams';
	const n = 3;
	const min_length = 4;
	const max_length = 20;
	const iterations = 1;
	const command = `${generator_dir}/ngrams.py ${n} ${min_length} ${max_length} ${iterations} `
		+ `--ngram_model_file ${generator_dir}/original_corpus.ngram --start_token '$num' `
		+ `--end_token '$end'`;
	console.log(command)
	let content = execSync(command).toString().replace('$end', '').replace('\\', '');
	// TODO: more advanced (i.e., more amusing) random number generation
	while (content.includes('$num')) {
		content = content.replace('$num', Math.random() * 100 << 0);
	}
	content = content.replace('$end', '');
	console.log(`content: ${content}`);
	return content;
}

get_random_generator_ID = () => {
	const keys = Object.keys(generation_methods);
	return keys[keys.length * Math.random() << 0];
}

exports.generate = () => {
	generator_ID = get_random_generator_ID()
	seed = Math.random();
	content = generation_methods[generator_ID](seed);
	return {seed: generator_ID + SEED_SEP + seed, content}
}
