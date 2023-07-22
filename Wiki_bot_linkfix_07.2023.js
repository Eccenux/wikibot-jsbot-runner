import WikiBatches from './wikiBatches.js';

const searchUrlTpl = function(limit, offset) {
	const query = [ `insource:"Morningside Arena"`, /\[\[Morningside Arena(\||\]\])/ ];
	// const query = [ `insource:"Adam Przybylski"`, /autor link *= *Adam Przybylski *\|/ ];

	return batchBot.searchUrl(query, limit, offset);
}
const expectedSummary = 'popr. linka';
const batchBot = new WikiBatches(searchUrlTpl, expectedSummary);
// mock
batchBot.mock = true;
// batchBot.mockSleep = 2_000;

(async () => {
	const batches = 1;
	const batchSize = 3;
	await batchBot.runBatches(batches, batchSize);
})().catch(err => {
	console.error(err);
	process.exit(1);
});
