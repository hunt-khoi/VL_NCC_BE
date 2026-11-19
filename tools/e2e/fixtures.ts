import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { routeApi } from './helpers';

// Loi console da biet va duoc chap nhan: moi muc la mot chuoi con hoac regex dang "/.../".
// Chi duoc thu hep danh sach nay; them muc moi phai duoc nguoi phu trach duyet.
const known: string[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'known-console-errors.json'), 'utf8'));
const isKnown = (msg: string) =>
	known.some((k) => (k.startsWith('/') && k.endsWith('/') ? new RegExp(k.slice(1, -1)).test(msg) : msg.includes(k)));

// E2E_OFFLINE=1: chay khi khong co backend (chi dung cho nhom @nologin), bo qua loi do khong goi duoc API.
const offline = process.env.E2E_OFFLINE === '1';
const OFFLINE_NOISE = /HttpErrorResponse|Failed to load resource|ERR_CONNECTION|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_PROXY|^(ERROR )?\w{1,4}\$\d+$/;

type Fixtures = {
	/** Loi bat duoc trong luc chay test; test tu fail neu con loi luc ket thuc. */
	runtimeErrors: string[];
};

export const test = base.extend<Fixtures>({
	context: async ({ context }, use) => {
		await routeApi(context);
		await use(context);
	},
	runtimeErrors: [
		async ({ page, baseURL }, use) => {
			const errors: string[] = [];
			const appOrigin = new URL(baseURL!).origin;

			page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
			page.on('console', (msg) => {
				if (msg.type() !== 'error') return;
				const text = msg.text();
				if (isKnown(text) || (offline && OFFLINE_NOISE.test(text))) return;
				errors.push(`console.error: ${text.slice(0, 300)}`);
			});
			page.on('response', (res) => {
				const type = res.request().resourceType();
				if ((type === 'xhr' || type === 'fetch') && res.status() >= 500) errors.push(`API ${res.status()}: ${res.request().method()} ${res.url()}`);
			});
			page.on('requestfailed', (req) => {
				const url = req.url();
				// Chunk JS/CSS cua chinh app tai hong: lazy-load module se khong mo duoc.
				if (url.startsWith(appOrigin) && /\.(js|css)(\?|$)/.test(url)) errors.push(`tai file hong: ${url} (${req.failure()?.errorText})`);
			});

			await use(errors);

			expect(errors, 'loi luc chay (JS, console, API >= 500, chunk)').toEqual([]);
		},
		{ auto: true },
	],
});

export { expect };
