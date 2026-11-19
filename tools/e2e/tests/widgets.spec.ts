import { test, expect } from '../fixtures';
import { open } from '../helpers';

test.beforeEach(async ({ page }) => {
	await open(page, '/');
});

test('@ro bieu do dashboard ve ra canvas co noi dung', async ({ page }) => {
	const canvas = page.locator('canvas').first();
	await expect(canvas).toBeVisible();
	// Canvas co it nhat mot pixel khong trong suot va khac pixel goc (mau nen).
	await expect
		.poll(() =>
			canvas.evaluate((c: HTMLCanvasElement) => {
				const ctx = c.getContext('2d');
				if (!ctx || !c.width || !c.height) return false;
				const data = ctx.getImageData(0, 0, c.width, c.height).data;
				const [r, g, b, a] = [data[0], data[1], data[2], data[3]];
				for (let i = 4; i < data.length; i += 4) {
					if (data[i + 3] > 0 && (data[i] !== r || data[i + 1] !== g || data[i + 2] !== b || data[i + 3] !== a)) return true;
				}
				return false;
			}),
		)
		.toBe(true);
});

test('@ro carousel thong ke tren dashboard co slide dang hien', async ({ page }) => {
	const carousel = page.locator('ngb-carousel');
	test.skip((await carousel.count()) === 0, 'dashboard khong co carousel voi tai khoan nay');
	await expect(carousel.locator('.carousel-item.active')).toHaveCount(1);
});

test('@ro avatar nguoi dung tren topbar hien anh hoac chu viet tat', async ({ page }) => {
	const avatar = page.locator('kt-user-profile ngx-avatars').first();
	await expect(avatar).toBeVisible();
	await expect(avatar.locator('img, .avatar-content, div').first()).toBeVisible();
});
