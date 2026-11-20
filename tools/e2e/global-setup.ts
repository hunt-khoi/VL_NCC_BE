import { chromium, type FullConfig } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { AUTH_FILE, BASE_URL } from './playwright.config';
import { loginAndSave } from './helpers';

const runsWriteTests = () => process.argv.some((a) => a.includes('@rw')) || process.env.E2E_RUN_RW === '1';

export default async function globalSetup(_config: FullConfig) {
	fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

	if (runsWriteTests()) {
		if (process.env.E2E_ALLOW_WRITE !== '1') {
			throw new Error('Nhom @rw ghi du lieu: dat E2E_ALLOW_WRITE=1 trong .env va tro backend vao database ban sao.');
		}
		const restore = process.env.E2E_RESTORE_CMD?.trim();
		if (!restore) throw new Error('Thieu E2E_RESTORE_CMD: can lenh khoi phuc database ban sao truoc luot @rw.');
		console.log(`[e2e] Khoi phuc database: ${restore}`);
		execSync(restore, { stdio: 'inherit' });
	}

	const user = process.env.E2E_USER;
	const pass = process.env.E2E_PASS;
	if (!user || !pass) {
		// Van cho chay nhom @nologin; cac test can dang nhap se fail o buoc mo trang.
		console.warn('[e2e] Chua co E2E_USER/E2E_PASS trong .env: chi chay duoc nhom @nologin.');
		fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
		return;
	}

	const browser = await chromium.launch();
	try {
		await loginAndSave(browser, BASE_URL, AUTH_FILE);
	} finally {
		await browser.close();
	}
}
