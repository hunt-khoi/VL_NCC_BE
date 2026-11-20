// Trường JSON mà backend cũ trả DateTime gốc (r["col"]) còn backend mới định dạng thành chuỗi.
// node date-diff.cjs <old NCC_API dir> <new NCC_API dir>
const fs = require('fs');
const path = require('path');
const walk = (d, out = []) => {
	for (const e of fs.readdirSync(d, { withFileTypes: true })) {
		if (['bin', 'obj', 'docs'].includes(e.name)) continue;
		const p = path.join(d, e.name);
		if (e.isDirectory()) walk(p, out);
		else if (p.endsWith('.cs')) out.push(p);
	}
	return out;
};
const [oldDir, newDir] = process.argv.slice(2);

// mới: Ten: string.Format("{0:dd/MM...}", r["col"])  hoặc  Ten = ...
const fmtRe = /(\w+)\s*[:=]\s*(?:r\["\w+"\]\s*!=\s*DBNull\.Value\s*\?\s*)?string\.Format\("\{0:(dd\/MM[^}]*)\}",\s*\w+\["(\w+)"\]\)/g;
const newFmt = new Map(); // "Ten|col" -> {fmt, files}
for (const f of walk(newDir)) {
	const s = fs.readFileSync(f, 'utf8');
	for (const m of s.matchAll(fmtRe)) {
		const k = `${m[1]}|${m[3].toLowerCase()}`;
		if (!newFmt.has(k)) newFmt.set(k, { fmt: m[2], files: new Set() });
		newFmt.get(k).files.add(path.basename(f));
	}
}
// cũ: Ten = r["col"]  (không format)
const rawOld = new Set();
const fmtOld = new Set();
for (const f of walk(oldDir)) {
	const s = fs.readFileSync(f, 'utf8');
	for (const m of s.matchAll(/(\w+)\s*=\s*\w+\["(\w+)"\]\s*[,}\n]/g)) rawOld.add(`${m[1]}|${m[2].toLowerCase()}`);
	for (const m of s.matchAll(fmtRe)) fmtOld.add(`${m[1]}|${m[3].toLowerCase()}`);
}
const out = [];
for (const [k, v] of newFmt) if (rawOld.has(k) && !fmtOld.has(k)) out.push(`${k.replace('|', '  <- r["')}"]  fmt=${v.fmt}  [${[...v.files].join(', ')}]`);
console.log(out.sort().join('\n'));
console.error(`truong doi tu DateTime sang chuoi: ${out.length}`);
