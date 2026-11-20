import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '../fixtures';
import { open } from '../helpers';

// Mo moi man hinh trong tools/visual/screens.json (lay tu menu cua tai khoan test).
// Bat loi rong nhat: module lazy-load hong, component thieu provider, template loi luc chay.
type Screen = { name: string; path: string; steps?: unknown[] };
const screens: Screen[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../../visual/screens.json'), 'utf8')).filter(
	(s: Screen) => !s.steps?.length,
);

for (const screen of screens) {
	test(`@ro mo trang ${screen.path}`, async ({ page }) => {
		await open(page, screen.path);
		// Chi xet phan tu dang hien: topbar co san .kt-portlet__head-title an (khung Thong bao) dung truoc trong DOM.
		const content = page.locator('kt-portlet, .kt-portlet, table[mat-table], .kt-portlet__head-title, canvas, kt-dashboard').filter({ visible: true }).first();
		await expect(content, 'trang khong co tieu de, bang hay noi dung').toBeVisible();
	});
}
