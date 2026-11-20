import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { loginAndSave, routeApi, tokenSecondsLeft } from './helpers';
import { AUTH_FILE } from './playwright.config';

// Token cua backend chi song 10 phut, ca luot test lau hon: con it hon muc nay thi dang nhap lai.
// Lon hon thoi gian mot test ke ca lan chay lai (2 x 60 giay).
const TOKEN_MARGIN_SECONDS = 180;

// Loi console da biet va duoc chap nhan: moi muc la mot chuoi con hoac regex dang "/.../".
// Chi duoc thu hep danh sach nay; them muc moi phai duoc nguoi phu trach duyet.
const known: string[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'known-console-errors.json'), 'utf8'));
const isKnown = (msg: string) =>
	known.some((k) => (k.startsWith('/') && k.endsWith('/') ? new RegExp(k.slice(1, -1)).test(msg) : msg.includes(k)));

// E2E_OFFLINE=1: chay khi khong co backend (chi dung cho nhom @nologin), bo qua loi do khong goi duoc API.
const offline = process.env.E2E_OFFLINE === '1';
const OFFLINE_NOISE = /HttpErrorResponse|Failed to load resource|ERR_CONNECTION|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_PROXY/;

type Fixtures = {
	/** Loi bat duoc trong luc chay test; test tu fail neu con loi luc ket thuc. */
	runtimeErrors: string[];
};

export const test = base.extend<Fixtures>({
	// Chi lam moi phien da luu (khong dong vao test tu truyen storageState rieng, vi du nhom @nologin).
	// Moi luong chay song song giu phien rieng (.auth/user-<n>.json) de khong ghi de file cua nhau.
	storageState: async ({ storageState, browser, baseURL }, use, testInfo) => {
		const usesSavedLogin = typeof storageState === 'string' && path.resolve(storageState) === path.resolve(AUTH_FILE);
		if (!usesSavedLogin || !process.env.E2E_USER || !process.env.E2E_PASS) {
			await use(storageState);
			return;
		}
		const file = AUTH_FILE.replace(/\.json$/, `-${testInfo.parallelIndex}.json`);
		if (!fs.existsSync(file) && fs.existsSync(AUTH_FILE)) fs.copyFileSync(AUTH_FILE, file);
		if (tokenSecondsLeft(file) < TOKEN_MARGIN_SECONDS) {
			// Dang nhap + doi vai tro mat 15-20 giay: khong tinh vao thoi gian cua chinh test.
			const t = Date.now();
			await loginAndSave(browser, baseURL!, file);
			testInfo.setTimeout(testInfo.timeout + (Date.now() - t));
		}
		await use(file);
	},
	context: async ({ context }, use) => {
		await routeApi(context);
		await use(context);
	},
	runtimeErrors: [
		async ({ page, baseURL }, use) => {
			const errors: string[] = [];
			const appOrigin = new URL(baseURL!).origin;

			page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
			// Ban build prod rut gon ten class (HttpErrorResponse thanh "al", "nl$1"...),
			// nen khi offline phai xem chinh doi tuong loi chu khong chi chu in ra.
			const pending: Promise<void>[] = [];
			page.on('console', (msg) => {
				if (msg.type() !== 'error') return;
				const text = msg.text();
				if (isKnown(text) || (offline && OFFLINE_NOISE.test(text))) return;
				pending.push(
					(async () => {
						if (offline) {
							const names = await Promise.all(
								msg.args().map((a) => a.evaluate((v: any) => (v && typeof v === 'object' ? v.name : undefined)).catch(() => undefined)),
							);
							if (names.includes('HttpErrorResponse')) return;
						}
						errors.push(`console.error: ${text.slice(0, 300)}`);
					})(),
				);
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
			await Promise.all(pending);

			expect(errors, 'loi luc chay (JS, console, API >= 500, chunk)').toEqual([]);
		},
		{ auto: true },
	],
});

export { expect };
