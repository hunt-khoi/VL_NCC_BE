// Liệt kê route cũ (verb + path) không còn trong backend mới mà frontend có gọi.
// node be-diff2.cjs <old Controllers> <new Controllers> <fe.json>
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'be-diff.cjs'), 'utf8');
const parseSrc = src.slice(src.indexOf('function walk'), src.indexOf('const [oldDir'));
const mod = {};
new Function('fs', 'path', 'mod', parseSrc + '; mod.parse = parse;')(fs, path, mod);

const [oldDir, newDir, feFile] = process.argv.slice(2);
const O = mod.parse(oldDir);
const N = mod.parse(newDir);
const fe = JSON.parse(fs.readFileSync(feFile, 'utf8'));
const feKeys = Object.keys(fe);
const norm = (r) => r.replace(/\{[^}]+\}/g, '{}');
const esc = (s) => s.replace(/[.*+?^$()|[\]\\]/g, (ch) => '\\' + ch);
const newAll = new Set(Object.values(N).flatMap((c) => Object.values(c.actions).map(norm)));
const newPaths = new Set([...newAll].map((r) => r.split(' ')[1]));

for (const [name, o] of Object.entries(O)) {
	for (const [act, r] of Object.entries(o.actions)) {
		const nr = norm(r);
		if (newAll.has(nr)) continue;
		const p = nr.split(' ')[1];
		const rx = new RegExp('^' + esc(p).split(esc('{}')).join('[^/]+') + '$');
		const hits = feKeys.filter((k) => rx.test(k) || (p.endsWith('/{}') && k === p.slice(0, -3)));
		if (!hits.length) continue;
		const n = N[name];
		const same = n?.actions[act];
		console.log(`${r}   [${name}.${act}]${newPaths.has(p) ? '  (path con, doi verb)' : ''}`);
		console.log(`    moi: ${same ?? (n ? '(khong co action cung ten)' : '(controller khong con)')}`);
		console.log(`    FE : ${[...new Set(hits.flatMap((h) => fe[h]))].map((f) => f.split('\\').pop()).join(', ')}`);
	}
}
