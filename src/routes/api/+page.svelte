<script lang="ts">
	// A prerendered page rather than an endpoint: /api has children, so it has to
	// resolve to a directory (api/index.html) instead of a file named `api`.
	//
	// The endpoints carry a `.json` suffix on purpose. GitHub Pages picks the
	// Content-Type from the file extension, and an extensionless file is served as
	// application/octet-stream, which makes the browser download it instead of
	// showing the JSON.
	const endpoints = [
		{
			path: '/api/user.json',
			desc: 'Curated profile: identity, contact, education, open-source contributions, capabilities.'
		},
		{
			path: '/api/github.json',
			desc: 'Live repository snapshot: every owned repo with language, stars and dates.'
		},
		{
			path: '/api/practice.json',
			desc: 'Aggregated coding-practice stats from all three sources.'
		},
		{
			path: '/api/code_learning/leetcode.json',
			desc: 'LeetCode solved counts (easy / medium / hard). No ranking.'
		},
		{
			path: '/api/code_learning/codewars.json',
			desc: 'Codewars rank, honor and completed kata count.'
		},
		{ path: '/api/code_learning/cssbattle.json', desc: 'CSSBattle targets attempted.' }
	];
</script>

<svelte:head>
	<title>API — Herlangga Yusuf Syailendra</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="shell py-16">
	<p class="eyebrow">Endpoints</p>
	<h1 class="mt-3 text-2xl sm:text-3xl">Static JSON API</h1>
	<p class="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
		This site has no server. Everything below is prerendered at build time and served as a
		CDN-cached static file, so there is no rate limit, no cold start, and no way for it to drift out
		of sync with the page it describes. The nightly build refreshes the data.
	</p>

	<ul class="mt-8 divide-y divide-[var(--border)] border-y border-line">
		{#each endpoints as e}
			<li class="py-4">
				<a class="mono text-sm text-ink link-underline" href={e.path}>{e.path}</a>
				<p class="mt-1 text-sm text-muted">{e.desc}</p>
			</li>
		{/each}
	</ul>

	<p class="mono mt-8 text-[0.68rem] text-faint">
		<a class="link-underline" href="/">← back to the portfolio</a>
	</p>
</main>
