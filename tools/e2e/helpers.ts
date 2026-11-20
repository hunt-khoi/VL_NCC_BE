import { expect, test, type Browser, type BrowserContext, type Page, type Request } from '@playwright/test';
import fs from 'node:fs';

// Selector cac thanh phan cua theme Metronic.
export const LOGIN = {
	user: 'input[formcontrolname="username"]',
	pass: 'input[formcontrolname="password"]',
	submit: '#kt_login_signin_submit',
};

// Cac thanh phan bao hieu trang con dang tai.
const BUSY = 'div.kt-splash-screen, mat-progress-bar, mat-spinner, mat-progress-spinner, .kt-page-loader, .kt-spinner';

export async function settle(page: Page) {
	await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
	await page
		.waitForFunction((sel) => [...document.querySelectorAll(sel)].every((el) => (el as HTMLElement).offsetParent === null), BUSY, {
			timeout: 15_000,
		})
		.catch(() => {});
}

export async function open(page: Page, path: string) {
	// Guard PermissionUrl goi API roi moi chuyen sang /error/403: neu co request kiem tra quyen thi cho no xong
	// roi moi xet URL (trang khong co guard thi khong phai cho).
	const pending: Promise<unknown>[] = [];
	const onRequest = (req: Request) => {
		if (/\/user\/PermissionUrl/i.test(req.url())) pending.push(req.response().catch(() => null));
	};
	page.on('request', onRequest);
	try {
		await page.goto(path, { waitUntil: 'domcontentloaded' });
		await settle(page);
		if (pending.length) {
			await Promise.all(pending);
			await page.waitForTimeout(300); // router chuyen trang sau khi guard tra ve
			await settle(page);
		}
	} finally {
		page.off('request', onRequest);
	}
	const pathname = new URL(page.url()).pathname;
	expect(pathname, `${path}: frontend khong co route nay (trang 404)`).not.toBe('/error/404');
	expect(pathname, `mo ${path} bi day ve trang dang nhap (het phien)`).not.toContain('/auth');
	// Moi vai tro chi thay mot phan menu: chay lai voi E2E_VAITRO khac de phu man nay.
	test.skip(pathname.startsWith('/error/403'), `vai tro hien tai (E2E_VAITRO=${process.env.E2E_VAITRO || 'mac dinh'}) khong co quyen vao ${path}`);
}

/**
 * Dang nhap bang E2E_USER/E2E_PASS roi luu phien (localStorage) vao authFile.
 * Chi thu mot lan: dang nhap sai nhieu lan se bat reCAPTCHA hoac khoa tai khoan.
 */
export async function loginAndSave(browser: Browser, baseURL: string, authFile: string) {
	const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'vi-VN' });
	try {
		await routeApi(context);
		const page = await context.newPage();
		await page.goto(`${baseURL}/auth/login`, { waitUntil: 'domcontentloaded' });
		await page.locator(LOGIN.user).fill(process.env.E2E_USER!);
		await page.locator(LOGIN.pass).fill(process.env.E2E_PASS!);
		await page.locator(LOGIN.submit).click();
		await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 30_000 }).catch(() => {
			throw new Error('Dang nhap khong thanh cong voi E2E_USER/E2E_PASS (kiem tra tai khoan va backend).');
		});
		// App tai lai trang ngay sau khi dang nhap; cho on dinh roi moi luu phien.
		await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
		const vaiTro = process.env.E2E_VAITRO?.trim();
		if (vaiTro) await switchVaiTro(page, vaiTro);
		await context.storageState({ path: authFile });
	} finally {
		await context.close();
	}
}

/**
 * Doi vai tro nhu nguoi dung: topbar > "Doi vai tro" > bam dong co ten vai tro (GroupName).
 * App goi user/doi-vai-tro, luu token moi roi tai lai trang. Vai tro dang dung thi chi dong dialog.
 */
export async function switchVaiTro(page: Page, groupName: string) {
	await page.locator('kt-user-profile [ngbdropdowntoggle]').click();
	await page.getByText(/^\s*Đổi vai trò\s*$/).click();
	const row = dialog(page).locator('tr[mat-row]').filter({ hasText: groupName }).first();
	await expect(row, `khong co vai tro "${groupName}" (E2E_VAITRO) trong danh sach doi vai tro`).toBeVisible({ timeout: 15_000 });
	if (await row.evaluate((r) => r.classList.contains('row-in-use'))) {
		await page.keyboard.press('Escape');
		return;
	}
	await Promise.all([page.waitForEvent('load', { timeout: 30_000 }), row.click()]);
	await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
}

/** So giay con lai cua token trong phien da luu; -1 neu khong doc duoc. */
export function tokenSecondsLeft(authFile: string): number {
	try {
		const state = JSON.parse(fs.readFileSync(authFile, 'utf8'));
		for (const o of state.origins ?? []) {
			for (const { name, value } of o.localStorage ?? []) {
				if (!name.startsWith('auth') || value.split('.').length !== 3) continue;
				const { exp } = JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString('utf8'));
				if (exp) return exp - Date.now() / 1000;
			}
		}
	} catch {}
	return -1;
}

/** Ban build co the goi API o dia chi khac voi backend dang chay; chuyen huong ma khong sua ma nguon. */
export async function routeApi(context: BrowserContext) {
	const from = process.env.E2E_API_FROM?.replace(/\/+$/, '');
	const to = process.env.E2E_API_TO?.replace(/\/+$/, '');
	if (!from || !to) return;
	await context.route(from + '/**', (route) => route.continue({ url: to + route.request().url().slice(from.length) }));
}

/**
 * API cua app dung POST ca cho viec doc danh sach, nen khong the coi moi POST la ghi.
 * Request ghi duoc nhan dien theo method PUT/DELETE hoac ten endpoint.
 */
const WRITE_URL = /(insert|update|delete|create|add|save|remove|import|duyet|gui)/i;
export function isWriteRequest(req: Request) {
	if (req.resourceType() !== 'xhr' && req.resourceType() !== 'fetch') return false;
	const method = req.method();
	if (method === 'PUT' || method === 'DELETE' || method === 'PATCH') return true;
	if (method !== 'POST') return false;
	const pathname = new URL(req.url()).pathname;
	return WRITE_URL.test(pathname.split('/').pop() || '');
}

/** Ghi lai moi request ghi phat sinh trong luc chay ham fn. */
export async function collectWrites(page: Page, fn: () => Promise<void>) {
	const writes: string[] = [];
	const onRequest = (req: Request) => {
		if (isWriteRequest(req)) writes.push(`${req.method()} ${req.url()}`);
	};
	page.on('request', onRequest);
	try {
		await fn();
		await page.waitForTimeout(500);
	} finally {
		page.off('request', onRequest);
	}
	return writes;
}

export const dialog = (page: Page) => page.locator('mat-dialog-container').last();

/** Dong dialog dang mo bang nut dong (mat-mini-fab .btn-close) hoac nut "Dong", roi cho dialog bien mat. */
export async function closeDialog(page: Page) {
	const d = dialog(page);
	const closeBtn = d.locator('button.btn-close').or(d.getByRole('button', { name: /^\s*(Đóng|Trở lại)\s*$/ })).first();
	if (await closeBtn.count()) await closeBtn.click();
	else await page.keyboard.press('Escape');
	await expect(page.locator('mat-dialog-container')).toHaveCount(0);
}

/** Text cua cac dong du lieu trong bang mat-table dau tien. */
export async function rowTexts(page: Page) {
	return page.locator('table[mat-table] tr[mat-row]').allInnerTexts();
}

/** Khoa dich chua dich, vi du "COMMON.CREATE", con nam tren trang. */
export async function untranslatedKeys(page: Page) {
	const text = await page.locator('body').innerText();
	return [...new Set(text.match(/\b[A-Z][A-Z0-9_]{2,}\.[A-Z][A-Z0-9_.]{2,}\b/g) || [])];
}
