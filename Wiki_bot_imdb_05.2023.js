import WikiBatches from './wikiBatches.js';

const searchUrlTpl = function(limit, offset) {
	// bio
	// const query = [`insource:'imdb.com/name'`, /\[https?:\/\/www\.imdb\.com\/name\/nm[0-9a-z]+\/ /];

	// awards
	// const query = [`insource:'imdb.com/name'`, /\[https?:\/\/www\.imdb\.com\/name\/nm[0-9]+\/awards/];
	
	// title - awards
	// const query = [ `insource:'imdb.com/title'`, `insource:'/awards'`, /\[https?:\/\/www\.imdb\.com\/title\/tt[0-9]+\/awards/ ];
	// soundtrack
	// const query = [ `insource:'imdb.com/title'`, `insource:'/soundtrack'`, /\[https?:\/\/www\.imdb\.com\/title\/tt[0-9]+\/soundtrack/ ];
	// title
	// const query = [ `insource:'imdb.com/title'`, /\[https?:\/\/www\.imdb\.com\/title\/tt[0-9]+\/?[ ?]/ ];
	const query = [ `insource:'imdb.com/title'`, /\[https?:\/\/www\.imdb\.com\/title\/tt[0-9]+\/?\]/ ];

	return batchBot.searchUrl(query, limit, offset);
}
const expectedSummary = 'imdb';
const batchBot = new WikiBatches(searchUrlTpl, expectedSummary);
// mock
// batchBot.mock = true;
// batchBot.mockSleep = 2_000;

(async () => {
	const batches = 3;
	const batchSize = 10;
	await batchBot.runBatches(batches, batchSize);
})().catch(err => {
	console.error(err);
	process.exit(1);
});
