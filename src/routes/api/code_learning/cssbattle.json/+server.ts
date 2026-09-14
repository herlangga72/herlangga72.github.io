import { json } from '@sveltejs/kit';
import { fetchCssBattle } from '$lib/server/codingStats';

export const prerender = true;

// CSSBattle's rank endpoint is keyed by Firebase uid, not by username. This is the
// public uid the site's own client uses, not a secret.
const CSSBATTLE_UID = 'qNR4pK80n9Mpl8jHsYC3ld6gNRH2';

export async function GET() {
	const stats = await fetchCssBattle(CSSBATTLE_UID);
	return json(
		{ available: stats !== null, ...(stats ?? {}) },
		{ headers: { 'Cache-Control': 'public, max-age=3600' } }
	);
}
