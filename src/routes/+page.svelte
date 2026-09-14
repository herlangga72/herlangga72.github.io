<script lang="ts">
	import FlagshipCard from '$lib/components/FlagshipCard.svelte';
	import ProjectIndex from '$lib/components/ProjectIndex.svelte';

	export let data: import('./$types').PageData;

	const { identity, contact, stats, flagships, projects, languages, languageColors, skillGroups } =
		data;

	const nav = [
		{ href: '#work', label: 'Work' },
		{ href: '#projects', label: 'Projects' },
		{ href: '#stack', label: 'Stack' },
		{ href: '#practice', label: 'Practice' },
		{ href: '#background', label: 'Background' }
	];

	// The capability ledger in the hero: dotted leaders, no percentages (PLAN.md K1).
	const ledger = [
		{ k: 'LLM inference runtimes', v: 'built from scratch, in Rust' },
		{ k: 'GPU compute', v: 'hand-written Vulkan kernels' },
		{ k: 'Bare metal', v: 'x86-64 OS in NASM assembly' },
		{ k: 'Performance work', v: 'SIMD + numeric validation' },
		{ k: 'Shipping', v: 'live services, not just repos' }
	];

	const fetched = new Date(data.fetchedAt);
	const fetchedLabel = fetched.toLocaleString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'UTC'
	});

	const metaDescription = `${identity.name} — ${identity.role}. ${identity.subline}. Pure-Rust LLM inference engines, Vulkan GPU kernels, and a bare-metal x86-64 OS.`;

	/**
	 * JSON-LD for search engines.
	 *
	 * `&` and `<` are escaped to \uXXXX. Inside a <script> element the browser does
	 * not decode HTML entities and svelte:element still escapes text content, so a
	 * raw ampersand would reach the parser as "&amp;" and break the payload.
	 */
	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: identity.name,
		alternateName: identity.handle,
		jobTitle: identity.role,
		description: metaDescription,
		url: 'https://herlangga72.github.io/',
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Karanganyar',
			addressRegion: 'Central Java',
			addressCountry: 'ID'
		},
		sameAs: [identity.github]
	})
		.replace(/&/g, '\\u0026')
		.replace(/</g, '\\u003c');

	// LeetCode is shown as solved counts only. The global ranking is deliberately not
	// rendered: it is a number that can only ever look bad (PLAN.md L2).
	const lc = data.practice.leetcode;
</script>

<svelte:head>
	<title>{identity.name} — {identity.role}</title>
	<meta name="description" content={metaDescription} />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content={`${identity.name} — ${identity.role}`} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content="https://herlangga72.github.io/" />
	<meta name="twitter:card" content="summary" />
	<link rel="canonical" href="https://herlangga72.github.io/" />
	<!-- <script> contents are raw text in Svelte, so the payload goes through
	     svelte:element, which sets textContent. Never {@html}. -->
	<svelte:element this="script" type="application/ld+json">{jsonLd}</svelte:element>
</svelte:head>

<!-- ===================== NAV ===================== -->
<header class="site-header no-print sticky top-0 z-50 border-b border-line">
	<div class="shell flex h-14 items-center justify-between gap-4">
		<a href="#top" class="mono text-sm font-semibold tracking-tight">
			<span class="text-accent">~</span>/{identity.handle}
		</a>

		<nav class="hidden items-center gap-5 md:flex" aria-label="Sections">
			{#each nav as item}
				<a
					href={item.href}
					class="mono text-[0.72rem] uppercase tracking-wider text-muted transition-colors hover:text-accent"
					>{item.label}</a
				>
			{/each}
		</nav>

		<div class="flex items-center gap-2">
			<button
				type="button"
				class="mono hidden text-[0.72rem] uppercase tracking-wider text-muted transition-colors hover:text-accent sm:block"
				on:click={() => window.print()}>Résumé ↓</button
			>
			<a class="btn btn-primary mono !px-3 !py-1.5 !text-[0.72rem]" href="#contact">Hire</a>
		</div>
	</div>
</header>

<main id="top">
	<!-- ===================== HERO ===================== -->
	<section class="grid-lines relative border-b border-line">
		<div class="shell py-16 sm:py-24">
			<div class="grid grid-cols-1 gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
				<div>
					<div class="flex flex-wrap items-center gap-3">
						<p class="eyebrow">{identity.role}</p>
						<span class="chip chip-live chip-wrap">
							<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
							{identity.availability}
						</span>
					</div>

					<h1 class="mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
						{identity.name}
					</h1>

					<p class="mono mt-4 text-sm text-accent">{identity.subline}</p>

					<p class="mt-6 max-w-xl text-base leading-relaxed text-muted">
						I build the layer underneath the application: a <strong class="font-medium text-ink"
							>27B language model decoded end to end in pure Rust</strong
						>, a
						<strong class="font-medium text-ink">35B MoE engine running on an integrated GPU</strong
						>, and a
						<strong class="font-medium text-ink">multitasking OS written in assembly</strong>. Then
						I ship them, measure them, and publish the numbers.
					</p>

					<div class="mt-8 flex flex-wrap gap-3">
						<a class="btn btn-primary" href="#work">See the engines <span>▸</span></a>
						<a class="btn" href={identity.github} rel="noopener noreferrer" target="_blank"
							>GitHub <span class="text-faint">↗</span></a
						>
					</div>

					<div class="mt-10 max-w-lg border-l-2 border-line pl-4">
						<p class="text-sm italic leading-relaxed text-ink">“{identity.bioQuote}”</p>
						<p class="mt-2 text-xs leading-relaxed text-faint">{identity.bioTranslation}</p>
					</div>
				</div>

				<!-- Capability ledger -->
				<div class="lg:pt-2">
					<div class="panel p-5">
						<div class="mono mb-4 flex items-center gap-2 text-xs text-faint">
							<span class="h-2 w-2 rounded-full bg-accent"></span>
							strengths.txt
						</div>
						<dl class="space-y-2.5">
							{#each ledger as row}
								<div class="flex flex-wrap items-baseline gap-x-2 text-sm">
									<dt class="text-ink">{row.k}</dt>
									<span
										class="min-w-4 flex-1 translate-y-[-0.15em] border-b border-dotted border-line-strong"
									></span>
									<dd class="text-right text-xs text-muted">{row.v}</dd>
								</div>
							{/each}
						</dl>
					</div>

					<p class="mono mt-4 text-[0.68rem] leading-relaxed text-faint">
						{identity.location} · {identity.timezone} · working remotely
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===================== SIGNAL STRIP ===================== -->
	<section class="border-b border-line bg-elev">
		<div class="shell py-8">
			<dl class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
				<div>
					<dd class="text-2xl font-semibold text-ink">{stats.ownedRepos}</dd>
					<dt class="mono mt-1 text-[0.68rem] uppercase tracking-wider text-faint">
						public repositories
					</dt>
				</div>
				<div>
					<dd class="text-2xl font-semibold text-ink">{stats.rustRepos}</dd>
					<dt class="mono mt-1 text-[0.68rem] uppercase tracking-wider text-faint">
						written in Rust
					</dt>
				</div>
				<div>
					<dd class="text-2xl font-semibold text-ink">{flagships.length}</dd>
					<dt class="mono mt-1 text-[0.68rem] uppercase tracking-wider text-faint">
						engines built from scratch
					</dt>
				</div>
				<div>
					<dd class="text-2xl font-semibold text-ink">{stats.liveDemos}</dd>
					<dt class="mono mt-1 text-[0.68rem] uppercase tracking-wider text-faint">live demos</dt>
				</div>
				<div>
					<dd class="text-2xl font-semibold text-ink">{stats.yearsOnGitHub}</dd>
					<dt class="mono mt-1 text-[0.68rem] uppercase tracking-wider text-faint">
						years on GitHub (since {stats.firstCommitYear})
					</dt>
				</div>
			</dl>
			<p class="mono mt-6 text-[0.65rem] leading-relaxed text-faint">
				Counts derived live from the GitHub API at build time. Star counts are deliberately not
				shown: a repo with two stars and a repo with a thousand can both be worth reading, and this
				page would rather you opened the code.
			</p>
		</div>
	</section>

	<!-- ===================== FLAGSHIP WORK ===================== -->
	<section id="work" class="section">
		<div class="shell">
			<header class="max-w-2xl">
				<p class="eyebrow">01 — Selected work</p>
				<h2 class="mt-3 text-2xl sm:text-3xl">
					Three things that are hard to find a substitute for
				</h2>
				<p class="mt-3 text-sm leading-relaxed text-muted">
					Each one proves a different claim: depth in model internals, fluency with GPU hardware,
					and the ability to ship a finished product. Open one for the measured numbers and the
					architecture.
				</p>
			</header>

			<div class="mt-8 space-y-4">
				{#each flagships as flagship}
					<FlagshipCard {flagship} />
				{/each}
			</div>
		</div>
	</section>

	<!-- ===================== PROJECT INDEX ===================== -->
	<section id="projects" class="section">
		<div class="shell">
			<header class="max-w-2xl">
				<p class="eyebrow">02 — Everything else</p>
				<h2 class="mt-3 text-2xl sm:text-3xl">The full repository index</h2>
				<p class="mt-3 text-sm leading-relaxed text-muted">
					Every repository I own, newest and most notable first. Forks are counted but not listed,
					because they are other people's work.
				</p>
			</header>

			<div class="no-print">
				<ProjectIndex
					{projects}
					{languages}
					{languageColors}
					totalOwned={stats.ownedRepos}
					forkedCount={stats.forkedRepos}
				/>
			</div>

			<p class="print-note print-only mt-4">
				{stats.ownedRepos} public repositories across {stats.languages} languages, plus
				{stats.forkedRepos} forks. The full, filterable index is at herlangga72.github.io.
			</p>
		</div>
	</section>

	<!-- ===================== STACK ===================== -->
	<section id="stack" class="section">
		<div class="shell">
			<header class="max-w-2xl">
				<p class="eyebrow">03 — Capabilities</p>
				<h2 class="mt-3 text-2xl sm:text-3xl">What I actually work in</h2>
				<p class="mt-3 text-sm leading-relaxed text-muted">
					Grouped by the kind of work it maps to, not by invented proficiency scores. Every entry
					links to a repository that proves it.
				</p>
			</header>

			<div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each skillGroups as group}
					<div class="panel p-5">
						<h3 class="text-base text-ink">{group.title}</h3>
						<p class="mt-1 text-xs leading-relaxed text-faint">{group.blurb}</p>
						<ul class="mt-4 flex flex-wrap gap-1.5">
							{#each group.skills as skill}
								<li>
									<a
										class="chip chip-wrap transition-colors hover:border-accent hover:text-accent"
										href={skill.href}
										rel="noopener noreferrer"
										target="_blank"
										title="Evidence: {skill.evidence}">{skill.name}</a
									>
								</li>
							{/each}
						</ul>
					</div>
				{/each}

				<div class="panel flex flex-col justify-between p-5">
					<div>
						<h3 class="text-base text-ink">How I work</h3>
						<p class="mt-1 text-xs leading-relaxed text-faint">
							The habits the three flagship repos have in common.
						</p>
						<ul class="mt-4 space-y-2.5 text-xs leading-relaxed text-muted">
							<li class="flex gap-2">
								<span class="mono mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-accent"></span>
								<span>Measure first, then optimise the thing the measurement points at.</span>
							</li>
							<li class="flex gap-2">
								<span class="mono mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-accent"></span>
								<span
									>Validate against a reference implementation, not against intuition — golden
									logits, parity tests, diffed kernels.</span
								>
							</li>
							<li class="flex gap-2">
								<span class="mono mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-accent"></span>
								<span>Prefer no dependency over a dependency that does 20% of the job.</span>
							</li>
							<li class="flex gap-2">
								<span class="mono mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-accent"></span>
								<span
									>Publish the honest number, including when it is DRAM parity and not a win.</span
								>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===================== PRACTICE LOG ===================== -->
	{#if lc || data.practice.codewars || data.practice.cssbattle}
		<section id="practice" class="section">
			<div class="shell">
				<header class="max-w-2xl">
					<p class="eyebrow">04 — Practice log</p>
					<h2 class="mt-3 text-2xl sm:text-3xl">Consistency, not a scoreboard</h2>
					<p class="mt-3 text-sm leading-relaxed text-muted">
						Algorithmic practice is a habit, not an achievement, so it lives down here instead of in
						the hero. It is also the reason this page has a data layer at all: these three tiles are
						read from public APIs when the site builds, and any of them may be missing.
					</p>
				</header>

				<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
					{#if lc}
						<div class="panel p-5">
							<div class="flex items-baseline justify-between">
								<h3 class="mono text-xs uppercase tracking-wider text-faint">LeetCode</h3>
								<a
									class="mono text-[0.65rem] text-muted link-underline"
									href="https://leetcode.com/u/{identity.handle}/"
									rel="noopener noreferrer"
									target="_blank">profile ↗</a
								>
							</div>
							<p class="mt-3 text-3xl font-semibold text-ink">{lc.solved}</p>
							<p class="mono text-[0.68rem] text-faint">problems solved</p>
							<div class="mono mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem]">
								<span class="text-accent">easy {lc.easy}</span>
								<span class="text-warn">medium {lc.medium}</span>
								<span class="text-ink">hard {lc.hard}</span>
							</div>
						</div>
					{/if}

					{#if data.practice.codewars}
						<div class="panel p-5">
							<div class="flex items-baseline justify-between">
								<h3 class="mono text-xs uppercase tracking-wider text-faint">Codewars</h3>
								<a
									class="mono text-[0.65rem] text-muted link-underline"
									href="https://www.codewars.com/users/{identity.handle}"
									rel="noopener noreferrer"
									target="_blank">profile ↗</a
								>
							</div>
							<p class="mt-3 text-3xl font-semibold text-ink">
								{data.practice.codewars.totalCompleted}
							</p>
							<p class="mono text-[0.68rem] text-faint">kata completed</p>
							<!-- Same principle as LeetCode: the comparative field (the kyu rank) is
							     deliberately omitted. See PLAN.md L1 and L2. -->
							<div class="mono mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-muted">
								<span>python</span>
								<span>javascript</span>
							</div>
						</div>
					{/if}

					{#if data.practice.cssbattle}
						<div class="panel p-5">
							<div class="flex items-baseline justify-between">
								<h3 class="mono text-xs uppercase tracking-wider text-faint">CSSBattle</h3>
							</div>
							<p class="mt-3 text-3xl font-semibold text-ink">{data.practice.cssbattle.played}</p>
							<p class="mono text-[0.68rem] text-faint">targets attempted</p>
							<div class="mono mt-4 text-[0.68rem] text-muted">
								of {data.practice.cssbattle.totalPlayers.toLocaleString('en-US')} players
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<!-- ===================== BACKGROUND ===================== -->
	<section id="background" class="section">
		<div class="shell grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
			<div>
				<p class="eyebrow">05 — Education</p>
				<ul class="mt-5 space-y-4">
					{#each data.background.education as e}
						<li class="border-l-2 border-line pl-4">
							<p class="text-sm font-medium text-ink">{e.institution}</p>
							<p class="mono text-[0.68rem] text-faint">{e.detail}</p>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<p class="eyebrow">Open source &amp; collaboration</p>
				<ul class="mt-5 space-y-4">
					{#each data.background.contributions as c}
						<li class="border-l-2 border-line pl-4">
							<p class="text-sm font-medium text-ink">
								{#if c.href}
									<a class="link-underline" href={c.href} rel="noopener noreferrer" target="_blank"
										>{c.what} ↗</a
									>
								{:else}
									{c.what}
								{/if}
							</p>
							<p class="mono text-[0.68rem] text-faint">{c.role}</p>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- ===================== CONTACT ===================== -->
	<section id="contact" class="section">
		<div class="shell">
			<div class="panel p-6 sm:p-10">
				<p class="eyebrow">06 — Contact</p>
				<h2 class="mt-3 max-w-2xl text-2xl sm:text-3xl">
					Hiring for systems, GPU, or AI-infrastructure work? I'd like to talk.
				</h2>
				<p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
					I work remotely from {identity.location} ({identity.timezone}), which covers European
					mornings and much of the US evening. If your problem involves inference performance, GPU
					kernels, or infrastructure that has to do more with the hardware it already has, that is
					the conversation I want to have.
				</p>

				<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each contact as c}
						<a
							class="group flex items-center justify-between gap-4 rounded-lg border border-line bg-bg px-4 py-3 transition-colors hover:border-accent"
							href={c.href}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span>
								<span class="mono block text-[0.65rem] uppercase tracking-wider text-faint"
									>{c.label}</span
								>
								<span class="mono mt-1 block text-sm text-ink group-hover:text-accent"
									>{c.value}</span
								>
							</span>
							<span class="text-faint transition-colors group-hover:text-accent">↗</span>
						</a>
					{/each}
				</div>

				<p class="mono mt-6 text-[0.68rem] leading-relaxed text-faint">
					No email address is published here on purpose — GitHub issues and WhatsApp both reach me,
					and neither attracts scrapers as reliably as a mailto link.
				</p>
			</div>
		</div>
	</section>
</main>

<!-- ===================== FOOTER ===================== -->
<footer class="border-t border-line bg-elev">
	<div class="shell py-8">
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<p class="mono text-[0.68rem] leading-relaxed text-faint">
				Static SvelteKit build · no runtime server · data prerendered from the GitHub API at
				<span class="text-muted">{fetchedLabel} UTC</span>
			</p>
			<div class="mono flex items-center gap-4 text-[0.68rem]">
				<a
					class="text-muted link-underline"
					href={identity.github}
					rel="noopener noreferrer"
					target="_blank">source ↗</a
				>
				<a class="text-muted link-underline" href="#top">back to top ↑</a>
			</div>
		</div>
		<p class="mono mt-4 text-[0.65rem] text-faint">
			{stats.ownedRepos} owned repositories · {stats.languages} languages · refreshed by a nightly build
		</p>
	</div>
</footer>
