// Đăng nhập (+ đổi vai trò theo E2E_VAITRO), mở các trang, in lỗi console kèm stack và request lỗi.
// Chạy trong tools/e2e: node stack.cjs /ho-so-ncc /hdsd
const path = require('path');
require(path.join(process.cwd(), 'node_modules/dotenv')).config();
const { chromium } = require(path.join(process.cwd(), 'node_modules/playwright'));
(async () => {
	const b = await chromium.launch();
	const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
	const p = await ctx.newPage();
	await p.goto('http://localhost:3105/auth/login', { waitUntil: 'domcontentloaded' });
	await p.locator('input[formcontrolname="username"]').fill(process.env.E2E_USER);
	await p.locator('input[formcontrolname="password"]').fill(process.env.E2E_PASS);
	await p.locator('#kt_login_signin_submit').click();
	await p.waitForURL((u) => !u.pathname.includes('/auth'), { timeout: 30000 });
	await p.waitForLoadState('networkidle').catch(() => {});
	const vt = process.env.E2E_VAITRO;
	if (vt) {
		await p.locator('kt-user-profile [ngbdropdowntoggle]').click();
		await p.getByText(/^\s*Đổi vai trò\s*$/).click();
		const row = p.locator('mat-dialog-container tr[mat-row]').filter({ hasText: vt }).first();
		await row.waitFor();
		if (await row.evaluate((r) => r.classList.contains('row-in-use'))) await p.keyboard.press('Escape');
		else await Promise.all([p.waitForEvent('load'), row.click()]);
		await p.waitForLoadState('networkidle').catch(() => {});
	}
	let cur = '';
	p.on('console', (m) => {
		if (m.type() === 'error' && !/Server timeout elapsed/.test(m.text())) console.log(`[${cur}] CONSOLE`, m.text().split('\n').filter((l) => !/node_modules|vite\/deps|zone\.js/.test(l)).slice(0, 6).join('\n'), '\n');
	});
	p.on('response', (r) => {
		if (r.status() >= 400 && /\/api\//.test(r.url())) console.log(`[${cur}] HTTP ${r.status()} ${r.request().method()} ${r.url().slice(0, 160)}`);
	});
	p.on('requestfailed', (r) => console.log(`[${cur}] FAILED ${r.url().slice(0, 160)} ${r.failure()?.errorText}`));
	for (const u of process.argv.slice(2)) {
		cur = u;
		const t = Date.now();
		await p.goto('http://localhost:3105' + u, { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => console.log(`[${u}] GOTO`, e.message.split('\n')[0]));
		await p.waitForTimeout(1500);
		const title = await p.locator('.kt-portlet__head-title, h3').first().innerText({ timeout: 1000 }).catch(() => '(khong co tieu de)');
		console.log(`[${u}] => ${p.url().replace('http://localhost:3105', '')}  ${Date.now() - t}ms  tieu de: ${title.trim().slice(0, 60)}\n`);
	}
	await b.close();
})();
