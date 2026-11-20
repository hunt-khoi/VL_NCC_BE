// So đường dẫn API frontend gọi với route của backend .NET 10.
// node routes-diff.cjs <frontend src> <backend Controllers dir>
const fs = require('fs');
const path = require('path');
const [feDir, beDir] = process.argv.slice(2);

function walk(d, ext, out = []) {
	for (const e of fs.readdirSync(d, { withFileTypes: true })) {
		const p = path.join(d, e.name);
		if (e.isDirectory()) walk(p, ext, out);
		else if (p.endsWith(ext)) out.push(p);
	}
	return out;
}

// ---- backend routes ----
const be = new Set();
for (const f of walk(beDir, '.cs')) {
	const s = fs.readFileSync(f, 'utf8');
	// tách theo từng class có [Route] ở mức class
	const clsRe = /\[Route\("([^"]+)"\)\]\s*(?:\[[^\]]*\]\s*)*(?:public\s+)?(?:sealed\s+|partial\s+)*class\s+(\w+)/g;
	const heads = [];
	let c;
	while ((c = clsRe.exec(s))) heads.push({ base: c[1], name: c[2], at: clsRe.lastIndex });
	heads.forEach((h, i) => {
		const base = h.base.replace('[controller]', h.name.replace(/Controller$/, '')).replace(/^\/+/, '');
		const body = s.slice(h.at, i + 1 < heads.length ? heads[i + 1].at : s.length);
		const re = /\[(Http(?:Get|Post|Put|Delete|Patch)|Route)(?:\("([^"]*)"\))?\]/g;
		let m;
		let any = false;
		while ((m = re.exec(body))) {
			any = true;
			const r = m[2] ?? '';
			const full = r.startsWith('~/') ? r.slice(2) : r ? base + '/' + r : base;
			be.add(norm(full));
		}
		if (!any) be.add(norm(base));
	});
}
function norm(u) {
	return u
		.toLowerCase()
		.replace(/^\/+|\/+$/g, '')
		.replace(/\{[^}]+\}/g, '{}')
		.replace(/\/+/g, '/');
}

// ---- frontend calls ----
const fe = new Map(); // url -> files
for (const f of walk(feDir, '.ts')) {
	const s = fs.readFileSync(f, 'utf8');
	if (!s.includes('ApiRoot')) continue;
	const consts = {};
	const cre = /(?:const|let|var|readonly|private|public)?\s*(\w+)\s*(?::\s*string)?\s*=\s*environment\.ApiRoot\s*\+\s*['"`]([^'"`]+)['"`]/g;
	let m;
	while ((m = cre.exec(s))) consts[m[1]] = m[2];
	const add = (u) => {
		u = u.split('?')[0].replace(/\$\{[^}]+\}/g, '{}');
		const k = norm('api' + (u.startsWith('/') ? '' : '/') + u);
		if (!fe.has(k)) fe.set(k, new Set());
		fe.get(k).add(path.relative(feDir, f));
	};
	const dre = /environment\.ApiRoot\s*\+\s*['"`]([^'"`]+)['"`]/g;
	while ((m = dre.exec(s))) add(m[1]);
	for (const [name, base] of Object.entries(consts)) {
		const ure = new RegExp('(?:this\\.)?\\b' + name + '\\s*\\+\\s*[\'"`]([^\'"`]+)[\'"`]', 'g');
		while ((m = ure.exec(s))) add(base + m[1]);
		const ute = new RegExp('`\\$\\{(?:this\\.)?' + name + '\\}([^`]*)`', 'g');
		while ((m = ute.exec(s))) add(base + m[1]);
	}
}

// ---- match ----
function matches(u) {
	if (be.has(u)) return true;
	// đường dẫn frontend có thể kết thúc bằng id nối thêm (api/x/get/ + id)
	for (const r of be) {
		const rx = new RegExp('^' + r.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{\}/g, '[^/]+') + '$');
		if (rx.test(u)) return true;
		if (r.startsWith(u + '/{}')) return true; // frontend nối id ở sau
	}
	return false;
}
if (process.env.DUMP_FE) { fs.writeFileSync(process.env.DUMP_FE, JSON.stringify(Object.fromEntries([...fe].map(([k, v]) => [k, [...v]])))); }
const missing = [...fe.keys()].filter((u) => !matches(u)).sort();
console.log(`backend routes: ${be.size}, frontend urls: ${fe.size}, khong khop: ${missing.length}`);
for (const u of missing) console.log(u, '  <=', [...fe.get(u)].slice(0, 2).join(', '));
