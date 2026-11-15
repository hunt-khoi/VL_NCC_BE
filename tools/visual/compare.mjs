// So sanh hai bo anh va sinh bao cao HTML.
//
//   node compare.mjs <nhan goc> <nhan moi>
//
// Nhan "reference" doc anh tu thu muc reference/ (giao dien mau), cac nhan khac doc tu shots/<nhan>/.
// Exit code 1 neu co man hinh lech qua nguong hoac thieu o mot trong hai bo.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [baseLabel, newLabel] = process.argv.slice(2);
if (!baseLabel || !newLabel) {
	console.error('Cach dung: node compare.mjs <nhan goc> <nhan moi>');
	process.exit(2);
}

// Ty le pixel lech toi da cho mot man hinh duoc coi la giong.
const MAX_DIFF_RATIO = 0.001;

const dirOf = (label) => (label === 'reference' ? path.join(here, 'reference') : path.join(here, 'shots', label));
const list = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.png')) : []);

const baseDir = dirOf(baseLabel);
const newDir = dirOf(newLabel);
const baseFiles = new Set(list(baseDir));
const newFiles = new Set(list(newDir));
if (!baseFiles.size || !newFiles.size) {
	console.error(`Khong co anh trong ${!baseFiles.size ? baseDir : newDir}`);
	process.exit(2);
}

const reportDir = path.join(here, 'report', `${newLabel}-vs-${baseLabel}`);
fs.rmSync(reportDir, { recursive: true, force: true });
fs.mkdirSync(reportDir, { recursive: true });

// Dat anh vao khung chung de so duoc ca khi kich thuoc khac nhau; phan thua tinh la lech.
function pad(png, width, height) {
	if (png.width === width && png.height === height) return png;
	const out = new PNG({ width, height });
	out.data.fill(0);
	PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
	return out;
}

const rows = [];
for (const file of [...new Set([...baseFiles, ...newFiles])].sort()) {
	const name = file.replace(/\.png$/, '');
	if (!baseFiles.has(file) || !newFiles.has(file)) {
		rows.push({ name, ratio: 1, note: !baseFiles.has(file) ? `chi co o ${newLabel}` : `thieu o ${newLabel}`, missing: true });
		continue;
	}
	const a = PNG.sync.read(fs.readFileSync(path.join(baseDir, file)));
	const b = PNG.sync.read(fs.readFileSync(path.join(newDir, file)));
	const width = Math.max(a.width, b.width);
	const height = Math.max(a.height, b.height);
	const diff = new PNG({ width, height });
	const count = pixelmatch(pad(a, width, height).data, pad(b, width, height).data, diff.data, width, height, { threshold: 0.1 });
	const ratio = count / (width * height);
	const sizeChanged = a.width !== b.width || a.height !== b.height;
	if (ratio > 0) fs.writeFileSync(path.join(reportDir, file), PNG.sync.write(diff));
	rows.push({
		name, ratio, file,
		note: sizeChanged ? `kich thuoc ${a.width}x${a.height} -> ${b.width}x${b.height}` : '',
	});
}

rows.sort((x, y) => y.ratio - x.ratio);
const failed = rows.filter((r) => r.ratio > MAX_DIFF_RATIO);
const rel = (dir, file) => path.relative(reportDir, path.join(dir, file)).split(path.sep).join('/');
const pct = (r) => (r * 100).toFixed(3) + '%';

const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>${newLabel} vs ${baseLabel}</title>
<style>
body{font:14px/1.5 system-ui,sans-serif;margin:24px;background:#f5f6f8;color:#1c1e21}
h1{font-size:20px} .sum{margin:8px 0 24px}
section{background:#fff;border:1px solid #dcdfe4;border-radius:6px;margin:0 0 20px;padding:12px 16px}
section.bad{border-left:4px solid #c62828} section.ok{border-left:4px solid #2e7d32}
h2{font-size:15px;margin:0 0 8px} .note{color:#6b7280;font-weight:normal}
.imgs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.imgs figure{margin:0} .imgs figcaption{font-size:12px;color:#6b7280}
.imgs img{width:100%;border:1px solid #dcdfe4}
</style></head><body>
<h1>${newLabel} so voi ${baseLabel}</h1>
<p class="sum">${rows.length} man hinh, ${failed.length} lech qua nguong ${pct(MAX_DIFF_RATIO)}.</p>
${rows.filter((r) => r.ratio > 0).map((r) => `<section class="${r.ratio > MAX_DIFF_RATIO ? 'bad' : 'ok'}">
<h2>${r.name} — ${r.missing ? r.note : pct(r.ratio)} <span class="note">${r.missing ? '' : r.note}</span></h2>
${r.missing ? '' : `<div class="imgs">
<figure><a href="${rel(baseDir, r.file)}"><img loading="lazy" src="${rel(baseDir, r.file)}"></a><figcaption>${baseLabel}</figcaption></figure>
<figure><a href="${rel(newDir, r.file)}"><img loading="lazy" src="${rel(newDir, r.file)}"></a><figcaption>${newLabel}</figcaption></figure>
<figure><a href="${r.file}"><img loading="lazy" src="${r.file}"></a><figcaption>khac biet</figcaption></figure>
</div>`}
</section>`).join('\n')}
</body></html>`;
fs.writeFileSync(path.join(reportDir, 'index.html'), html);

console.log(`${rows.length} man hinh, ${failed.length} lech qua nguong ${pct(MAX_DIFF_RATIO)}`);
for (const r of failed.slice(0, 40)) console.log(`  ${r.missing ? r.note : pct(r.ratio)}  ${r.name}`);
if (failed.length > 40) console.log(`  ... va ${failed.length - 40} man hinh nua`);
console.log(`Bao cao: ${path.join(reportDir, 'index.html')}`);
process.exitCode = failed.length ? 1 : 0;
