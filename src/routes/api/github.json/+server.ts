import { fetchProfile, fetchRepos, deriveStats, GITHUB_USER } from '$lib/server/github';
import { descriptionOverrides } from '$lib/content';

export const prerender = true;

/**
 * Static snapshot of the GitHub data the home page is built from.
 *
 * Because it is prerendered, this is a CDN-cached JSON file rather than a live API:
 * no rate limit for consumers, no server to keep alive, and it can never disagree
 * with what the page shows, because both come from the same build.
 */
export async function GET() {
	const [profile, repos] = await Promise.all([fetchProfile(), fetchRepos()]);

	const projects = repos
		.filter((r) => !r.fork)
		.map((r) => ({
			name: r.name,
			url: r.html_url,
			description: r.description ?? descriptionOverrides[r.name] ?? null,
			language: r.language,
			stars: r.stargazers_count,
			forks: r.forks_count,
			topics: r.topics,
			license: r.license?.spdx_id ?? null,
			archived: r.archived,
			createdAt: r.created_at,
			pushedAt: r.pushed_at
		}))
		.sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime());

	return new Response(
		JSON.stringify(
			{
				user: GITHUB_USER,
				name: profile.name,
				bio: profile.bio,
				location: profile.location,
				hireable: profile.hireable,
				profileUrl: profile.html_url,
				stats: deriveStats(profile, repos),
				projects
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
