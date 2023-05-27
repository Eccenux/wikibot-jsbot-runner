import WikiBatches from './wikiBatches.js';

const searchUrlTpl = function(limit, offset) {
	return `https://pl.wikipedia.org/w/index.php?limit=${limit}&offset=${offset}&sort=last_edit_asc&search=insource%3A%27imdb.com%2Fname%27+insource%3A%2F%5C%5Bhttps%3F%3A%5C%2F%5C%2Fwww%5C.imdb%5C.com%5C%2Fname%5C%2Fnm%5B0-9a-z%5D%2B%5C%2F+%2F&title=Specjalna:Szukaj&profile=advanced&fulltext=1&ns0=1&ns6=1&ns8=1&ns10=1&ns14=1&ns100=1`;
}
const expectedSummary = 'imdb';
const batchBot = new WikiBatches(searchUrlTpl, expectedSummary);

(async () => {
	const batches = 2;
	const batchSize = 10;
	await batchBot.runBatches(batches, batchSize);
})().catch(err => {
	console.error(err);
	process.exit(1);
});
