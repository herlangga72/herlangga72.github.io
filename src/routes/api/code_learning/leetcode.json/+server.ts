import { json } from '@sveltejs/kit';
import { fetchLeetCode } from '$lib/server/codingStats';
import { GITHUB_USER } from '$lib/server/github';

export const prerender = true;

/**
 * Replaces the previous implementation, which fetched
 * `https://leetcode-stats-api.herokuapp.com/...`. That host has been permanently
 * offline for years (it returns Heroku's application-error page), so this endpoint
 * always failed. It now reads LeetCode's own GraphQL endpoint.
 *
 * Note the deliberate omission: this returns solved counts, not the global ranking.
 * See PLAN.md L2.
 */
export async function GET() {
	const stats = await fetchLeetCode(GITHUB_USER);
	return json(
		{ available: stats !== null, ...(stats ?? {}) },
		{ headers: { 'Cache-Control': 'public, max-age=3600' } }
	);
}
