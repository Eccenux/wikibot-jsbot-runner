/* global document, console, process */
import puppeteer from 'puppeteer'; // v13.0.0 or later
import {
	scrollIntoViewIfNeeded,
	waitForSelectors,
	waitForElement,
} from './chromeBase.js'

import {
	wsUrl,
} from './chrome.config.js'

/**
 * Open new tab.
 * @returns {Page} targetPage.
 */
async function openTab(browser) {
	const page = await browser.newPage();
	const timeout = 5000;
	page.setDefaultTimeout(timeout);
	return page;
}

/**
 * Init view.
 * @param {Page} targetPage 
 */
async function initViewport(targetPage) {
	await targetPage.setViewport({
		width: 1200,
		height: 900
	})
}

/**
 * Search.
 */
async function openSearch(targetPage) {
	await targetPage.goto('https://pl.wikipedia.org/w/index.php?sort=last_edit_asc&search=insource%3A%27imdb.com%2Fname%27+insource%3A%2F%5C%5Bhttps%3F%3A%5C%2F%5C%2Fwww%5C.imdb%5C.com%5C%2Fname%5C%2Fnm%5B0-9a-z%5D%2B%5C%2F+%2F&title=Specjalna:Szukaj&profile=advanced&fulltext=1&ns0=1&ns6=1&ns8=1&ns10=1&ns14=1&ns100=1');
}

/**
 * Edit 1st item.
 */
async function openForEdit(targetPage, browser) {
	const timeout = 500;

	await scrollIntoViewIfNeeded([
		'div.searchresults li:nth-of-type(1) a'
	], targetPage, timeout);
	await waitForSelectors([
		'div.searchresults li:nth-of-type(1) a'
	], targetPage, {
		timeout,
		visible: true
	});
	// click that navigates breaks puppeteer :-/
	// await element.click({
	// 	offset: {
	// 		x: 19.03125,
	// 		y: 8.1875,
	// 	},
	// });
	// go directly to edit
	let url = await targetPage.evaluate(() => {
		const li = document.querySelector('div.searchresults li:nth-of-type(1)');
		const href = li.querySelector('a').href;
		li.remove(); // done => remove
		return href;
	});
	url += '?action=edit';
	// open new tab
	let page = await browser.newPage();
	await page.goto(url);

	return page;
}

/** Run WP:SK. */
async function runSk(targetPage) {
	const timeout = 2000;

	await waitForElement({
		type: 'waitForElement',
		timeout: 2000,
		selectors: [
			'#wp_sk_img_btn'
		]
	}, targetPage, timeout);

	await scrollIntoViewIfNeeded([
		'#wp_sk_img_btn'
	], targetPage, timeout);
	const element = await waitForSelectors([
		'#wp_sk_img_btn'
	], targetPage, {
		timeout,
		visible: true
	});
	await element.click({
		offset: {
			x: 10,
			y: 11.59375,
		},
	});

	// check if summary was added
	await targetPage.waitForFunction("wpSummary.value.search('imdb') > 0", {
		timeout: 3000
	});
}

/** Save. */
async function saveEdit(targetPage) {
	const timeout = 200;

	await scrollIntoViewIfNeeded([
		'#wpSave'
	], targetPage, timeout);
	const element = await waitForSelectors([
		'#wpSave'
	], targetPage, {
		timeout,
		visible: true
	});
	await element.click({
		offset: {
			x: 22,
			y: 9.21875,
		},
	});
}

(async () => {
	// connect to current (open) Chrome window
	const browser = await puppeteer.connect({
		browserWSEndpoint: wsUrl,
	});

	// new tab for search page
	const searchPage = await openTab(browser);
	await initViewport(searchPage);

	// search
	await openSearch(searchPage);

	// edit page
	let page = await openForEdit(searchPage, browser);
	await initViewport(page);
	await runSk(page);
	await saveEdit(page);

	// close tab
	await page.close();

})().catch(err => {
	console.error(err);
	process.exit(1);
});