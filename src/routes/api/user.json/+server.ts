import { identity, contact, background, flagships, skillGroups } from '$lib/content';

export const prerender = true;

/**
 * The curated profile, as static JSON.
 *
 * This used to be a hardcoded blob with empty strings for the seminars and the
 * LinkedIn URL. It now serves only real data: the same curated content module the
 * home page renders, so the API and the page can never disagree.
 */
export async function GET() {
	return new Response(
		JSON.stringify(
			{
				...identity,
				contact,
				education: background.education,
				contributions: background.contributions,
				flagshipRepos: flagships.map((f) => ({
					repo: f.repo,
					title: f.title,
					url: `https://github.com/herlangga72/${f.repo}`,
					liveUrl: f.liveUrl ?? null
				})),
				capabilities: skillGroups.map((g) => ({
					group: g.title,
					skills: g.skills.map((s) => s.name)
				}))
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
