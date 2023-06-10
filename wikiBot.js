import {
	scrollIntoViewIfNeeded,
	waitForSelectors,
	waitForElement,
} from './chromeBase.js'

import PageCache from './PageCache.js';

export default class WikiBot {
	constructor(searchUrl, expectedSummary, globalCache) {
		this.searchUrl = searchUrl;
		this.summary = expectedSummary;
		this.cache = globalCache ? globalCache : new PageCache();
	}

	/**
	 * Open new tab.
	 * @returns {Page} targetPage.
	 */
	async openTab(browser) {
		const page = await browser.newPage();
		await this.initViewport(page);
		await this.cache.enable(page);
		const timeout = 5000;
		page.setDefaultTimeout(timeout);
		return page;
	}

	/**
	 * Init view.
	 * @param {Page} targetPage 
	 */
	async initViewport(targetPage) {
		await targetPage.setViewport({
			width: 1200,
			height: 900
		})
	}

	/**
	 * Search.
	 */
	async openSearch(targetPage) {
		await targetPage.goto(this.searchUrl);

		// div.searchresults should also be on empty search page
		await waitForSelectors([
			'div.searchresults'
		], targetPage, {
			timeout: 15000,
			visible: true
		});

		// check number of items
		let itemCount = await targetPage.evaluate(() => {
			const li = document.querySelectorAll('div.searchresults li');
			return li.length;
		});

		return itemCount;
	}

	/**
	 * Read 1st url and remove it.
	 * 
	 * Multiple calls will give different results.
	 * 
	 * @param {Page} searchPage Search page.
	 * @returns false when search results are empty (or there was a problem reading a link).
	 */
	async readEditUrl(searchPage) {
		// go directly to edit
		let url = await searchPage.evaluate(() => {
			const li = document.querySelector('div.searchresults li:nth-of-type(1)');
			if (!li) {
				return false;
			}
			const href = li.querySelector('.mw-search-result-heading a').href;
			li.remove(); // done => remove
			return href;
		});
		if (!url) {
			return false;
		}
		// NuxJsBot params
		const botParam = 'js_bot_ed=1';
		const skipDiffParam = 'js_bot_nd=1';
		url += '?action=edit&useskin=monobook';	
		url += '&' + botParam;
		url += '&' + skipDiffParam;
		return url;
	}

	/**
	 * Edit 1st item.
	 */
	async openForEdit(searchPage, browser) {
		let url = await this.readEditUrl(searchPage);
		if (!url) {
			return false;
		}
		// open new tab
		const page = await this.openTab(browser);
		await page.goto(url);
		return page;
	}

	/** Run WP:SK. */
	async runSk(targetPage) {
		const timeout = 2000;

		await waitForElement({
			type: 'waitForElement',
			timeout: 4000,
			selectors: [
				'#wp_sk_img_btn'
			]
		}, targetPage, timeout);

		// await scrollIntoViewIfNeeded([
		// 	'#wp_sk_img_btn'
		// ], targetPage, timeout);
		// const element = await waitForSelectors([
		// 	'#wp_sk_img_btn'
		// ], targetPage, {
		// 	timeout,
		// 	visible: true
		// });
		// await element.click({
		// 	offset: {
		// 		x: 10,
		// 		y: 11.59375,
		// 	},
		// });

		await waitForElement({
			type: 'waitForElement',
			timeout: 4000,
			selectors: [
				'#jsbot-sk-done'
			]
		}, targetPage, timeout);

		// check if summary was added
		let summaryFound = await targetPage.evaluate((expectedSummary) => {
			let wpSummary = document.querySelector('#wpSummary');
			return wpSummary.value.search(expectedSummary) > 0;
		}, this.summary);	// pass to evaluate

		// disable leave-page warning
		await targetPage.evaluate(() => {
			$(window).off('beforeunload');
		});

		return summaryFound;
	}

	/** Save. */
	async saveEdit(targetPage) {
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
		let nav = targetPage.waitForNavigation(); // init wait
		await element.click({
			offset: {
				x: 22,
				y: 9.21875,
			},
		});
		await nav; // wait for form submit
	}
}