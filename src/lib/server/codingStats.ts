/**
 * Build-time competitive-programming stats.
 *
 * Design rule (see PLAN.md L5): every one of these is optional. If a source is slow,
 * dead, rate-limited, or changes shape, it resolves to `null` and the page simply does
 * not render that tile. The build never fails because of a third party.
 *
 * This already matters: the previous implementation pointed at
 * `leetcode-stats-api.herokuapp.com`, which is permanently offline (HTTP 503).
 */

export type LeetCodeStats = {
	solved: number;
	easy: number;
	medium: number;
	hard: number;
};

export type CodewarsStats = {
	honor: number;
	overallRank: string;
	totalCompleted: number;
};

export type CssBattleStats = {
	played: number;
	totalPlayers: number;
};

const TIMEOUT_MS = 8000;

async function timedFetch(url: string, init?: RequestInit) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		return await fetch(url, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

const LEETCODE_QUERY = `query userStats($username: String!) {
	matchedUser(username: $username) {
		submitStats { acSubmissionNum { difficulty count } }
	}
}`;

export async function fetchLeetCode(username: string): Promise<LeetCodeStats | null> {
	try {
		const res = await timedFetch('https://leetcode.com/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'User-Agent': 'portfolio-build' },
			body: JSON.stringify({ query: LEETCODE_QUERY, variables: { username } })
		});
		if (!res.ok) return null;
		const json = await res.json();
		const rows = json?.data?.matchedUser?.submitStats?.acSubmissionNum;
		if (!Array.isArray(rows)) return null;
		const pick = (d: string) =>
			rows.find((r: { difficulty: string }) => r.difficulty === d)?.count ?? 0;
		const solved = pick('All');
		if (!solved) return null;
		// Note: we deliberately do NOT surface the global ranking -- see PLAN.md L2.
		return { solved, easy: pick('Easy'), medium: pick('Medium'), hard: pick('Hard') };
	} catch {
		return null;
	}
}

export async function fetchCodewars(username: string): Promise<CodewarsStats | null> {
	try {
		const res = await timedFetch(`https://www.codewars.com/api/v1/users/${username}`);
		if (!res.ok) return null;
		const json = await res.json();
		const completed = json?.codeChallenges?.totalCompleted;
		if (typeof completed !== 'number') return null;
		return {
			honor: json?.honor ?? 0,
			overallRank: json?.ranks?.overall?.name ?? 'unranked',
			totalCompleted: completed
		};
	} catch {
		return null;
	}
}

/**
 * CSSBattle's rank endpoint is an undocumented Cloud Function that takes a Firebase uid
 * (not a username). Both the token and the uid are the public, hardcoded values the
 * site's own client uses; there is no secret here.
 */
export async function fetchCssBattle(userId: string): Promise<CssBattleStats | null> {
	try {
		const res = await timedFetch(
			`https://us-central1-cssbattleapp.cloudfunctions.net/getRank?token=&userId=${userId}`
		);
		if (!res.ok) return null;
		const json = await res.json();
		if (typeof json?.playedCount !== 'number') return null;
		return { played: json.playedCount, totalPlayers: json.totalPlayers ?? 0 };
	} catch {
		return null;
	}
}
