import WikiBatches from './wikiBatches.js';

const searchUrlTpl = function(limit, offset) {
	const query = [/\{\{FISA\|[a-z0-9-]{24}/];

	return batchBot.searchUrl(query, limit, offset);
}
const expectedSummary = 'FISA';
const batchBot = new WikiBatches(searchUrlTpl, expectedSummary);
// mock
// batchBot.mock = true;
// batchBot.mockSleep = 2_000;

(async () => {
	const batches = 12;
	const batchSize = 50;
	await batchBot.runBatches(batches, batchSize);
})().catch(err => {
	console.error(err);
	process.exit(1);
});
