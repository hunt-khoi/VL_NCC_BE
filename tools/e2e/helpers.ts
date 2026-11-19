import { expect, type BrowserContext, type Page, type Request } from '@playwright/test';

// Cung selector voi tools/visual/capture.mjs.
export const LOGIN = {
	user: 'input[formcontrolname="username"]',
	pass: 'input[formcontrolname="password"]',
	submit: '#kt_login_signin_submit',
};

// Cac thanh phan bao hieu trang con dang tai (giong tools/visual/capture.mjs).
const BUSY = 'kt-splash-screen, mat-progress-bar, mat-spinner, mat-progress-spinner, .kt-page-loader, .kt-spinner';

export async function settle(page: Page) {
	await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
	await page
		.waitForFunction((sel) => [...document.querySelectorAll(sel)].every((el) => (el as HTMLElement).offsetParent === null), BUSY, {
			timeout: 15_000,
		})
		.catch(() => {});
}

export async function open(page: Page, path: string) {
	await page.goto(path, { waitUntil: 'domcontentloaded' });
	await settle(page);
	expect(new URL(page.url()).pathname, `mo ${path} bi day ve trang dang nhap (het phien hoac thieu quyen)`).not.toContain('/auth');
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
