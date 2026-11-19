import { test, expect } from '../fixtures';
import { closeDialog, collectWrites, dialog, open, rowTexts, settle } from '../helpers';

// Ba danh sach dai dien: hai danh muc co nut "Them moi" va danh sach ho so NCC.
const LISTS = ['/loai-giay-to', '/qh-gia-dinh', '/ho-so-ncc'];

for (const path of LISTS) {
	test.describe(path, () => {
		test.beforeEach(async ({ page }) => {
			await open(page, path);
			await expect(page.locator('table[mat-table]').first()).toBeVisible();
		});

		test(`@ro ${path} chuyen trang thi dong dau doi`, async ({ page }) => {
			const next = page.locator('mat-paginator .mat-mdc-paginator-navigation-next').first();
			test.skip(!(await next.isEnabled()), 'chi co mot trang du lieu');
			const before = await rowTexts(page);
			await next.click();
			await settle(page);
			await expect.poll(() => rowTexts(page)).not.toEqual(before);
		});

		test(`@ro ${path} bam tieu de cot thi sap xep lai`, async ({ page }) => {
			const header = page.locator('th[mat-sort-header]').first();
			test.skip((await header.count()) === 0, 'bang khong co cot sap xep');
			const rows = await rowTexts(page);
			test.skip(rows.length < 2, 'it hon 2 dong');
			const reloaded = page.waitForResponse((r) => ['xhr', 'fetch'].includes(r.request().resourceType()), { timeout: 10_000 });
			await header.click();
			await reloaded;
			await settle(page);
			await expect(header).toHaveAttribute('aria-sort', /ascending|descending/);
		});

		test(`@ro ${path} mo dialog them moi roi dong, khong ghi du lieu`, async ({ page }) => {
			const add = page.getByRole('button', { name: 'Thêm mới' }).first();
			test.skip((await add.count()) === 0, 'trang khong co nut Them moi');
			const writes = await collectWrites(page, async () => {
				await add.click();
				await expect(dialog(page)).toBeVisible();
				await closeDialog(page);
			});
			expect(writes).toEqual([]);
		});
	});
}
