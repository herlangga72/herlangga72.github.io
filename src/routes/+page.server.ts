import {
	fetchProfile,
	fetchRepos,
	fetchLanguages,
	fetchCommitCount,
	deriveStats,
	GITHUB_USER,
	type GhRepo
} from '$lib/server/github';
import { fetchLeetCode, fetchCodewars, fetchCssBattle } from '$lib/server/codingStats';
import {
	identity,
	contact,
	flagships,
	descriptionOverrides,
	skillGroups,
	background,
	notableRepos
} from '$lib/content';

export type ProjectRow = {
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
};

const LANGUAGE_COLORS: Record<string, string> = {
	Rust: '#dea584',
	Python: '#3572A5',
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	Svelte: '#ff3e00',
	HTML: '#e34c26',
	CSS: '#563d7c',
	PHP: '#4F5D95',
	Shell: '#89e051',
	Assembly: '#6E4C13',
	'C++': '#f34b7d',
	C: '#555555',
	Java: '#b07219',
	Dockerfile: '#384d54',
	GLSL: '#5686a5',
	Makefile: '#427819'
};

function toRow(r: GhRepo): ProjectRow {
	return {
		name: r.name,
		url: r.html_url,
		description: r.description ?? descriptionOverrides[r.name] ?? null,
		language: r.language,
		stars: r.stargazers_count,
		forks: r.forks_count,
		pushedAt: r.pushed_at,
		createdAt: r.created_at,
		archived: r.archived,
		notable: notableRepos.has(r.name),
		live: r.homepage && r.homepage.startsWith('http') ? r.homepage : null
	};
}

export async function load() {
	const [profile, repos] = await Promise.all([fetchProfile(), fetchRepos()]);

	const owned = repos.filter((r) => !r.fork).map(toRow);
	// Notability first (most readers never touch the controls), then recency.
	owned.sort((a, b) => {
		if (a.notable !== b.notable) return a.notable ? -1 : 1;
		return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
	});

	const languages = Array.from(
		new Set(owned.map((r) => r.language).filter((l): l is string => Boolean(l)))
	).sort();

	const stats = deriveStats(profile, repos);
	const liveDemos = owned.filter((r) => r.live).length;

	// Per-flagship enrichment: real language byte percentages and a real commit count.
	const repoByName = new Map(repos.map((r) => [r.name, r]));
	const enrichedFlagships = await Promise.all(
		flagships.map(async (f) => {
			const [languageBytes, commits] = await Promise.all([
				fetchLanguages(f.repo).catch(() => ({}) as Record<string, number>),
				fetchCommitCount(f.repo)
			]);
			const total = Object.values(languageBytes).reduce((a, b) => a + b, 0) || 1;
			// Sub-1% languages are noise in a chip row, so they are dropped rather
			// than rendered as a misleading "0%".
			const languageMix = Object.entries(languageBytes)
				.sort((a, b) => b[1] - a[1])
				.map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 100) }))
				.filter((l) => l.pct >= 1)
				.slice(0, 4);

			const meta = repoByName.get(f.repo);
			return {
				...f,
				languageMix,
				commits,
				stars: meta?.stargazers_count ?? 0,
				pushedAt: meta?.pushed_at ?? null,
				createdAt: meta?.created_at ?? null
			};
		})
	);

	// All four of these are optional and fail soft (PLAN.md L5).
	const [leetcode, codewars, cssbattle] = await Promise.all([
		fetchLeetCode(GITHUB_USER),
		fetchCodewars(GITHUB_USER),
		fetchCssBattle('qNR4pK80n9Mpl8jHsYC3ld6gNRH2')
	]);

	const evidenceBase = `https://github.com/${GITHUB_USER}/`;
	const skills = skillGroups.map((g) => ({
		...g,
		skills: g.skills.map((s) => ({ ...s, href: `${evidenceBase}${s.evidence}` }))
	}));

	return {
		identity,
		contact,
		stats: {
			...stats,
			liveDemos,
			year: new Date().getUTCFullYear()
		},
		flagships: enrichedFlagships,
		projects: owned,
		languages,
		languageColors: LANGUAGE_COLORS,
		skillGroups: skills,
		background,
		practice: { leetcode, codewars, cssbattle },
		fetchedAt: new Date().toISOString()
	};
}
