# herlangga72.github.io

Personal portfolio and project index for **Herlangga Yusuf Syailendra** — systems and
inference engineer.

Live at <https://herlangga72.github.io/>.

## What this is

A prerendered SvelteKit site with **no runtime server**. All content is assembled at
build time and shipped as static files, so it deploys to GitHub Pages, has no cold
starts, and cannot break because a third-party API went down.

The site reads two kinds of data:

| Source                          | Used for                                                           |
| ------------------------------- | ------------------------------------------------------------------ |
| GitHub REST API                 | Repository index, languages, commit counts, availability, location |
| Codewars / LeetCode / CSSBattle | The practice log                                                   |

Those are fetched once per build. A nightly GitHub Actions run rebuilds and redeploys to
refresh them.

## Structure

```
src/
  app.css                     design tokens, base styles, print stylesheet
  lib/
    content.ts                curated narrative (flagships, skills, background)
    components/               FlagshipCard, ProjectIndex
    server/github.ts           build-time GitHub fetch + caching + derived stats
    server/codingStats.ts      CodeWars / LeetCode / CSSBattle, all fault-tolerant
  routes/
    +page.server.ts           assembles everything at build time
    +page.svelte              the page
    api/                      static JSON endpoints (see /api/)
    sitemap.xml               static sitemap
.github/workflows/deploy.yml  build + deploy to Pages, nightly cron
PLAN.md                       the rebuild plan and the rationale for every decision
```

## Design rules

These are enforced in code, not just in documentation:

1. **No invented data.** Every number comes from an API or from `src/lib/content.ts`,
   and that file only restates what is verifiable in a public repository.
2. **Stars are never used as a ranking signal or a headline.** Repos are ordered by
   notability and recency instead.
3. **Weak comparative metrics are omitted.** The page shows LeetCode solved counts
   (65) but not the global ranking; CSSBattle targets attempted but not the rank.
   Same data, and the only honest way to present it.
4. **Optional data degrades quietly.** If a third-party API fails at build time, its
   section is omitted rather than stubbed with `0`. The build never fails because of
   someone else's server. (The previous implementation pointed at a Heroku host that
   is permanently offline.)
5. **No web fonts, no client-side framework beyond Svelte.** Fonts are a system stack.

## Endpoints

All prerendered, all static, all CDN-cached. The index is at `/api/`.

```
/api/user.json                      curated profile
/api/github.json                    repository snapshot
/api/practice.json                  aggregated coding-practice stats
/api/code_learning/codewars.json
/api/code_learning/leetcode.json
/api/code_learning/cssbattle.json
```

The `.json` suffix is load-bearing. GitHub Pages picks `Content-Type` from the file
extension, so an extension-less endpoint is served as `application/octet-stream` and the
browser downloads it instead of displaying it. And because a prerendered endpoint is
written as a _file_, it can never also be a directory: linking to `/api/user/` is a 404.

## Development

```bash
pnpm install
pnpm dev            # http://localhost:5173
pnpm build          # vite build, then scripts/verify-build.mjs
pnpm check          # svelte-check
pnpm lint           # prettier --check . && eslint .
```

`pnpm build` deliberately ends with `scripts/verify-build.mjs` rather than raw
`vite build`. adapter-static can exit **0 while writing no HTML at all** for a route
(a `ReferenceError` during prerender is enough), which would deploy a 404. The verifier
asserts that every expected artifact exists, that the homepage contains the real
content, that no third-party subresource crept in, and that every internal link
resolves. A broken build fails instead of shipping.

To check the result the way GitHub Pages will serve it:

```bash
(cd build && python3 -m http.server 4183 &)
python3 scripts/httpcheck.py          # crawls every local URL over HTTP
```

Set `GITHUB_TOKEN` to raise the GitHub API rate limit from 60/h to 5,000/h. Without it,
responses are cached for an hour under `.cache/`.

## Deployment

Push to `main`. The workflow type-checks, builds, and deploys to GitHub Pages. It also
runs nightly at 03:17 UTC to refresh the prerendered data.

`static/.nojekyll` is required: without it Jekyll would strip the `_app/` directory and
the site would load unstyled.
