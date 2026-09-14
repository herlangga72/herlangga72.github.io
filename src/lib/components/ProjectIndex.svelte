<script lang="ts">
	import { onMount } from 'svelte';

	export let projects: {
		name: string;
		url: string;
		description: string | null;
		language: string | null;
		stars: number;
		forks: number;
		pushedAt: string;
		createdAt: string;
		archived: boolean;
		notable: boolean;
		live: string | null;
	}[];
	export let languages: string[];
	export let languageColors: Record<string, string>;
	export let totalOwned: number;
	export let forkedCount: number;

	let query = '';
	let activeLang: string | null = null;
	let showAll = false;
	let input: HTMLInputElement | null = null;

	// "/" focuses search, the way an engineer expects. Progressive enhancement only.
	onMount(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === '/' && document.activeElement !== input) {
				const tag = (e.target as HTMLElement)?.tagName;
				if (tag === 'INPUT' || tag === 'TEXTAREA') return;
				e.preventDefault();
				input?.focus();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$: q = query.trim().toLowerCase();
	$: filtered = projects.filter((p) => {
		if (activeLang && p.language !== activeLang) return false;
		if (!q) return true;
		return (
			p.name.toLowerCase().includes(q) ||
			(p.description ?? '').toLowerCase().includes(q) ||
			(p.language ?? '').toLowerCase().includes(q)
		);
	});
	// The long tail is collapsed by default so the section never becomes a wall (P4).
	$: visible = showAll ? filtered : filtered.slice(0, 10);
	$: hidden = filtered.length - visible.length;

	function shortDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-GB', {
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}

	function langColor(l: string | null) {
		return l ? (languageColors[l] ?? 'var(--faint)') : 'var(--faint)';
	}

	function toggleLang(l: string) {
		activeLang = activeLang === l ? null : l;
		showAll = false;
	}
</script>

<div class="no-print mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<label class="relative block sm:max-w-xs sm:flex-1">
		<span class="sr-only">Filter repositories by name</span>
		<input
			bind:this={input}
			bind:value={query}
			type="search"
			placeholder="Filter by name, language, description…"
			class="mono w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink placeholder:text-faint focus:border-accent focus:outline-none"
		/>
		<span
			class="mono pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 text-[0.65rem] text-faint sm:block"
		>
			/
		</span>
	</label>

	<p class="mono text-xs text-faint">
		{filtered.length} of {totalOwned} owned repos
		<span class="text-line-strong"> · </span>
		{forkedCount} forks excluded
	</p>
</div>

<div class="no-print mt-4 flex flex-wrap gap-2">
	<button
		type="button"
		class="chip transition-colors {activeLang === null ? 'chip-live' : ''}"
		on:click={() => {
			activeLang = null;
			showAll = false;
		}}>all</button
	>
	{#each languages as l}
		<button
			type="button"
			class="chip transition-colors {activeLang === l ? 'chip-live' : ''}"
			on:click={() => toggleLang(l)}
		>
			<span class="h-1.5 w-1.5 rounded-full" style="background:{langColor(l)}"></span>
			{l}
		</button>
	{/each}
</div>

<ul class="mt-6 divide-y divide-[var(--border)] border-y border-line">
	{#each visible as p}
		<li class="group py-4">
			<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
				<span
					class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
					style="background:{langColor(p.language)}"
					title={p.language ?? 'unknown language'}
				></span>
				<a
					href={p.url}
					rel="noopener noreferrer"
					target="_blank"
					class="mono break-words text-sm font-medium text-ink transition-colors group-hover:text-accent"
				>
					{p.name}
				</a>
				{#if p.notable}
					<span class="mono text-[0.6rem] uppercase tracking-wider text-accent">notable</span>
				{/if}
				{#if p.live}
					<a
						href={p.live}
						rel="noopener noreferrer"
						target="_blank"
						class="mono text-[0.65rem] text-accent link-underline">live ↗</a
					>
				{/if}
				{#if p.archived}
					<span class="mono text-[0.6rem] uppercase tracking-wider text-faint">archived</span>
				{/if}
			</div>

			{#if p.description}
				<p class="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{p.description}</p>
			{/if}

			<div
				class="mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-faint"
			>
				{#if p.language}<span>{p.language}</span>{/if}
				<span>updated {shortDate(p.pushedAt)}</span>
				{#if p.stars > 0}<span>★ {p.stars}</span>{/if}
				{#if p.forks > 0}<span>⑂ {p.forks}</span>{/if}
			</div>
		</li>
	{/each}
	{#if visible.length === 0}
		<li class="py-8 text-center text-sm text-faint">No repositories match that filter.</li>
	{/if}
</ul>

{#if hidden > 0 || (showAll && filtered.length > 10)}
	<button type="button" class="no-print btn mt-5" on:click={() => (showAll = !showAll)}>
		{showAll ? 'Collapse list' : `Show all ${filtered.length} repositories`}
		{#if !showAll}<span class="mono text-xs text-faint">+{hidden}</span>{/if}
	</button>
{/if}
