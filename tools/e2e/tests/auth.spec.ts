import { test, expect } from '../fixtures';
import { LOGIN, open, settle, untranslatedKeys } from '../helpers';

const user = process.env.E2E_USER;
const pass = process.env.E2E_PASS;

test.describe('chua dang nhap', () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test('@ro @nologin trang dang nhap hien form, khong con khoa dich', async ({ page }) => {
		await page.goto('/auth/login');
		await settle(page);
		await expect(page.locator(LOGIN.user)).toBeVisible();
		await expect(page.locator(LOGIN.pass)).toBeVisible();
		await expect(page.locator(LOGIN.submit)).toBeEnabled();
		expect(await untranslatedKeys(page)).toEqual([]);
	});

	test('@ro @nologin mo trang can quyen thi bi chuyen ve dang nhap', async ({ page }) => {
		await page.goto('/ho-so-ncc');
		await page.waitForURL(/\/auth\/login/);
		expect(new URL(page.url()).searchParams.get('returnUrl')).toBe('/ho-so-ncc');
	});

	test('@ro dang nhap roi dang xuat', async ({ page }) => {
		test.skip(!user || !pass, 'chua co E2E_USER/E2E_PASS');
		await page.goto('/auth/login');
		await page.locator(LOGIN.user).fill(user!);
		await page.locator(LOGIN.pass).fill(pass!);
		await page.locator(LOGIN.submit).click();
		await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 30_000 });
		await settle(page);

		await page.locator('kt-user-profile [ngbdropdowntoggle]').click();
		await page.locator('kt-user-profile').getByText('Đăng xuất', { exact: true }).click();
		await page.waitForURL(/\/auth\/login/);
	});

	// Tam gac theo nguoi phu trach (2026-11-20): xem KNOWN_ISSUES.md muc SignalR.
	test.fixme('@ro het phien do khong thao tac (ng-idle) thi bi dua ve dang nhap', async ({ page }) => {
		test.skip(!user || !pass, 'chua co E2E_USER/E2E_PASS');
		// Dieu khien dong ho cua trang de khong phai cho that.
		await page.clock.install();
		await page.goto('/auth/login');
		await page.locator(LOGIN.user).fill(user!);
		await page.locator(LOGIN.pass).fill(pass!);
		await page.locator(LOGIN.submit).click();
		await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 30_000 });
		await settle(page);

		const timeLogout = Number(await page.evaluate(() => localStorage.getItem('TIME_LOGOUT')));
		test.skip(!timeLogout, 'he thong khong cau hinh TIME_LOGOUT, ng-idle khong bat');
		// setIdle(TIME_LOGOUT/1000 giay) + setTimeout(1 giay), them du phong.
		await page.clock.runFor(timeLogout + 5_000);
		await page.waitForURL(/\/auth\/login/, { timeout: 30_000 });
	});
});

test('@ro dashboard sau dang nhap khong con khoa dich', async ({ page }) => {
	await open(page, '/');
	expect(await untranslatedKeys(page)).toEqual([]);
});
