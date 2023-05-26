/* global document, console, process */
import puppeteer from 'puppeteer'; // v13.0.0 or later

import WikiBot from './wikiBot.js';

import {
	wsUrl,
} from './chrome.config.js'


(async () => {
	// connect to current (open) Chrome window
	const browser = await puppeteer.connect({
		browserWSEndpoint: wsUrl,
	});

	const searchUrl = 'https://pl.wikipedia.org/w/index.php?sort=last_edit_asc&search=insource%3A%27imdb.com%2Fname%27+insource%3A%2F%5C%5Bhttps%3F%3A%5C%2F%5C%2Fwww%5C.imdb%5C.com%5C%2Fname%5C%2Fnm%5B0-9a-z%5D%2B%5C%2F+%2F&title=Specjalna:Szukaj&profile=advanced&fulltext=1&ns0=1&ns6=1&ns8=1&ns10=1&ns14=1&ns100=1';
	const expectedSummary = 'imdb';
	const bot = new WikiBot(searchUrl, expectedSummary);

	// new tab for search page
	const searchPage = await bot.openTab(browser);
	await bot.initViewport(searchPage);

	// search
	await bot.openSearch(searchPage);

	// edit page
	let page = await bot.openForEdit(searchPage, browser);
	await bot.initViewport(page);
	await bot.runSk(page);
	await bot.saveEdit(page);

	// close tab
	await page.close();

})().catch(err => {
	console.error(err);
	process.exit(1);
});