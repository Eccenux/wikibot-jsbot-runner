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

(async () => {
	// connect to current (open) Chrome window
	const browser = await puppeteer.connect({
		browserWSEndpoint: wsUrl,
	});

	const page = await browser.newPage();
	const timeout = 5000;
	page.setDefaultTimeout(timeout);

	{
		const targetPage = page;
		await targetPage.setViewport({
			width: 1200,
			height: 900
		})
	}

	// search
	{
		const targetPage = page;
		await targetPage.goto('https://pl.wikipedia.org/w/index.php?sort=last_edit_asc&search=insource%3A%27imdb.com%2Fname%27+insource%3A%2F%5C%5Bhttps%3F%3A%5C%2F%5C%2Fwww%5C.imdb%5C.com%5C%2Fname%5C%2Fnm%5B0-9a-z%5D%2B%5C%2F+%2F&title=Specjalna:Szukaj&profile=advanced&fulltext=1&ns0=1&ns6=1&ns8=1&ns10=1&ns14=1&ns100=1');
	}

	// get item for edit
	{
		const targetPage = page;
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
		// TODO: open this in new tab instead (so we can close tabs in a loop)
		let url = await page.evaluate(() => {
			return document.querySelector('div.searchresults li:nth-of-type(1) a').href;
		});
		url += '?action=edit';
		await targetPage.goto(url);
	}

	// run WP:SK
	{
		const timeout = 2000;
		const targetPage = page;
		await waitForElement({
			type: 'waitForElement',
			timeout: 2000,
			selectors: [
				'#wp_sk_img_btn'
			]
		}, targetPage, timeout);
	} {
		const targetPage = page;
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
	}

	// check if summary was added
	{
		const timeout = 3000;
		const targetPage = page;
		await targetPage.waitForFunction("wpSummary.value.search('imdb') > 0", {
			timeout
		});
	}

	// save
	{
		const targetPage = page;
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

	// await browser.close();

})().catch(err => {
	console.error(err);
	process.exit(1);
});