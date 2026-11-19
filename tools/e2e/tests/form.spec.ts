import { test, expect } from '../fixtures';
import { closeDialog, collectWrites, dialog, open, settle } from '../helpers';

test('@ro form them moi bo trong o bat buoc: khong luu, dialog van mo', async ({ page }) => {
	await open(page, '/loai-giay-to');
	await page.getByRole('button', { name: 'Thêm mới' }).first().click();
	const d = dialog(page);
	await expect(d).toBeVisible();
	const writes = await collectWrites(page, async () => {
		await d.getByRole('button', { name: /Lưu và đóng/ }).click();
		await settle(page);
	});
	expect(writes, 'khong duoc gui request ghi khi form con loi').toEqual([]);
	await expect(d).toBeVisible();
	await expect(d.locator('[formcontrolname="LoaiGiayTo"]')).toHaveClass(/ng-invalid/);
	await closeDialog(page);
});

test('@ro datepicker mo va chon duoc ngay', async ({ page }) => {
	await open(page, '/ho-so-ncc');
	const toggle = page.locator('mat-datepicker-toggle button:visible').first();
	test.skip((await toggle.count()) === 0, 'khong thay datepicker dang hien tren trang');
	await toggle.click();
	const calendar = page.locator('mat-calendar');
	await expect(calendar).toBeVisible();
	await calendar.locator('.mat-calendar-body-cell:not(.mat-calendar-body-disabled)').first().click();
	await expect(calendar).toHaveCount(0);
});
