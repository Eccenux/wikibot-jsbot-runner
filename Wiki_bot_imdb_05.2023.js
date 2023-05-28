import WikiBatches from './wikiBatches.js';

const searchUrlTpl = function(limit, offset) {
	// bio
	// const query = [`insource:'imdb.com/name'`, /\[https?:\/\/www\.imdb\.com\/name\/nm[0-9a-z]+\/ /];

	// awards
	const query = [`insource:'imdb.com/name'`, /\[https?:\/\/www\.imdb\.com\/name\/nm[0-9]+\/awards/];
	return batchBot.searchUrl(query, limit, offset);
}
const expectedSummary = 'imdb';
const batchBot = new WikiBatches(searchUrlTpl, expectedSummary);
// mock
batchBot.mock = true;
batchBot.mockSleep = 2_000;

(async () => {
	const batches = 1;
	const batchSize = 3;
	await batchBot.runBatches(batches, batchSize);
})().catch(err => {
	console.error(err);
	process.exit(1);
});
