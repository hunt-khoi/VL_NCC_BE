// Chup anh toan bo man hinh cua app.
//
//   node capture.mjs --discover [--target live]   doc menu sau khi dang nhap, ghi screens.json
//   node capture.mjs <nhan> [--target live] [--only <chuoi>]
//
// --target live: dung tai khoan VISUAL_LIVE_*, CHI DOC: chi dang nhap va mo tung trang,
// khong chay "steps", khong bam nut nao khac.

import { chromium } from 'playwright';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, '.env') });

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

const live = option('--target') === 'live';
const discover = flag('--discover');
const only = option('--only');
const missing = flag('--missing');
const label = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--target' && args[i - 1] !== '--only');

const baseUrl = (live ? process.env.VISUAL_LIVE_URL : process.env.VISUAL_BASE_URL || 'http://localhost:3105')?.replace(/\/+$/, '');
const user = live ? process.env.VISUAL_LIVE_USER : process.env.VISUAL_USER;
const pass = live ? process.env.VISUAL_LIVE_PASS : process.env.VISUAL_PASS;

if (!baseUrl || !user || !pass) {
	console.error(`Thieu cau hinh ${live ? 'VISUAL_LIVE_*' : 'VISUAL_*'} trong tools/visual/.env`);
	process.exit(2);
}
if (!discover && !label) {
	console.error('Thieu nhan. Vi du: node capture.mjs ng13');
	process.exit(2);
}

const screensFile = path.join(here, 'screens.json');
const VIEWPORT = { width: 1440, height: 900 };

// Tat chuyen dong de hai lan chup cung mot trang cho ra cung mot anh.
const FREEZE_CSS = `
*, *::before, *::after {
	animation-duration: 0s !important; animation-delay: 0s !important;
	transition-duration: 0s !important; transition-delay: 0s !important;
	caret-color: transparent !important; scroll-behavior: auto !important;
}`;

// Cac thanh phan bao hieu trang con dang tai.
const BUSY = 'div.kt-splash-screen, mat-progress-bar, mat-spinner, mat-progress-spinner, .kt-page-loader, .kt-spinner';

const slug = (p) => p.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'home';

async function settle(page) {
	await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
	await page.waitForFunction((sel) => {
		return [...document.querySelectorAll(sel)].every((el) => el.offsetParent === null);
	}, BUSY, { timeout: 10000 }).catch(() => {});
	await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
	await page.waitForTimeout(600);
}

async function login(page) {
	await page.goto(`${baseUrl}/auth/login`, { waitUntil: 'domcontentloaded' });
	await page.locator('input[formcontrolname="username"]').fill(user);
	await page.locator('input[formcontrolname="password"]').fill(pass);
	await page.locator('#kt_login_signin_submit').click();
	// Chi thu mot lan: dang nhap sai nhieu lan se bat reCAPTCHA hoac khoa tai khoan.
	await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 30000 });
	await settle(page);
}

// Menu cua app den tu API (khoa "page" trong ket qua), khong nam san trong DOM,
// nen thu duong dan tu moi phan hoi JSON trong luc dang nhap.
const menuPaths = new Set();
function watchMenu(page) {
	page.on('response', async (res) => {
		if (!(res.headers()['content-type'] || '').includes('json')) return;
		try {
			(function walk(node, key) {
				if (typeof node === 'string') {
					if (key === 'page' && node.startsWith('/') && !/\s/.test(node)) menuPaths.add(node.split('?')[0]);
				} else if (Array.isArray(node)) node.forEach((child) => walk(child, key));
				else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => walk(v, k));
			})(await res.json(), '');
		} catch { /* phan hoi khong phai JSON hop le */ }
	});
}

async function runDiscover(page) {
	await page.waitForTimeout(3000);
	const domPaths = await page.evaluate(() => {
		return [...document.querySelectorAll('a[href^="/"]')]
			.map((a) => a.getAttribute('href').split('?')[0].split('#')[0])
			.filter((href) => !href.startsWith('//') && !/\/\d+$/.test(href));
	});
	const paths = [...new Set([...menuPaths, ...domPaths])];
	const existing = fs.existsSync(screensFile) ? JSON.parse(fs.readFileSync(screensFile, 'utf8')) : [];
	const known = new Set(existing.filter((s) => !s.steps?.length).map((s) => s.path));
	let added = 0;
	for (const p of paths.sort()) {
		if (known.has(p)) continue;
		existing.push({ name: slug(p), path: p });
		added++;
	}
	existing.sort((x, y) => x.name.localeCompare(y.name));
	fs.writeFileSync(screensFile, JSON.stringify(existing, null, '\t') + '\n');
	console.log(`Tim thay ${paths.length} duong dan; them ${added} man hinh moi; screens.json co ${existing.length} muc.`);
}

async function runSteps(page, steps) {
	for (const step of steps) {
		if (step.click) await page.locator(step.click).first().click({ timeout: 10000 });
		if (step.fill) await page.locator(step.fill[0]).first().fill(step.fill[1], { timeout: 10000 });
		if (step.press) await page.keyboard.press(step.press);
		if (step.waitFor) await page.locator(step.waitFor).first().waitFor({ state: 'visible', timeout: 15000 });
		await settle(page);
	}
}

async function runCapture(page) {
	if (!fs.existsSync(screensFile)) {
		console.error('Chua co screens.json. Chay: node capture.mjs --discover');
		process.exit(2);
	}
	let screens = JSON.parse(fs.readFileSync(screensFile, 'utf8'));
	if (only) screens = screens.filter((s) => s.name.includes(only));
	if (missing) screens = screens.filter((s) => !fs.existsSync(path.join(here, 'shots', label, s.name + '.png')));
	if (live) screens = screens.filter((s) => !s.steps || s.steps.length === 0);

	const outDir = path.join(here, 'shots', label);
	fs.mkdirSync(outDir, { recursive: true });
	const failed = [];

	for (const [i, screen] of screens.entries()) {
		try {
			await page.goto(baseUrl + screen.path, { waitUntil: 'domcontentloaded', timeout: 45000 });
			await settle(page);
			if (new URL(page.url()).pathname.includes('/auth')) {
				console.log('  phien dang nhap bi mat, dang nhap lai');
				await login(page);
				await page.goto(baseUrl + screen.path, { waitUntil: 'domcontentloaded', timeout: 45000 });
				await settle(page);
				if (new URL(page.url()).pathname.includes('/auth')) throw new Error('bi day ve trang dang nhap');
			}
			if (screen.steps?.length) await runSteps(page, screen.steps);
			await page.addStyleTag({ content: FREEZE_CSS });
			const mask = (screen.mask || []).map((sel) => page.locator(sel));
			await page.screenshot({ path: path.join(outDir, screen.name + '.png'), fullPage: true, mask, animations: 'disabled' });
			console.log(`[${i + 1}/${screens.length}] ${screen.name}`);
		} catch (err) {
			failed.push(screen.name);
			console.log(`[${i + 1}/${screens.length}] ${screen.name}  LOI: ${String(err.message).split('\n')[0]}`);
		}
		// Dong dialog hoac menu con mo truoc khi sang man hinh ke tiep.
		if (!live) await page.keyboard.press('Escape').catch(() => {});
	}

	console.log(`\nDa chup ${screens.length - failed.length}/${screens.length} man hinh vao shots/${label}`);
	if (failed.length) {
		console.log('Chup hong: ' + failed.join(', '));
		process.exitCode = 1;
	}
}

const browser = await chromium.launch();
try {
	const context = await browser.newContext({ viewport: VIEWPORT, ignoreHTTPSErrors: true, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' });
	// Ban build co the tro toi mot dia chi API khac voi API dang chay tren may nay
	// (environment.ts ghi cong 44371). Chuyen huong o day de khong phai sua ma nguon.
	const apiFrom = process.env.VISUAL_API_FROM?.replace(/\/+$/, '');
	const apiTo = process.env.VISUAL_API_TO?.replace(/\/+$/, '');
	if (!live && apiFrom && apiTo) {
		await context.route(apiFrom + '/**', (route) => route.continue({ url: apiTo + route.request().url().slice(apiFrom.length) }));
	}
	const page = await context.newPage();
	if (discover) watchMenu(page);
	await login(page);
	if (discover) await runDiscover(page);
	else await runCapture(page);
} catch (err) {
	console.error('Dung: ' + String(err.message).split('\n')[0]);
	process.exitCode = 2;
} finally {
	await browser.close();
}
