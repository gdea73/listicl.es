const { execSync } = require('child_process');
const crypto = require('crypto');

const SEED_SEP = ':';
const NUM_RAND_MIN = 2;
const NUM_RAND_MAX = 100;
const BIG_RAND_MIN = 1000;
const BIG_RAND_MAX = 1000000;
const RAND_YEAR_MIN = 1920;
const RAND_YEAR_MAX = 2020;

const generation_methods = {
	// saved here for historical purposes (lots of non-English data):
	// ngrams_original: (seed) => { return ngrams('original_corpus.ngram', seed); },
	ngrams_en_archive_listonly: (seed) => { return ngrams('en_archive_2019_08.ngram', seed); }
}

function strip_content(string) {
	return string.replace(/\d+/g, '');
}

exports.validate = (combinedSeed, clientContent) => {
	// first, extract the generation strategy from the seed
	var seedComponents = combinedSeed.split(':');
	var method = generation_methods[seedComponents[0]];
	var seed = seedComponents[1];

	console.log(`seed: ${seed}, clientContent: ${clientContent}`);

	if (!method) {
		return false;
	}

	var serverContent = method(seed);
	serverContent = strip_content(serverContent);
	clientContent = strip_content(clientContent);
	console.log(`server content: ${serverContent}; client content ${clientContent}`);
	return (serverContent === clientContent);
}

function ngrams(ngram_model_file, seed) {
	const generator_dir = './generators/ngrams';
	const n = 3;
	const min_length = 3;
	const max_length = 20;
	const iterations = 1;
	const command = `${generator_dir}/ngrams/ngrams.py ${n} ${min_length} ${max_length} `
		+ `${iterations} --ngram_model_file ${generator_dir}/${ngram_model_file} `
		+ `--start_token '$num' --end_token '$end' --seed ${seed}`;
	console.log(command)
	let content = execSync(command).toString().replace('$end', '').replace('\\', '');
	while (content.includes('$num')) {
		content = content.replace('$num',
				NUM_RAND_MIN + (Math.random() * (NUM_RAND_MAX - NUM_RAND_MIN)) << 0);
	}
	while (content.includes('$bignum')) {
		content = content.replace('$bignum',
				BIG_RAND_MIN + (Math.random() * (BIG_RAND_MAX - BIG_RAND_MIN)) << 0);
	}
	while (content.includes('$yearnum')) {
		content = content.replace('$yearnum',
				RAND_YEAR_MIN + (Math.random * (RAND_YEAR_MAX - RAND_YEAR_MIN)) << 0);
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
	seed = ((Math.random() - 1) * ~(1 << 31)) << 0;
	content = generation_methods[generator_ID](seed);
	return {seed: generator_ID + SEED_SEP + seed, content}
}
