import { defineConfig } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';

loadEnv({ path: path.join(__dirname, '.env') });

export const BASE_URL = (process.env.E2E_BASE_URL || 'http://localhost:3105').replace(/\/+$/, '');
export const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

export default defineConfig({
	testDir: './tests',
	// Backend va du lieu dung chung: chay tuan tu.
	workers: 1,
	fullyParallel: false,
	retries: 1,
	timeout: 60_000,
	expect: { timeout: 15_000 },
	reporter: [['list'], ['html', { outputFolder: 'report', open: 'never' }]],
	outputDir: 'test-results',
	globalSetup: require.resolve('./global-setup'),
	use: {
		baseURL: BASE_URL,
		viewport: { width: 1440, height: 900 },
		locale: 'vi-VN',
		timezoneId: 'Asia/Ho_Chi_Minh',
		ignoreHTTPSErrors: true,
		// Bat --trace on khi chay lai mot test loi de go.
		trace: 'off',
		screenshot: 'only-on-failure',
		// Test @nologin tu bo storageState; cac test con lai dung phien da dang nhap.
		storageState: AUTH_FILE,
	},
});
