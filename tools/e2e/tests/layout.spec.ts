import { test, expect } from '../fixtures';
import { open } from '../helpers';

test.beforeEach(async ({ page }) => {
	await open(page, '/');
});

test('@ro menu trai thu gon va mo lai', async ({ page }) => {
	const body = page.locator('body');
	const toggler = page.locator('#kt_aside_toggler');
	const minimized = () => body.evaluate((b) => b.classList.contains('kt-aside--minimize'));
	const before = await minimized();
	await toggler.click();
	await expect.poll(minimized).toBe(!before);
	await toggler.click();
	await expect.poll(minimized).toBe(before);
});

test('@ro menu trai chuyen trang', async ({ page }) => {
	const link = page.locator('kt-aside-left a.kt-menu__link[href^="/"]:visible, .kt-aside a.kt-menu__link[href^="/"]:visible').first();
	test.skip((await link.count()) === 0, 'menu trai khong co link nao dang hien');
	const href = (await link.getAttribute('href'))!;
	await link.click();
	await page.waitForURL((url) => url.pathname === href.split('?')[0]);
});

test('@ro dropdown nguoi dung tren topbar mo va dong', async ({ page }) => {
	const menu = page.locator('kt-user-profile [ngbdropdownmenu]');
	await page.locator('kt-user-profile [ngbdropdowntoggle]').click();
	await expect(menu).toHaveClass(/show/);
	await expect(menu.getByText('Đăng xuất', { exact: true })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(menu).not.toHaveClass(/show/);
});

test('@ro bang thong bao tren topbar mo duoc', async ({ page }) => {
	const menu = page.locator('kt-notification [ngbdropdownmenu]');
	await page.locator('kt-notification [ngbdropdowntoggle]').click();
	await expect(menu).toHaveClass(/show/);
	await expect(menu.locator('ngb-tabset, .tab-content').first()).toBeVisible();
	await menu.locator('a.nav-link').first().click();
	await expect(menu.locator('.tab-pane.active')).toHaveCount(1);
});
