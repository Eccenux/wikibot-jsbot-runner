/* global document, console, process */
import { Browser, Page } from 'puppeteer'; // v13.0.0 or later

/**
 * Edit page metadata.
 */
export default class EditPage {
	/**
	 * @param {Page} page Edit page (tab).
	 */
	constructor(page) {
		this.page = page;
		this.clearCache();
	}

	/** Clear metadata cache (e.g. after navigation). */
	clearCache() {
		this._title = false;
		this._url = false;
	}

	/**
	 * Read current/cached title.
	 * 
	 * Attemps to get MW data with fallback.
	 * 
	 * @returns {String} wgTitle xor h1 xor d.title.
	 */
	async title() {
		// from cache
		if (this._title) {
			return this._title;
		}
		// from page
		let title = await this.page.evaluate(() => {
			try {
				return mw.config.get('wgTitle');
			} catch (error) {
				try {
					return document.querySelector('h1').textContent;
				} catch (error) {}
			}
			return document.title;
		});
		// to cache
		this._title = title;
		return this._title;
	}
	/** Get current/cached url. */
	async url() {
		// from cache
		if (this._url) {
			return this._url;
		}
		// from page
		let url = await this.page.url();
		// to cache
		this._url = url;
		return this._url;
	}
}