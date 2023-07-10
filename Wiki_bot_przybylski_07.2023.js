import WikiBatches from './wikiBatches.js';

const searchUrlTpl = function(limit, offset) {
	// const query = [ `insource:"Adam Przybylski"`, /\[\[Adam Przybylski(\||\]\]| \(1896–1945\)\]\])/ ];
	const query = [ `insource:"Adam Przybylski"`, /autor link *= *Adam Przybylski *\|/ ];

	return batchBot.searchUrl(query, limit, offset);
}
const expectedSummary = 'Przybylski';
const batchBot = new WikiBatches(searchUrlTpl, expectedSummary);
// mock
// batchBot.mock = true;
// batchBot.mockSleep = 2_000;

(async () => {
	const batches = 10;
	const batchSize = 14;
	await batchBot.runBatches(batches, batchSize);
})().catch(err => {
	console.error(err);
	process.exit(1);
});
