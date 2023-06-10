import WikiBatches from './wikiBatches.js';

var subCategories = [
	"Odznaczeni medalem „Za udział w wojnie obronnej 1939”", // 109
	"Odznaczeni Krzyżem Kampanii Wrześniowej 1939 r.", // 71
	"Obrońcy Polski przed agresją ZSRR (1939)", // 20
	"Polegli w kampanii wrześniowej (strona polska)", // 9
	"Polscy lotnicy w kampanii wrześniowej", // 3
	"Kapelani Wojska Polskiego w kampanii wrześniowej", // 2
	"Naczelne Dowództwo Wojska Polskiego (1939)", // 2
	"Ochotnicy w kampanii wrześniowej", // 1
	"Oficerowie kontraktowi Wojska Polskiego w kampanii wrześniowej", // 1
	"Żołnierze Legionu Czesko-Słowackiego", // 1

	// "Członkowie cywilnych struktur obrony w kampanii wrześniowej", // 0
	// "Harcerze – uczestnicy kampanii wrześniowej", // 0
	// "Jeńcy polscy w kampanii wrześniowej", // 0
	// "Kobiety w kampanii wrześniowej", // 0
	// "Marynarze Flotylli Rzecznej Marynarki Wojennej w kampanii wrześniowej", // 0
	// "Polski personel medyczno-sanitarny w kampanii wrześniowej", // 0
	// "Uczestnicy starć kampanii wrześniowej (strona polska)", // 0
	// "Żołnierze KOP w kampanii wrześniowej", // 0
	// "Żołnierze Marynarki Wojennej w kampanii wrześniowej", // 0
	// "Żołnierze Obrony Narodowej w kampanii wrześniowej", // 0
];

const searchUrlFactory = function(category) {
	return function (limit, offset) {
		const query = [
			`incategory:"Uczestnicy kampanii wrześniowej (strona polska)"`
			, `incategory:"${category}"`
		];
		
	
		return batchBot.searchUrl(query, limit, offset);
	}
}
const expectedSummary = 'imdb';
const batchBot = new WikiBatches(searchUrlFactory(subCategories[0]), expectedSummary);
// mock
batchBot.mock = true;
// batchBot.mockSleep = 2_000;

(async () => {
	for (let i = 0; i < subCategories.length; i++) {
		const cat = subCategories[i];
		let {totalCount:count} = await batchBot.checkBatch(searchUrlFactory(cat));
		console.log({cat, count});
	}
	process.exit(0);

})().catch(err => {
	console.error(err);
	process.exit(1);
});