import WikiBatches from './wikiBatches.js';

const searchUrlTpl = function(limit, offset) {
	const query = [ `hastemplate: "col-begin"`, `hastemplate: "col-2"`, /\{\{col-(break|2)\}\}.{1,3}\*/ ];

	return batchBot.searchUrl(query, limit, offset);
}
const expectedSummary = 'WP:Dostępność';
const batchBot = new WikiBatches(searchUrlTpl, expectedSummary);
// mock
// batchBot.mock = true;
// batchBot.mockSleep = 2_000;

(async () => {
	const batches = 1;
	const batchSize = 12;
	// const batches = 1;
	// const batchSize = 3;
	await batchBot.runBatches(batches, batchSize);
})().catch(err => {
	console.error(err);
	process.exit(1);
});
