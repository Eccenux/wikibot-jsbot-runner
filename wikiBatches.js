/* global document, console, process */
import puppeteer from 'puppeteer'; // v13.0.0 or later

import WikiBot from './wikiBot.js';

import {
	wsUrl,
} from './chrome.config.js'

export default class WikiBatches {
	constructor(searchUrlTpl, expectedSummary) {
		this.searchUrlTpl = searchUrlTpl;
		this.summary = expectedSummary;
	}

/** Run single page. */
async runBatch(browser, batchSize, batchIndex) {
	const offset = batchIndex * batchSize;
	console.log('runBatch: ', {batchIndex, batchSize, offset});
	const searchUrl = this.searchUrlTpl(batchSize, offset);
	const expectedSummary = this.summary;
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
			// console.warn(err);
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

/** Run all. */
async runBatches(batches, batchSize) {
	// connect to current (open) Chrome window
	const browser = await puppeteer.connect({
		browserWSEndpoint: wsUrl,
	});
	
	// const batches = 1;
	// const batchSize = 10;
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
}

}