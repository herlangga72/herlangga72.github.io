import { json } from '@sveltejs/kit';
import { fetchCodewars } from '$lib/server/codingStats';
import { GITHUB_USER } from '$lib/server/github';

export const prerender = true;

export async function GET() {
	const stats = await fetchCodewars(GITHUB_USER);
	// Always 200 and always shaped the same way: a consumer should not have to
	// distinguish "no data" from "the build could not reach the API".
	return json(
		{ available: stats !== null, ...(stats ?? {}) },
		{ headers: { 'Cache-Control': 'public, max-age=3600' } }
	);
}
