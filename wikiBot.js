import {
	scrollIntoViewIfNeeded,
	waitForSelectors,
	waitForElement,
} from './chromeBase.js'

export default class WikiBot {
	constructor(searchUrl, expectedSummary) {
		this.searchUrl = searchUrl;
		this.summary = expectedSummary;
	}

	/**
	 * Open new tab.
	 * @returns {Page} targetPage.
	 */
	async openTab(browser) {
		const page = await browser.newPage();
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
	}

	/**
	 * Edit 1st item.
	 */
	async openForEdit(targetPage, browser) {
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
		// go directly to edit
		let url = await targetPage.evaluate(() => {
			const li = document.querySelector('div.searchresults li:nth-of-type(1)');
			const href = li.querySelector('a').href;
			li.remove(); // done => remove
			return href;
		});
		url += '?action=edit&useskin=monobook&js_bot_ed=1';	// jsbot auto-submit param
		// open new tab
		let page = await browser.newPage();
		await page.goto(url);

		return page;
	}

	/** Run WP:SK. */
	async runSk(targetPage) {
		const timeout = 2000;

		await waitForElement({
			type: 'waitForElement',
			timeout: 2000,
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

		// check if summary was added
		await targetPage.waitForFunction(`wpSummary.value.search('${this.summary}') > 0`, {
			timeout: 3000
		});
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