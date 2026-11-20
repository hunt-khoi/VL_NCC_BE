// So route backend cũ và mới theo tên controller + tên action.
// node be-diff.cjs <old Controllers> <new Controllers>
const fs = require('fs');
const path = require('path');

function walk(d, out = []) {
	for (const e of fs.readdirSync(d, { withFileTypes: true })) {
		const p = path.join(d, e.name);
		if (e.isDirectory()) walk(p, out);
		else if (p.endsWith('.cs')) out.push(p);
	}
	return out;
}

function parse(dir) {
	const ctrls = {};
	for (const f of walk(dir)) {
		const s = fs.readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '');
		const clsRe = /((?:\[[^\]]*\]\s*)*)(?:public\s+)?(?:sealed\s+|partial\s+|abstract\s+)*class\s+(\w+Controller)\b/g;
		const heads = [];
		let c;
		while ((c = clsRe.exec(s))) heads.push({ name: c[2], at: c.index, attrs: c[1] });
		heads.forEach((h, i) => {
			const rm = h.attrs.match(/\[Route\("([^"]*)"\)\]/);
			const base = (rm ? rm[1] : '').replace('[controller]', h.name.replace(/Controller$/, '')).toLowerCase();
			const end = i + 1 < heads.length ? heads[i + 1].at : s.length;
			h.end = end;
			const body = s.slice(h.at, end);
			const actions = {};
			// gom các attribute liền trước mỗi "public ... Name("
			const re = /((?:\s*\[[^\]]*\]\s*)+)\s*public\s+(?:async\s+)?[\w<>\[\],?\s]+?\s+(\w+)\s*\(/g;
			let m;
			while ((m = re.exec(body))) {
				const attrs = m[1];
				const verbM = attrs.match(/\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?/);
				if (!verbM) continue;
				const routeM = attrs.match(/\[Route\("([^"]*)"\)\]/);
				const r = (verbM[2] ?? routeM?.[1] ?? '').toLowerCase();
				const full = r.startsWith('~/') ? r.slice(2) : r ? base + '/' + r : base;
				let key = m[2];
				while (actions[key]) key += "'";
				actions[key] = verbM[1].toUpperCase() + ' ' + full.replace(/\{([^}:]+)(:[^}]*)?\}/g, '{$1}');
			}
			ctrls[h.name] = { base, actions, file: path.relative(dir, f) };
		});
	}
	return ctrls;
}

const [oldDir, newDir] = process.argv.slice(2);
const O = parse(oldDir);
const N = parse(newDir);
const lines = [];
for (const [name, o] of Object.entries(O)) {
	const n = N[name];
	if (!n) {
		lines.push(`MAT CONTROLLER ${name} (${o.base})`);
		continue;
	}
	for (const [act, oroute] of Object.entries(o.actions)) {
		const nroute = n.actions[act];
		if (!nroute) lines.push(`MAT ACTION  ${name}.${act}: ${oroute}`);
		else if (nroute !== oroute) lines.push(`DOI         ${name}.${act}: ${oroute}  =>  ${nroute}`);
	}
}
console.log(lines.join('\n'));
