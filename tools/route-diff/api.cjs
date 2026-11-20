// Đăng nhập qua giao diện để lấy token, rồi gọi GET các đường dẫn API truyền vào.
// Chạy trong tools/e2e: NODE_TLS_REJECT_UNAUTHORIZED=0 node api.cjs /api/x?y=1 /api/z
const path = require('path');
require(path.join(process.cwd(), 'node_modules/dotenv')).config();
const { chromium } = require(path.join(process.cwd(), 'node_modules/playwright'));
const API = 'https://localhost:7243';
(async () => {
	const b = await chromium.launch();
	const p = await (await b.newContext({ ignoreHTTPSErrors: true })).newPage();
	await p.goto('http://localhost:3105/auth/login', { waitUntil: 'domcontentloaded' });
	await p.locator('input[formcontrolname="username"]').fill(process.env.E2E_USER);
	await p.locator('input[formcontrolname="password"]').fill(process.env.E2E_PASS);
	await p.locator('#kt_login_signin_submit').click();
	await p.waitForURL((u) => !u.pathname.includes('/auth'), { timeout: 30000 });
	await p.waitForTimeout(4000);
	const tok = await p.evaluate(() => localStorage.getItem(Object.keys(localStorage).find((k) => k.startsWith('auth'))));
	await b.close();
	for (const u of process.argv.slice(2)) {
		const r = await fetch(API + u, { headers: { Authorization: 'Bearer ' + tok } });
		console.log(r.status, u, '=>', (await r.text()).slice(0, 300));
	}
})();
