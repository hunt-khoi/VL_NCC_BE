// URL frontend chỉ khớp backend nhờ một route có tham số ({id}...) mà đoạn tương ứng ở frontend lại là chữ cố định
// (ví dụ FE gọi user-manager/list, BE chỉ còn user-manager/{id}): nhiều khả năng route đã đổi.
// node fe-literal-vs-param.cjs <Controllers dir> <fe.json>
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'be-diff.cjs'), 'utf8');
const parseSrc = src.slice(src.indexOf('function walk'), src.indexOf('const [oldDir'));
const mod = {};
new Function('fs', 'path', 'mod', parseSrc + '; mod.parse = parse;')(fs, path, mod);

const [dir, feFile] = process.argv.slice(2);
const C = mod.parse(dir);
const fe = JSON.parse(fs.readFileSync(feFile, 'utf8'));
const routes = [...new Set(Object.values(C).flatMap((c) => Object.values(c.actions).map((r) => r.split(' ')[1].replace(/\{[^}]+\}/g, '{}'))))];
const segs = (u) => u.split('/').filter(Boolean);
const out = [];
for (const [u, files] of Object.entries(fe)) {
	const us = segs(u);
	if (routes.includes(u)) continue; // khớp chính xác
	const viaParam = routes.filter((r) => {
		const rs = segs(r);
		if (rs.length !== us.length) return false;
		let literalIntoParam = false;
		for (let i = 0; i < rs.length; i++) {
			if (rs[i] === '{}') {
				if (us[i] !== '{}' && !/^\d+$/.test(us[i])) literalIntoParam = true;
			} else if (rs[i] !== us[i]) return false;
		}
		return literalIntoParam;
	});
	if (viaParam.length) out.push(`${u}   ~ ${viaParam.join(', ')}   <= ${files.map((f) => f.split('\\').pop()).join(', ')}`);
}
console.log(out.sort().join('\n'));
console.error(`nghi van: ${out.length}`);
