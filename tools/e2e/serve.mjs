// Phuc vu mot thu muc build tinh nhu mot SPA (moi duong dan khong phai file deu tra ve index.html).
//
//   node serve.mjs <thu muc build> [cong]
//
// Dung de chup lai anh cua mot ban build cu, vi du ban Angular 13 goc da luu o build/_baseline_ng13.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '');
const port = Number(process.argv[3] || 3105);
if (!process.argv[2] || !fs.existsSync(path.join(root, 'index.html'))) {
	console.error('Cach dung: node serve.mjs <thu muc co index.html> [cong]');
	process.exit(2);
}

const TYPES = {
	'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
	'.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject', '.map': 'application/json', '.pdf': 'application/pdf',
};

http.createServer((req, res) => {
	const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
	let file = path.join(root, urlPath);
	// Chan duong dan thoat ra ngoai thu muc goc.
	if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
	if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
	res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
	fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Dang phuc vu ${root} tai http://localhost:${port}`));
