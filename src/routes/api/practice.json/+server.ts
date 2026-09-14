import { fetchCodewars, fetchLeetCode, fetchCssBattle } from '$lib/server/codingStats';
import { GITHUB_USER } from '$lib/server/github';

export const prerender = true;

/**
 * Aggregated practice stats, as static JSON, at /api/practice.json.
 *
 * (It lives here rather than at /api/code_learning because a prerendered endpoint
 * is written as a bare file, and a file cannot also be the parent directory of
 * /api/code_learning/codewars.)
 *
 * Every source is optional: a dead, rate-limited, or changed upstream endpoint
 * resolves to `null` rather than failing the build or emitting a stub. (The
 * previous implementation pointed at a Heroku app that is permanently offline.)
 */
export async function GET() {
	const [codewars, leetcode, cssbattle] = await Promise.all([
		fetchCodewars(GITHUB_USER),
		fetchLeetCode(GITHUB_USER),
		fetchCssBattle('qNR4pK80n9Mpl8jHsYC3ld6gNRH2')
	]);

	return new Response(
		JSON.stringify(
			{
				user: GITHUB_USER,
				note: 'Null means the upstream source was unavailable at build time. Nothing is stubbed with zero.',
				sources: {
					codewars: 'https://www.codewars.com/api/v1/users/herlangga72',
					leetcode: 'https://leetcode.com/graphql',
					cssbattle:
						'https://us-central1-cssbattleapp.cloudfunctions.net/getRank?userId=<firebase-uid>'
				},
				codewars,
				leetcode,
				cssbattle
			},
			null,
			2
		),
		{
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		}
	);
}
