import { test, expect } from '../fixtures';

test('@ro SignalR ket noi duoc sau khi vao app', async ({ page }) => {
	const negotiate = page.waitForResponse((r) => /negotiate/i.test(r.url()), { timeout: 30_000 });
	const socket = page.waitForEvent('websocket', { timeout: 30_000 });
	await page.goto('/');
	expect((await negotiate).status()).toBe(200);
	expect((await socket).url()).toMatch(/^wss?:/);
});
