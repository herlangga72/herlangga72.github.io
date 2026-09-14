<script lang="ts">
	export let flagship: {
		id: string;
		repo: string;
		liveUrl?: string;
		title: string;
		tagline: string;
		whyHard: string;
		metrics: { value: string; label: string }[];
		detail: string[];
		blueprint?: { caption: string; text: string };
		languageMix: { name: string; pct: number }[];
		commits: number | null;
		stars: number;
		pushedAt: string | null;
		createdAt: string | null;
	};

	const repoUrl = `https://github.com/herlangga72/${flagship.repo}`;

	/**
	 * Minimal inline formatter: `**bold**` and `` `code` `` only.
	 *
	 * This deliberately replaces `{@html}`. The detail strings are authored by hand,
	 * but there is no reason for a page like this to have an HTML injection surface
	 * (and `svelte/no-at-html-tags` is right to complain).
	 */
	type Segment = { type: 'text' | 'strong' | 'code'; value: string };

	function segments(input: string): Segment[] {
		const out: Segment[] = [];
		const pattern = /\*\*(.+?)\*\*|`(.+?)`/g;
		let last = 0;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(input))) {
			if (match.index > last) out.push({ type: 'text', value: input.slice(last, match.index) });
			if (match[1] !== undefined) out.push({ type: 'strong', value: match[1] });
			else out.push({ type: 'code', value: match[2] });
			last = match.index + match[0].length;
		}
		if (last < input.length) out.push({ type: 'text', value: input.slice(last) });
		return out;
	}

	function shortDate(iso: string | null) {
		if (!iso) return null;
		return new Date(iso).toLocaleDateString('en-GB', {
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}
</script>

<details class="panel group overflow-hidden">
	<summary
		class="cursor-pointer list-none p-5 sm:p-6 transition-colors hover:bg-[var(--surface-2)] [&::-webkit-details-marker]:hidden"
	>
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="min-w-0 flex-1">
				<div class="eyebrow mb-2">
					{flagship.repo}
				</div>
				<h3 class="text-xl sm:text-2xl text-ink">{flagship.title}</h3>
				<p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{flagship.tagline}</p>
			</div>

			<div
				class="no-print mono flex shrink-0 items-center gap-2 pt-1 text-xs text-faint transition-colors group-open:text-accent"
			>
				<span class="group-open:hidden">expand</span>
				<span class="hidden group-open:inline">collapse</span>
				<svg
					class="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					aria-hidden="true"
				>
					<path d="M4 6.5 8 10.5l4-4" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
		</div>

		<!-- Measured numbers, not adjectives (PLAN.md F5). -->
		<div class="mt-5 flex flex-wrap gap-2">
			{#each flagship.metrics as m}
				<span class="chip chip-live">
					<span class="font-semibold text-ink">{m.value}</span>
					<span class="text-faint">{m.label}</span>
				</span>
			{/each}
		</div>

		<div class="mt-4 flex flex-wrap items-center gap-2">
			{#each flagship.languageMix as l}
				<span class="chip">{l.name} <span class="text-faint">{l.pct}%</span></span>
			{/each}
			{#if flagship.commits}<span class="chip">{flagship.commits} commits</span>{/if}
			{#if shortDate(flagship.pushedAt)}
				<span class="chip">updated {shortDate(flagship.pushedAt)}</span>
			{/if}
		</div>
	</summary>

	<div class="border-t border-line px-5 pb-6 pt-5 sm:px-6">
		<!-- The sentence that translates the achievement for a non-specialist (F3). -->
		<div class="border-l-2 border-accent pl-4">
			<div class="eyebrow mb-1">Why it's hard</div>
			<p class="max-w-3xl text-sm leading-relaxed text-ink">{flagship.whyHard}</p>
		</div>

		<!-- On paper this collapses to title + why-it-is-hard + measured numbers, so
		     "Save as PDF" produces a 2-3 page résumé rather than an 8 page dump. -->
		<ul class="no-print mt-6 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
			{#each flagship.detail as d}
				<li class="flex gap-3">
					<span class="mono mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-accent"></span>
					<span>
						{#each segments(d) as seg}
							{#if seg.type === 'strong'}<strong class="font-medium text-ink">{seg.value}</strong
								>{:else if seg.type === 'code'}<code>{seg.value}</code>{:else}{seg.value}{/if}
						{/each}
					</span>
				</li>
			{/each}
		</ul>

		{#if flagship.blueprint}
			<figure class="no-print mt-6">
				<figcaption class="eyebrow mb-2">{flagship.blueprint.caption}</figcaption>
				<pre
					class="overflow-x-auto rounded-lg border border-line bg-bg p-4 text-[0.72rem] leading-relaxed text-muted">{flagship
						.blueprint.text}</pre>
			</figure>
		{/if}

		<!-- The buttons are pointless on paper; the URLs they carry are not, so the
		     print version states them as text instead. -->
		<p class="print-only mt-3 text-[10px] text-muted">
			Case study, benchmarks, architecture: github.com/herlangga72/{flagship.repo}{flagship.liveUrl
				? ` · live demo: ${flagship.liveUrl.replace('https://', '').replace(/\/$/, '')}`
				: ''}
		</p>

		<div class="no-print mt-6 flex flex-wrap gap-3">
			<a class="btn" href={repoUrl} rel="noopener noreferrer" target="_blank">
				Read the source
				<span class="text-faint">↗</span>
			</a>
			{#if flagship.liveUrl}
				<a
					class="btn btn-primary"
					href={flagship.liveUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					Try the live demo
					<span>↗</span>
				</a>
			{/if}
		</div>
	</div>
</details>
