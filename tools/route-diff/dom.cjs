// Đăng nhập rồi in cấu trúc vùng nội dung của từng trang (thẻ kt-*, bảng, chữ đầu trang).
// Chạy trong tools/e2e: node dom.cjs /profile /profile/notification
const path = require('path');
require(path.join(process.cwd(), 'node_modules/dotenv')).config();
const { chromium } = require(path.join(process.cwd(), 'node_modules/playwright'));
(async () => {
	const b = await chromium.launch();
	const p = await (await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } })).newPage();
	await p.goto('http://localhost:3105/auth/login', { waitUntil: 'domcontentloaded' });
	await p.locator('input[formcontrolname="username"]').fill(process.env.E2E_USER);
	await p.locator('input[formcontrolname="password"]').fill(process.env.E2E_PASS);
	await p.locator('#kt_login_signin_submit').click();
	await p.waitForURL((u) => !u.pathname.includes('/auth'), { timeout: 30000 });
	await p.waitForTimeout(4000);
	for (const u of process.argv.slice(2)) {
		await p.goto('http://localhost:3105' + u, { waitUntil: 'networkidle' }).catch(() => {});
		await p.waitForTimeout(1500);
		const info = await p.evaluate(() => {
			const content = document.querySelector('#kt_content, .kt-content') || document.body;
			const tags = [...content.querySelectorAll('*')].map((e) => e.tagName.toLowerCase()).filter((t) => t.startsWith('kt-') || t.includes('card') || t === 'table' || t === 'form');
			const visible = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null).length;
			return {
				tags: [...new Set(tags)].slice(0, 15),
				hien: { 'kt-portlet': visible('kt-portlet'), 'table[mat-table]': visible('table[mat-table]'), '.kt-portlet__head-title': visible('.kt-portlet__head-title'), '.kt-portlet': visible('.kt-portlet') },
				text: (content.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200),
			};
		});
		console.log(u, '->', p.url().replace('http://localhost:3105', ''), JSON.stringify(info, null, 1));
	}
	await b.close();
})();
