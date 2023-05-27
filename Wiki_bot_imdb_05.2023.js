/* global document, console, process */
import puppeteer from 'puppeteer'; // v13.0.0 or later

import WikiBot from './wikiBot.js';

import {
	wsUrl,
} from './chrome.config.js'

/** Run single page. */
async function runBatch(browser, batchSize, batchIndex) {
	const offset = batchIndex * batchSize;
	console.log('runBatch: ', {batchIndex, batchSize, offset});
	const searchUrl = `https://pl.wikipedia.org/w/index.php?limit=${batchSize}&offset=${offset}&sort=last_edit_asc&search=insource%3A%27imdb.com%2Fname%27+insource%3A%2F%5C%5Bhttps%3F%3A%5C%2F%5C%2Fwww%5C.imdb%5C.com%5C%2Fname%5C%2Fnm%5B0-9a-z%5D%2B%5C%2F+%2F&title=Specjalna:Szukaj&profile=advanced&fulltext=1&ns0=1&ns6=1&ns8=1&ns10=1&ns14=1&ns100=1`;
	const expectedSummary = 'imdb';
	const bot = new WikiBot(searchUrl, expectedSummary);

	// new tab for search page
	const searchPage = await bot.openTab(browser);
	await bot.initViewport(searchPage);

	// search
	await bot.openSearch(searchPage);

	// edit page
	async function editPage() {
		let page = await bot.openForEdit(searchPage, browser);
		let title = await page.title();
		let url = await page.url();
		await bot.initViewport(page);

		// Catch edit errors and skip them (e.g. when summary is empty we don't really care).
		let ok = true;
		let failed = false;
		await (async () => {
			await bot.runSk(page);
			await bot.saveEdit(page);
		})().catch(err => {
			ok = false;
			failed = {title, url};
			console.warn(`edit failed, skipping (${title})\n${url}`);
			console.warn(err);
		});
		if (ok) {
			console.log('done:', title);
		}

		// close tab
		await page.close();

		return failed;
	}

	// loop-edit
	let max = batchSize; // whole page
	let failedPages = [];
	for (let index = 0; index < max; index++) {
		let failed = await editPage();
		if (failed) {
			failedPages.push(failed);
		}
	}

	return failedPages;
}

(async () => {
	// connect to current (open) Chrome window
	const browser = await puppeteer.connect({
		browserWSEndpoint: wsUrl,
	});
	
	const batches = 8;
	const batchSize = 10;
	let total = batchSize * batches;
	let failedTotal = [];
	console.log(`Edit ${total} in ${batches} batches.`);
	for (let batchIndex = batches - 1, batchNo = 1; batchIndex >= 0; batchIndex--, batchNo++) {
		let failedPages = await runBatch(browser, batchSize, batchIndex);
		failedTotal = failedTotal.concat(failedPages);
		// progress info
		let done = batchSize * batchNo;
		console.log(`done batch: ${batchSize-failedPages.length}/${batchSize}; done total: ${done-failedTotal.length}/${done}/${total};`);
	}
	
	// done
	if (failedTotal.length) {
		console.warn('failed:\n', failedTotal.map(v=>v.url).join('\n'));
	}
	console.log(`done (${total-failedTotal.length}/${total})`);
	process.exit(0);

})().catch(err => {
	console.error(err);
	process.exit(1);
});