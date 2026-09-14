/**
 * Build-time GitHub data.
 *
 * Every number that appears on the page comes through here. Nothing is fabricated:
 * if the API does not return it, it is not rendered.
 *
 * The build runs on GitHub Actions with GITHUB_TOKEN set (5,000 req/h). Locally the
 * anonymous limit is 60 req/h, so responses are cached on disk for an hour.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const GITHUB_USER = 'herlangga72';
const API = 'https://api.github.com';
const CACHE_DIR = '.cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const headers: Record<string, string> = {
	Accept: 'application/vnd.github+json',
	'User-Agent': `${GITHUB_USER}-portfolio-build`,
	'X-GitHub-Api-Version': '2022-11-28'
};
if (process.env.GITHUB_TOKEN) {
	headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

/** Fetch JSON with a disk cache so repeated local builds do not burn the anonymous rate limit. */
async function cachedJson<T>(cacheKey: string, url: string): Promise<T> {
	const cachePath = join(CACHE_DIR, `${cacheKey}.json`);
	let cached: { at: number; body: T } | null = null;
	try {
		cached = JSON.parse(await readFile(cachePath, 'utf8'));
	} catch {
		cached = null;
	}
	const fresh = cached && Date.now() - cached.at < CACHE_TTL_MS;
	if (fresh && cached) return cached.body;

	try {
		const res = await fetch(url, { headers });
		if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
		const body = (await res.json()) as T;
		await mkdir(CACHE_DIR, { recursive: true });
		await writeFile(cachePath, JSON.stringify({ at: Date.now(), body }));
		return body;
	} catch (err) {
		// Stale cache beats a failed build.
		if (cached) {
			console.warn(`[github] using stale cache for ${cacheKey}: ${(err as Error).message}`);
			return cached.body;
		}
		throw err;
	}
}

export type GhProfile = {
	login: string;
	name: string;
	bio: string | null;
	company: string | null;
	blog: string | null;
	location: string | null;
	hireable: boolean | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	avatar_url: string;
	html_url: string;
};

export type GhRepo = {
	name: string;
	html_url: string;
	description: string | null;
	homepage: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	topics: string[];
	archived: boolean;
	disabled: boolean;
	fork: boolean;
	size: number;
	created_at: string;
	pushed_at: string;
	updated_at: string;
	license: { spdx_id: string | null } | null;
	default_branch: string;
};

export async function fetchProfile(): Promise<GhProfile> {
	return cachedJson<GhProfile>(`profile-${GITHUB_USER}`, `${API}/users/${GITHUB_USER}`);
}

/** All repos owned by the user, plus the fork list (forks are counted, never listed). */
export async function fetchRepos(): Promise<GhRepo[]> {
	const repos = await cachedJson<GhRepo[]>(
		`repos-${GITHUB_USER}`,
		`${API}/users/${GITHUB_USER}/repos?per_page=100&sort=pushed&type=owner`
	);
	return repos.filter((r) => !r.disabled);
}

/** Byte-level language breakdown for one repo. Used for the flagship stack chips. */
export async function fetchLanguages(repo: string): Promise<Record<string, number>> {
	return cachedJson<Record<string, number>>(
		`langs-${repo}`,
		`${API}/repos/${GITHUB_USER}/${repo}/languages`
	);
}

/** Approximate commit count, read from the paginated Link header. */
export async function fetchCommitCount(repo: string): Promise<number | null> {
	const cacheKey = `commits-${repo}`;
	try {
		const cached = JSON.parse(await readFile(join(CACHE_DIR, `${cacheKey}.json`), 'utf8'));
		if (Date.now() - cached.at < CACHE_TTL_MS) return cached.body as number;
	} catch {
		/* no cache */
	}
	try {
		const res = await fetch(`${API}/repos/${GITHUB_USER}/${repo}/commits?per_page=1`, { headers });
		if (!res.ok) return null;
		const link = res.headers.get('link');
		const match = link?.match(/[?&]page=(\d+)>; rel="last"/);
		const count = match ? Number(match[1]) : 1;
		await mkdir(CACHE_DIR, { recursive: true });
		await writeFile(
			join(CACHE_DIR, `${cacheKey}.json`),
			JSON.stringify({ at: Date.now(), body: count })
		);
		return count;
	} catch {
		return null;
	}
}

/**
 * Turn the raw API response into the numbers the page shows.
 *
 * Deliberately avoids stars as a ranking signal: the profile's top repo has 2 stars,
 * so any ordering or headline built on popularity would misrepresent the work.
 */
export function deriveStats(profile: GhProfile, repos: GhRepo[]) {
	const owned = repos.filter((r) => !r.fork);
	const languages = new Set(owned.map((r) => r.language).filter(Boolean));
	const years = Math.max(
		1,
		Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (365.25 * 24 * 3600 * 1000))
	);
	return {
		ownedRepos: owned.length,
		forkedRepos: repos.filter((r) => r.fork).length,
		languages: languages.size,
		rustRepos: owned.filter((r) => r.language === 'Rust').length,
		firstCommitYear: new Date(profile.created_at).getUTCFullYear(),
		yearsOnGitHub: years
	};
}
