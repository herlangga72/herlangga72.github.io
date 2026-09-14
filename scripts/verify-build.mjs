/**
 * Post-build assertions.
 *
 * Why this exists: `vite build` with adapter-static can finish with exit code 0
 * while silently writing NO html for a route. A ReferenceError in a component's
 * instance script during prerender produces exactly that (the server `load`
 * still runs, so `__data.json` is written and the log stays clean). The deploy
 * workflow would then publish a site whose root 404s.
 *
 * So: never trust the build's exit code. Check the artifacts.
 *
 * Run via `pnpm build` (wired into the build script), or directly:
 *   node scripts/verify-build.mjs
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(root, 'build');

const failures = [];
const notes = [];

const fail = (msg) => failures.push(msg);
const ok = (msg) => notes.push(msg);

const read = (rel) => readFileSync(join(build, rel), 'utf8');

/** 1. Every route that must exist, exists. */
const REQUIRED = [
	'index.html',
	'api/index.html',
	'sitemap.xml',
	'robots.txt',
	'.nojekyll',
	'favicon.png',
	'api/user.json',
	'api/github.json',
	'api/practice.json',
	'api/code_learning/leetcode.json',
	'api/code_learning/codewars.json',
	'api/code_learning/cssbattle.json'
];

for (const rel of REQUIRED) {
	const abs = join(build, rel);
	if (!existsSync(abs)) fail(`missing build output: ${rel}`);
	// .nojekyll is a marker file and is legitimately zero bytes. Everything else
	// being empty means the route rendered to nothing.
	else if (statSync(abs).size === 0 && rel !== '.nojekyll') fail(`empty build output: ${rel}`);
}
ok(`${REQUIRED.length} required artifacts present`);

/** 2. The homepage is a real page, not a stub. */
if (existsSync(join(build, 'index.html'))) {
	const html = read('index.html');

	if (html.length < 20_000) fail(`index.html is suspiciously small (${html.length} bytes)`);

	// Stable identifiers: the three flagship repos, and every section anchor.
	for (const slug of ['ternary-bonsai-inference', 'moe-680m', 'SDGs-Paper-Tester']) {
		if (!html.includes(slug)) fail(`index.html does not mention flagship "${slug}"`);
	}
	for (const id of ['work', 'projects', 'stack', 'practice', 'background']) {
		if (!html.includes(`id="${id}"`)) fail(`index.html has no #${id} section`);
	}
	if (html.includes('ReferenceError') || html.includes('Svelte error')) {
		fail('index.html contains a rendering error');
	}

	/** 3. No third-party runtime dependencies (PLAN.md F4: no web fonts, no CDN). */
	const externals = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
		.map((m) => m[1])
		// Outbound links are fine; embedded resources are not. The offline build
		// makes no requests, so only subresource tags matter here.
		.filter((u) => /\.(js|css|woff2?|ttf|png|jpg|svg)(\?|$)/.test(u));
	if (externals.length) fail(`index.html loads third-party assets: ${externals.join(', ')}`);
	else ok('no third-party assets referenced');
}

/** 4. Internal links resolve. Catches /api/user/ vs /api/user.json, and a wrong relative base. */
function checkLinks(htmlPath) {
	const html = read(htmlPath);
	const pageDir = dirname(htmlPath); // 'index.html' -> '.', 'api/index.html' -> 'api'

	const found = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
		.map((m) => m[1])
		.filter((u) => !/^(https?:|mailto:|data:|#)/.test(u))
		.map((u) => u.split(/[?#]/)[0])
		.filter(Boolean);

	for (const url of found) {
		// Absolute URLs resolve from the build root; relative ones resolve against
		// the directory the page itself is served from.
		const base = url.startsWith('/') ? join(build, url) : join(build, pageDir, url);
		const candidates = [base, join(base, 'index.html')];
		if (!candidates.some((c) => existsSync(c) && statSync(c).isFile())) {
			fail(`${htmlPath} references ${url}, which does not resolve in build/`);
		}
	}

	// Guard against the check silently passing because the regex matched nothing.
	if (found.length < 5) fail(`${htmlPath} exposes only ${found.length} local references to check`);
	if (!found.some((u) => u.includes('_app/'))) {
		fail(`${htmlPath} references no built JS/CSS from _app/`);
	}
	return found.length;
}

if (existsSync(join(build, 'index.html'))) {
	ok(`${checkLinks('index.html')} local references on / resolve`);
	ok(`${checkLinks('api/index.html')} local references on /api resolve`);
}

/** 5. The JSON endpoints are actually JSON, and degraded sources are null, not junk. */
const responseShape = {
	// Flat curated profile.
	'api/user.json': (d) =>
		d.name && d.handle && Array.isArray(d.contact) && d.flagshipRepos?.length === 3,
	'api/github.json': (d) => d.user && Array.isArray(d.projects) && d.projects.length > 0,
	'api/practice.json': (d) => d.sources && d.codewars && d.leetcode && d.cssbattle,
	'api/code_learning/leetcode.json': (d) => typeof d.available === 'boolean',
	'api/code_learning/codewars.json': (d) => typeof d.available === 'boolean',
	'api/code_learning/cssbattle.json': (d) => typeof d.available === 'boolean'
};

for (const [rel, check] of Object.entries(responseShape)) {
	if (!existsSync(join(build, rel))) continue;
	let parsed;
	try {
		parsed = JSON.parse(read(rel));
	} catch {
		fail(`${rel} is not valid JSON`);
		continue;
	}
	if (!check(parsed)) fail(`${rel} has an unexpected shape`);
}

// A source can be down at build time. That is allowed and must not fail the
// build: the tile hides itself. But the payload has to say so explicitly rather
// than shipping a half-filled object.
if (existsSync(join(build, 'api/practice.json'))) {
	const practice = JSON.parse(read('api/practice.json'));
	const degraded = ['codewars', 'leetcode', 'cssbattle'].filter((k) => {
		const src = practice[k];
		return src === null || src?.available === false;
	});
	ok(
		degraded.length
			? `practice sources unavailable at build time: ${degraded.join(', ')}`
			: 'all practice sources resolved'
	);
}

/** 6. Sitemap must not advertise the API (it is noindex) but must list the root. */
if (existsSync(join(build, 'sitemap.xml'))) {
	const xml = read('sitemap.xml');
	if (!xml.includes('herlangga72.github.io')) fail('sitemap.xml does not list the site URL');
	if (xml.includes('/api')) fail('sitemap.xml advertises the noindex /api tree');
	else ok('sitemap.xml contains only indexable URLs');
}

if (failures.length) {
	console.error(`\n✖ build verification failed (${failures.length}):`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.log('\n✔ build verification passed');
for (const n of notes) console.log(`  · ${n}`);
