const { execSync } = require('child_process');
const crypto = require('crypto');

const SEED_SEP = ':';
const NUM_RAND_MIN = 2;
const NUM_RAND_MAX = 100;
const BIG_RAND_MIN = 1000;
const BIG_RAND_MAX = 1000000;
const RAND_YEAR_MIN = 1920;
const RAND_YEAR_MAX = 2020;

// use tmpfs for greater performance in production
const generators_path = './generators_tmpfs';

const generation_methods =
{
	// saved here for historical purposes (lots of non-English data):
	// ngrams_original: (seed) => { return ngrams('original_corpus.ngram', seed); },
	ngrams_en_archive_listonly: (seed) => { return ngrams('en_archive_2019_08.ngram', seed); },
	neuralnet: (seed) => { return neuralnet(seed); }
}

neuralnet = (seed) =>
{
	const generator_dir = `${generators_path}/neuralnet`;
	const vocab = `text_versions/vocab/vocabv0`;
	const grammar = `text_versions/grammar/num_grammar`;
	const command = `cd ${generator_dir} && python ./listicle_generator.py ${vocab} ${grammar} ${seed}`;

	console.log(command);
	let content = execSync(command).toString().trim();
	console.log(`content: ${content}`);
	return content;
}

function strip_content(string) {
	return string.replace(/\d+/g, '').trim();
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

	console.log(`server content: ${serverContent}; client content: ${clientContent}`);
	return (serverContent === clientContent);
}

function random_replace(content, query, min, max) {
	while (content.includes(query)) {
		var random_value = min + (Math.random() * (max - min)) << 0;
		content = content.replace(query, random_value);
	}
	return content;
}

function ngrams(ngram_model_file, seed) {
	const generator_dir = `${generators_path}/ngrams`;
	const n = 3;
	const min_length = 3;
	const max_length = 21;
	const iterations = 1;
	const command = `${generator_dir}/ngrams/ngrams.py ${n} ${min_length} ${max_length} `
		+ `${iterations} --ngram_model_file ${generator_dir}/${ngram_model_file} `
		+ `--start_token '$num' --end_token '$end' --seed ${seed}`;
	console.log(command)
	let content = execSync(command).toString().replace('$end', '').replace('\\', '');
	content = random_replace(content, '$num', NUM_RAND_MIN, NUM_RAND_MAX);
	content = random_replace(content, '$bignum', BIG_RAND_MIN, BIG_RAND_MAX);
	content = random_replace(content, '$yearnum', RAND_YEAR_MIN, RAND_YEAR_MAX);
	content = content.replace('\n', '');
	console.log(`content: ${content}`);
	return content;
}

get_random_generator_ID = () => {
	const keys = Object.keys(generation_methods);
	return keys[keys.length * Math.random() << 0];
}

exports.generate = () => {
	generator_ID = get_random_generator_ID()
	seed = ((Math.random() - 0.5) * ~(1 << 31)) << 0;
	content = generation_methods[generator_ID](seed);
	return {seed: generator_ID + SEED_SEP + seed, content}
}
