// eslint-disable-next-line no-unused-vars
import puppeteer, { Browser, Page } from 'puppeteer'; // v13.0.0 or later

import WikiBot from './wikiBot.js';
import PageCache from './PageCache.js';
import EditPage from './EditPage.js';

import {
	// wsUrl,
	wsBrowserPort,
} from './chrome.config.js'

function sleep(sleepMs) {
	return new Promise((resolve)=>{setTimeout(()=>resolve(), sleepMs)});
}

export default class WikiBatches {
	constructor(searchUrlTpl, expectedSummary) {
		this.searchUrlTpl = searchUrlTpl;
		this.summary = expectedSummary;
		this.cache = new PageCache();
		/** Disable save. */
		this.mock = false;
		/** Wait before close [ms] (or you can set a breakpoint to check stuff). */
		this.mockSleep = 0;
		/** 
		 * Namespaces to search.
		 * https://en.wikipedia.org/wiki/Wikipedia:Namespace
		 * default: 0=main, 14=cat, 100=portal
		 */
		this.ns = [0, 14, 100];

		/** Browser connection. */
		this._browser = false;
	}

	/**
	 * Prepare search URL.
	 * @param {Array} queryList List of strings or regexp
	 * 	(string is used as-is).
	 * 	(regexp will be transformed into `insource:` regexp string).
	 * @param {Number} limit Limit as used in the `searchUrlTpl`.
	 * @param {Number} offset Offset as used in the `searchUrlTpl`.
	 * @returns Full search URL string.
	 */
	searchUrl(queryList, limit, offset) {
		const baseUrl = `https://pl.wikipedia.org/w/index.php`;

		// common params
		let params = `
			&sort=last_edit_asc
			&title=Specjalna:Szukaj
			&profile=advanced
			&fulltext=1
			&useskin=monobook
		`.replace(/\s+/g, '');
		// append NS
		this.ns.forEach(no => {
			params += `&ns${no}=1`;
		});

		// current page of search results
		const page = `&limit=${limit}&offset=${offset}`;

		// strings/re to main search parameter
		let query = queryList.map(q=>{
			if (typeof q === 'string') {
				return q;
			}
			if (q instanceof RegExp) {
				return 'insource:' + q.toString();
			}
		}).join(' ');
		return baseUrl + '?search=' + encodeURIComponent(query) + params + page;
	}
	
	/**
	 * Run SK on opened edit page.
	 * @param {EditPage} editPage 
	 * @param {WikiBot} bot 
	 * @returns 
	 */
	async runSk(editPage, bot) {
		let url = await editPage.url();
		let title = await editPage.title();
		const page = editPage.page;

		// Catch edit errors and skip them (e.g. when summary is empty we don't really care).
		let ok = true;
		let failed = false;
		await (async () => {
			let summaryFound = await bot.runSk(page);
			if (!summaryFound) {
				ok = false;
				failed = {title, url, error:false};
				console.info(`empty edit, skipping (${title})\n${url}`);
			}
			if (!this.mock) {
				if (summaryFound) {
					await bot.saveEdit(page);
				}
			} else {
				await sleep(this.mockSleep);
			}
		// eslint-disable-next-line no-unused-vars
		})().catch(err => {
			ok = false;
			failed = {title, url, error:true};
			console.warn(`edit failed, skipping (${title})\n${url}`);
			// console.warn(err);
		});
		if (ok) {
			console.log('done:', title);
		}

		// unable to close
		// free memory? https://github.com/puppeteer/puppeteer/issues/1490
		// await page.goto('about:blank');	

		return failed;
	}

	/**
	 * Run edit operations on a 1st search item.
	 * 
	 * @deprecated This is opening and closing tabs; better to reuse instead.
	 * @param {Page} searchPage 
	 * @param {Browser} browser 
	 * @param {WikiBot} bot 
	 * @returns 
	 */
	async editPage(searchPage, browser, bot) {
		let page = await bot.openForEdit(searchPage, browser);
		if (!page) {
			console.info(`nothing to edit? ignore`);
			return false;
		}

		const editPage = new EditPage(page);

		const failed = await this.runSk(editPage, bot);

		// close tab
		await page.close();

		return failed;
	}

	/**
	 * Read all urls on a page.
	 * @param {Page} searchPage 
	 * @param {WikiBot} bot 
	 * @returns {Array}
	 */
	async readEditUrls(searchPage, bot, max) {
		let urls = [];
		for (let index = 0; index < max; index++) {
			let url = await bot.readEditUrl(searchPage);
			if (!url) {
				console.info(`nothing to edit? ignore`);
				break;
			}
			urls.push(url);
		}
		return urls;
	}

	/** Run single page. */
	async runBatch(browser, batchSize, batchIndex) {
		const offset = batchIndex * batchSize;
		console.log('runBatch: ', {batchIndex, batchSize, offset});
		const searchUrl = this.searchUrlTpl(batchSize, offset);
		const expectedSummary = this.summary;
		const bot = new WikiBot(searchUrl, expectedSummary, this.cache);

		// new tab for search page
		const searchPage = await bot.openTab(browser);

		// search
		let itemCount = await bot.openSearch(searchPage);

		// loop-edit
		let max = itemCount; // whole page
		let urls = await this.readEditUrls(searchPage, bot, max);
		let failedPages = [];
		const page = await bot.openTab(browser);
		await this.runEdits(urls, page, failedPages, bot);
		await page.close();

		// close all but one
		if (batchIndex) {
			searchPage.close();
		}

		return failedPages;
	}

	/**
	 * Run edits in single tab.
	 * 
	 * @param {Array} urls Edit urls.
	 * @param {Page} page Opened tab.
	 * @param {Array} failedPages Summary of pages.
	 * @param {WikiBot} bot .
	 * @private
	 */
	async runEdits(urls, page, failedPages, bot) {
		for (let index = 0; index < urls.length; index++) {
			let url = urls[index];
			await page.goto(url);
			const editPage = new EditPage(page);
			const failed = await this.runSk(editPage, bot);
			if (failed) {
				failedPages.push(failed);
			}
		}
	}

	/** @private Open many. */
	async openTabs(urls, browser, bot) {
		let tabCount = 5;
		if (tabCount > urls.length) {
			tabCount = urls.length;
		}
		const tabs = [];
		for (let index = 0; index < tabCount; index++) {
			const page = await bot.openTab(browser);
			tabs.push(page);
		}
		return tabs;
	}
	/** @private Close many. */
	async closeTabs(tabs) {
		for (let index = 0; index < tabs.length; index++) {
			const page = tabs[index];
			await page.close();
		}
		return tabs;
	}
	/**
	 * Run edit in many tabs.
	 * 
	 * Don't seem to be working as well as it might seem it should.
	 * Chrome doesn't seem to like to work in paralel.
	 * 
	 * @param {Array} urls Edit urls.
	 * @param {Array} tabs Opened tabs.
	 * @param {Array} failedPages Summary of pages.
	 * @param {WikiBot} bot .
	 * @private
	 */
	async runEditInTabs(urls, tabs, failedPages, bot) {
		// edit loop
		for (let index = 0; index < urls.length;) {
			// open urls
			for (let t = 0; t < tabs.length && index < urls.length; t++) {
				const page = tabs[t];
				let url = urls[index];
				await page.goto(url);
				index++;
			}
			// run edit
			for (let t = 0; t < tabs.length; t++) {
				const page = tabs[t];
				const editPage = new EditPage(page);
				const failed = await this.runSk(editPage, bot);
				if (failed) {
					failedPages.push(failed);
				}
			}
		}
	}

	/** Init browser connection. */
	async init() {
		if (this._browser) {
			return this._browser;
		}

		// connect to current (open) Chrome window
		const browserURL = `http://127.0.0.1:${wsBrowserPort}`;
		const browser = await puppeteer.connect({
			// browserWSEndpoint: wsUrl,
			browserURL,
		});

		return browser;
	}
	/** Run all. */
	async runBatches(batches, batchSize) {
		const searchUrlExample = this.searchUrlTpl(batchSize, 0);
		console.log("Search url (start page): %s\n\n", searchUrlExample);
		await sleep(2000);
		
		// connect to current (open) Chrome window
		const browser = await this.init();
		
		// const batches = 1;
		// const batchSize = 10;
		let total = batchSize * batches;
		let failedTotal = [];
		console.log(`Edit ${total} in ${batches} batches.`);
		for (let batchIndex = batches - 1, batchNo = 1; batchIndex >= 0; batchIndex--, batchNo++) {
			let batchSuccess = 0;
			try {
				let failedPages = await this.runBatch(browser, batchSize, batchIndex);
				failedTotal = failedTotal.concat(failedPages);
				batchSuccess = batchSize - failedPages.length;
			} catch (err) {
				// symbolic fail-page
				let failedBatch = {
					title: `BATCH-${batchNo}`,
					url: `http://localhost/?batch=${batchNo}&error=${encodeURIComponent(err.name)}`,
					error: true,
				};
				failedTotal.push(failedBatch);
				console.warn(`failed batch no ${batchNo}`);
				console.warn(err.name, err.message);
			}

			// progress info
			let done = batchSize * batchNo;
			let failRate = 100 - Math.round(100 * (done-failedTotal.length) / done);
			this.cache.info();
			console.log(`done batch: ${batchSuccess}/${batchSize}; total fail rate: ${failRate}%; total progress: ${done}/${total};`);
		}
		
		// done
		if (failedTotal.length) {
			var failInfo = failedTotal.filter(v=>!v.error);
			var failError  = failedTotal.filter(v=>v.error);
			if (failInfo.length) {
				console.log(`[failures] failed with info [${failInfo.length}]:` , '\n' + failInfo.map(v=>v.url).join('\n'));
			}
			if (failError.length) {
				console.warn(`[failures] failed with error [${failError.length}]:`, '\n' + failError.map(v=>v.url).join('\n'));
			}
			console.log(`[failures] stats: info: ${failInfo.length}; error: ${failError.length}`);
		}
		this.cache.info();
		console.log(`done (${total-failedTotal.length}/${total})`);
		process.exit(0);
	}

	/** check single search page. */
	async checkBatch(searchUrlTpl, keep) {
		// connect to current (open) Chrome window
		const browser = await this.init();

		const offset = 0;
		const batchSize = 2;
		const searchUrl = searchUrlTpl(batchSize, offset);
		// console.log('checkBatch:', {searchUrl});
		const expectedSummary = '';
		const bot = new WikiBot(searchUrl, expectedSummary, this.cache);

		// new tab for search page
		const searchPage = await bot.openTab(browser);

		// search
		await bot.openSearch(searchPage);

		// check data
		let totalCount = await searchPage.evaluate(() => {
			const result = document.querySelector('.results-info');
			const total = result?.dataset?.mwNumResultsTotal;
			console.log({result, total});
			return (typeof total === 'string') ? parseInt(total, 10) : 0;
		});

		// cleanup
		if (!keep) {
			searchPage.close();
		}

		return {totalCount, searchUrl};
	}
}