import WikiBatches from './wikiBatches.js';

const searchUrlTpl = function(limit, offset) {
	const query = [
		`insource:'[[de:'`,
		/\[\[Kategoria:[^\]]+\]\].{1,5}\[\[de:/,
		`-deepcat:"Pistolety"`,
		`-deepcat:"Karabiny"`,
	 ];
	 
	return batchBot.searchUrl(query, limit, offset);
}
const expectedSummary = 'interwiki';
const batchBot = new WikiBatches(searchUrlTpl, expectedSummary);
batchBot.ns = [0];	// main
// mock
// batchBot.mock = true;
// batchBot.mockSleep = 2_000;

(async () => {
	const batches = 1;
	const batchSize = 100;
	// const batches = 1;
	// const batchSize = 3;
	await batchBot.runBatches(batches, batchSize);
})().catch(err => {
	console.error(err);
	process.exit(1);
});
