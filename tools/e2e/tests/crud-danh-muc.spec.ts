import { test, expect } from '../fixtures';
import { dialog, open, settle } from '../helpers';

// Nhom @rw ghi du lieu: chi chay tren database ban sao (global-setup kiem tra E2E_ALLOW_WRITE va E2E_RESTORE_CMD).
test.skip(process.env.E2E_ALLOW_WRITE !== '1', 'nhom @rw can E2E_ALLOW_WRITE=1');

const name = `E2E-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const snackbar = (page: import('@playwright/test').Page) => page.locator('mat-snack-bar-container, .mat-mdc-snack-bar-container').last();

test('@rw them moi mot loai giay to', async ({ page }) => {
	await open(page, '/loai-giay-to');
	await page.getByRole('button', { name: 'Thêm mới' }).first().click();
	const d = dialog(page);
	await d.locator('[formcontrolname="LoaiGiayTo"]').fill(name);
	await d.locator('[formcontrolname="Priority"]').fill('999');
	const saved = page.waitForResponse((r) => r.request().method() !== 'GET' && /insert|create|add|save/i.test(r.url()));
	await d.getByRole('button', { name: /Lưu và đóng/ }).click();
	expect((await saved).ok()).toBe(true);
	await expect(snackbar(page)).toBeVisible();
	await expect(page.locator('mat-dialog-container')).toHaveCount(0);
	await settle(page);
});

// Sua va xoa can biet cach tim lai dong vua them (o loc hoac sap xep theo thu tu);
// viet sau khi chay nhom @rw lan dau voi backend that. Xem KNOWN_ISSUES.md.
test.fixme('@rw sua loai giay to vua them', async () => {});
test.fixme('@rw xoa loai giay to vua them (co hop xac nhan)', async () => {});
