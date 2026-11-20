import { test, expect } from '../fixtures';

// signalR.service.ts dung skipNegotiation + WebSockets nen khong co request "negotiate":
// kiem tra socket mo toi /signalr va backend tra goi bat tay (handshake) thanh cong.
test('@ro SignalR ket noi duoc sau khi vao app', async ({ page }) => {
	const socketPromise = page.waitForEvent('websocket', { predicate: (ws) => /\/signalr/i.test(ws.url()), timeout: 30_000 });
	await page.goto('/');
	const socket = await socketPromise;
	expect(socket.url()).toMatch(/^wss?:/);
	// Goi bat tay thanh cong cua SignalR la "{}" (ket thuc bang ky tu 0x1E); co "error" la that bai.
	const frame = await socket.waitForEvent('framereceived', { timeout: 15_000 });
	const text = typeof frame.payload === 'string' ? frame.payload : frame.payload.toString('utf8');
	expect(text, 'goi bat tay SignalR').not.toContain('"error"');
});
