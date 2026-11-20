// URL frontend gọi mà backend (mới) không có route nào khớp (bỏ qua verb).
// node fe-vs-new.cjs <Controllers dir> <fe.json>
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'be-diff.cjs'), 'utf8');
const parseSrc = src.slice(src.indexOf('function walk'), src.indexOf('const [oldDir'));
const mod = {};
new Function('fs', 'path', 'mod', parseSrc + '; mod.parse = parse;')(fs, path, mod);

const [dir, feFile] = process.argv.slice(2);
const C = mod.parse(dir);
const fe = JSON.parse(fs.readFileSync(feFile, 'utf8'));
const esc = (s) => s.replace(/[.*+?^$()|[\]\\]/g, (ch) => '\\' + ch);
const routes = Object.values(C).flatMap((c) => Object.values(c.actions).map((r) => r.split(' ')[1].replace(/\{[^}]+\}/g, '{}')));
const rxs = routes.map((p) => new RegExp('^' + esc(p).split(esc('{}')).join('[^/]+') + '$'));
const miss = [];
for (const [u, files] of Object.entries(fe)) {
	const ok = rxs.some((rx) => rx.test(u)) || routes.some((p) => p.startsWith(u + '/{}')) || routes.includes(u.replace(/\/\{\}$/, ''));
	if (!ok) miss.push(`${u}   <= ${files.map((f) => f.split('\\').pop()).join(', ')}`);
}
console.log(miss.sort().join('\n'));
console.error(`routes: ${routes.length}, fe urls: ${Object.keys(fe).length}, khong khop: ${miss.length}`);
