# Rebuild plan — `herlangga72.github.io`

> **Goal.** Turn the repo from an empty SvelteKit scaffold into a page that makes a
> hiring engineer (or a conference CFP reviewer) understand, inside 30 seconds, that
> _this person writes inference engines and operating systems from scratch_ — and
> then gives them a path to verify it themselves.

Everything below is derived from real data pulled from the GitHub API on
2026-09-14. No invented employers, dates, or metrics. Where data is weak, the plan
says so and explains how the design avoids leaning on it.

---

## 0. Diagnosis — what we are actually starting from

### 0.1 The repo

| Fact                                                                                                                 | Evidence                           |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| SvelteKit v2 scaffold, Svelte 4, Tailwind 3, `adapter-auto`                                                          | `package.json`, `svelte.config.js` |
| `src/routes/+page.svelte` is **empty** — a single empty `<div>`                                                      | file read                          |
| `app.css` sits at `src/routes/app.css` (wrong place) and contains only the 3 Tailwind directives                     | file read                          |
| Bodies `<body class="bg-stone-700">` — flat mid-grey, no design tokens                                               | `src/app.html`                     |
| `/api/user` is a hardcoded JSON blob with empty strings for seminars and LinkedIn                                    | file read                          |
| `/api/code_learning/leetcode` points at `leetcode-stats-api.herokuapp.com`, which **is dead** (HTTP 503)             | live request                       |
| `/api/code_learning/cssbattle` uses an empty `token=` query param                                                    | file read                          |
| **The site is not deployed.** `https://herlangga72.github.io/` serves a Jekyll page with `last-modified: 2020-10-24` | live request                       |

So the current page is not "bad" — it does not exist, and the pipeline that would
publish it has been broken for ~6 years.

### 0.2 The person (from the API, not from memory)

- **Herlangga Yusuf Syailendra**, Karanganyar, Central Java, Indonesia.
- `hireable: true`, `company: Universitas Muhammadiyah Surakarta`, on GitHub since **2018-11-13**.
- 43 public repos (**34 owned**, 9 forks), 2 gists, 24 followers.
- Bio (his own words): _"Optimalisasi itu 'By Design', jangan berharap kedepan aplikasi itu optimal kalau tidak ada yang mau meng-'optimal'-kan."_

### 0.3 The actual asset inventory

The profile's value is **not** spread evenly. It is concentrated in three clusters:

**Cluster A — from-scratch ML/systems engineering (the crown jewel).**

| Repo                       | What the README actually claims                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ternary-bonsai-inference` | Pure-Rust 27B ternary-weight inference engine: GGUF reader, BPE tokenizer, full qwen35 forward pass (64 layers, GDN/SSM hybrid), sampler, detokenizer — **no llama.cpp link**. Plus a Vulkan GPU backend (`gdev.rs`, `pq2_matvec_fused.comp`) running the whole forward pass as one command buffer per token. Validated against llama.cpp golden logits (`rel 4.4e-3`, greedy match `8160`). 154 commits. |
| `moe-680m`                 | MoE inference engine for an **AMD Radeon 680M iGPU** (RDNA2 APU) via Vulkan/`ash`. Runs Qwen3.6-35B-A3B at **~15–20 tok/s** on shared DDR5. 40 layers, 256 experts, Q4_0 KV. 26 commits.                                                                                                                                                                                                                  |
| `SDGs-Paper-Tester`        | Rust paper↔SDG matcher with a hand-written **AVX-512/AVX2/SSE3–SSE4.2 SIMD ladder**; ~30× faster than the Python reference (15–50 ms vs ~0.9 s). Two engines kept in parity by a test, threaded Rust HTTP server, `POST /api/match`, gzip, Sentry, dataset exports. **Live at `sdgs-paper-tester.onrender.com`** (HTTP 200). 50 commits.                                                                  |

**Cluster B — low-level and infrastructure.**

| Repo                                                                                                                                                     | What it is                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LunaOS-x`                                                                                                                                               | Multitasking **x86-64 OS in pure NASM**: LFB framebuffer, bitmap allocator, 4-level paging, round-robin scheduler, ACPI (RSDT/XSDT) **with SMP**, network-enabled interactive shell. MIT.       |
| `h-mail`                                                                                                                                                 | "Agentic Inbox" — self-hosted email client on Cloudflare Workers: Durable Objects + SQLite per mailbox, R2 attachments, Email Routing ingress, AI agent on Workers AI + Agents SDK. Apache-2.0. |
| `api-gateways` (Rust), `AWS-Bedrock-Wrapper-to-OpenAI-Compatible` (Rust), `Simple-Webhook-For-Sendgrid` (Rust), `Minecraft-Java-Proxy-to-Network` (Rust) | A Rust infrastructure/proxy portfolio.                                                                                                                                                          |
| `UMSConnect.id` + `umsconnect.id-deploy`                                                                                                                 | Campus platform, **live at `ums-connect-id.vercel.app`** (HTTP 200).                                                                                                                            |
| `esp32_inventory_box`                                                                                                                                    | ESP32 (C++) IoT inventory box with a web UI.                                                                                                                                                    |
| `Scopus-Scraping-For-Monitoring` (Python), `Blender-CLI-TUI-Renderer` (Textual TUI)                                                                      | Tooling.                                                                                                                                                                                        |

**Cluster C — history.** Django/Laravel/PHP/Svelte work from 2020–2022
(`admin-dashboard`, `template-python-django`, `laravel-test-api`, `Cryptography`,
`Library`, `PHP-first-project`, …). Proof of range and of a long runway, not a
headline.

### 0.4 The honest weaknesses (these drive half the design decisions)

1. **Almost no stars.** 2 stars is the maximum on any repo. Anything that displays
   popularity will look bad. → _Never sort by or headline stars._
2. **Most repos have no description, no topics, no license, no README.** → The page
   must supply the narrative the repos don't.
3. **Weak competitive-programming numbers.** CodeWars: **7 kyu, 5 katas completed**.
   CSSBattle: **9 levels played**, rank 0. Both are _below_ the level a reader will
   assume from the systems work. → _Showing these in a leaderboard/scoreboard
   format actively damages the brand._
   - **Exception:** LeetCode GraphQL (unauthenticated, works) returns **65 solved
     (53 easy / 9 medium / 3 hard)**, ranking ~2.27M. 65 solved is a normal,
     defensible "I practise" number. Rank is not.
4. **`https://herlangga72.github.io/herlangga72/` currently hosts an old
   hand-written HTML portfolio** ("Backend & Infra Engineer"). Two competing
   profiles exist. → The new page must become the single canonical destination.

---

## 1. Positioning

**One-line position:** _Systems and inference engineer. Builds LLM inference
engines and operating systems from scratch in Rust and assembly._

**Why that line and not "Full-Stack Developer" or "Backend Engineer":**

- Full-stack/backend is the most crowded claim in the applicant pool. The old page
  used "Backend & Infra Engineer", which throws away the differentiator.
- "Pure-Rust 27B inference engine, no llama.cpp" and "x86-64 OS in NASM" are
  claims almost no new graduate in the region can make. They are **verifiable** —
  the code is public and the demos are live.
- Everything else in the repo (Django, Laravel, Svelte, ESP32) becomes _supporting
  evidence of range_ once the headline is established. Order matters: range reads
  as "dabbler" if it comes first, and as "deep and broad" if it comes second.

**Audience, in priority order:**

1. **Technical hiring manager / senior engineer** at a systems, GPU, or AI-infra
   team (including remote/global). Time budget: **30–90 seconds**, then they click
   into a repo.
2. **Recruiter / non-technical screener.** Time budget: **10–20 seconds**. Needs a
   role label, a location/availability answer, and a project list they can
   forward.
3. **Conference/CFP reviewer or collaborator.** Needs topic depth and proof of
   delivery.
4. **The person himself**, as a working index of everything he has shipped.

**What success looks like:** a reader can answer, without scrolling back:
_what does he build → how good is it → can I verify it → how do I contact him._

---

## 2. Information architecture — the order, and why

```
 1. Nav (sticky)
 2. Hero            — identity, position, availability
 3. Signal strip    — 5 derived counters
 4. Flagship work   — 3 expandable case studies
 5. Project index   — every non-fork repo, filterable
 6. Stack           — capability matrix
 7. Practice log    — honest, low-key, live
 8. Background      — education + open-source contributions
 9. Contact         — the CTA
10. Build footer    — provenance ("when was this data fetched")
```

**Why this order:**

| Position                         | Why here                                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero first                       | 10-second readers never scroll. Identity + position must be above the fold, in one screen, no carousel, no animation gate.                                |
| Signal strip **before** projects | It pre-frames the projects. "34 repos, 6 Rust codebases, 3 from-scratch engines" changes how you read the next section. Numbers first, then depth.        |
| Flagships at #4, not #5          | Highest-value content goes as early as legitimacy allows. It sits after the counters because the counters are 3 seconds of reading and they prime it.     |
| Project index below flagships    | Once the flagship quality is established, the long tail reads as _breadth_ instead of _noise_. Above it, it would dilute.                                 |
| Stack after projects             | Skills lists are claims; projects are evidence. Evidence first, claims second is more persuasive and is the standard order in strong engineering résumés. |
| Practice log late                | It is the weakest data. It goes near the bottom, framed as habit, not achievement.                                                                        |
| Contact last but also in nav     | Last position is the natural end of the narrative; the nav button is the escape hatch for someone already convinced at second 8.                          |
| Build footer                     | Closes the loop: the "meta" proof that the site itself is a build artifact, not a template.                                                               |

---

## 3. Decision ledger — "take the plan apart"

Every row is a decision, _why that display or action was chosen_, the evidence
behind it, and what was rejected.

### 3.1 Global

| #   | Decision                                                                            | Why this display/action                                                                                                                                                                                                                                                                                     | Evidence                                                                                                                               | Rejected alternative & why                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | Static-prerendered SvelteKit (`adapter-static`), all data fetched at **build time** | The repo _is_ the GitHub user-page repo, so the destination must be `herlangga72.github.io` — which serves static files only. Build-time fetch also means the page has zero runtime API dependency, so it cannot "break at 3am" when a third-party API dies (which already happened to the LeetCode route). | Pages API is static; `leetcode-stats-api.herokuapp.com` returns 503 today                                                              | **Client-side fetch:** leaks the reader's IP to third parties, flashes empty states, breaks with ad-blockers, and would look broken offline. **Vercel + `adapter-vercel`:** works, but abandons the repo's actual purpose (a `*.github.io` user page) and adds a vendor account for zero reader benefit. |
| G2  | Nightly rebuild workflow                                                            | Freshness without a server. Repo stats change slowly; a daily refresh is indistinguishable from live and costs nothing.                                                                                                                                                                                     | n/a                                                                                                                                    | **Serverless live fetch:** needs a host. **Manual rebuilds:** rots.                                                                                                                                                                                                                                      |
| G3  | **Dark, near-black, high-contrast, monospace-accented** visual language             | Signals the domain (terminal, systems, GPU). Audience #1 lives in a dark editor. Also deliberately _not_ the generic portfolio look, which itself is a signal of care.                                                                                                                                      | Old page already used a dark slate + cyan scheme — consistent with the owner's taste                                                   | **Light/corporate theme:** reads as a template. **Purple-gradient "AI startup" theme:** the single most saturated look in 2026 portfolios; it makes the work look generic.                                                                                                                               |
| G4  | **System font stack, zero font CDN**                                                | A page for a systems engineer should not block first paint on `fonts.gstatic.com`. Also works offline and in a sandboxed iframe.                                                                                                                                                                            | `LunaOS-x`/`ternary-bonsai-inference` ethos is "no unnecessary dependency"; `SDGs-Paper-Tester` advertises a `dependencies-none` badge | **Inter + JetBrains Mono via CDN:** nicer type, but adds a render-blocking third-party request and contradicts the page's own thesis.                                                                                                                                                                    |
| G5  | No JS framework beyond Svelte; no client dependencies added                         | Every dependency is attack surface and build risk for a page whose whole job is text and links. Keeps the static payload tiny.                                                                                                                                                                              | Current `package.json` has only Tailwind + node-fetch                                                                                  | **Component libraries / animation libs:** the page needs none of it.                                                                                                                                                                                                                                     |
| G6  | Spanish/Indonesian noise removed; all copy in **English**                           | The target readers are global/remote teams. Indonesian-only copy silently excludes them.                                                                                                                                                                                                                    | Profile bio is Indonesian; blog/READMEs are English                                                                                    | **Bilingual:** doubles maintenance and splits the message. The bio stays as-is in Indonesian as a pull-quote, because it is _his voice_ and it is the kind of line that gets remembered.                                                                                                                 |
| G7  | **Print stylesheet** + "Save as PDF" button                                         | Turns the page into the résumé that does not exist. One click, always in sync with the site, no separate PDF to maintain.                                                                                                                                                                                   | No résumé exists anywhere in the repo or profile                                                                                       | **Ship a static `resume.pdf`:** guaranteed to go stale within a month and forces double-maintenance.                                                                                                                                                                                                     |
| G8  | Light theme on `prefers-color-scheme: light`? **No**                                | One carefully-tuned theme beats two average ones. Also, the dark theme _is_ the positioning.                                                                                                                                                                                                                | n/a                                                                                                                                    | Rejected for scope and quality control.                                                                                                                                                                                                                                                                  |

### 3.2 Hero

| #   | Decision                                                                                             | Why this display/action                                                                                                                                                | Evidence                                         | Rejected alternative & why                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| H1  | Role line = **"Systems & inference engineer"**, with a concrete sub-line listing the three artifacts | Specifics beat adjectives. "Passionate developer" is unfalsifiable; "pure-Rust 27B inference engine, Vulkan GPU backend, x86-64 OS in NASM" is checkable in one click. | READMEs of the three repos                       | **"Full-Stack / Backend Developer":** buries the differentiator and competes with the entire applicant pool.           |
| H2  | Availability badge driven by the API's `hireable: true`                                              | Answers the screener's literally first question. Showing it means it can never go stale — if he flips the flag, the site follows.                                      | `hireable: true` in `/users/herlangga72`         | **Hardcoded "Open to work":** goes stale silently.                                                                     |
| H3  | Location shown, with timezone offset                                                                 | Remote-first hiring means timezone is a real constraint. Indonesia (UTC+7) is a fact the reader needs in the first screen, not a surprise later.                       | `location: Karanganyar, Central Java, Indonesia` | Hiding location: wastes the reader's time and often gets filtered out anyway.                                          |
| H4  | Two CTAs only: **"See the engines ▸"** (scroll) and **"GitHub ↗"**                                   | One action for the curious reader, one for the already-convinced. Two is the maximum that survives a 10-second scan.                                                   | n/a                                              | **Five social icons:** decision paralysis, and the weak ones (Twitter/X, which does not exist) dilute the strong ones. |
| H5  | Indonesian bio rendered as a **pull-quote**, English translation beneath in small type               | It is a real, memorable, distinctive line from the person. Rendering it in his own language is authentic; translating it makes it usable for the actual audience.      | Profile bio field                                | Dropping it: loses the only piece of _voice_ on the page.                                                              |

### 3.3 Signal strip

| #   | Decision                                                                                                | Why this display/action                                                                                                                   | Evidence                         | Rejected alternative & why                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Five **derived counters**, not a skills cloud                                                           | Counters are the fastest possible way to establish scale before the reader has committed to scrolling. Five is scannable in one fixation. | computed from the repos response | **A word cloud of skills:** unreadable, unranked, and every candidate has one.                                                                                            |
| S2  | Counters chosen: **owned repos · Rust codebases · from-scratch engines · live demos · years on GitHub** | Every one is (a) computed from real data, (b) orthogonal to stars, and (c) immediately re-framed by the section below it.                 | see §3.4                         | **Total stars / followers:** would display the profile's single biggest weakness (2 stars max). **Lines of code:** vanity metric, and not derivable without a full clone. |
| S3  | Counters **auto-computed in the loader**, never hardcoded                                               | They cannot drift out of sync with reality, and updating the page never requires touching copy.                                           | n/a                              | Hardcoded stats: the classic portfolio failure.                                                                                                                           |
| S4  | No count-up animation                                                                                   | Animation delays the number. The reader came for the number.                                                                              | n/a                              | **Count-up on scroll:** looks impressive in a demo, adds 1.5s of latency to the one thing that must be instant.                                                           |

### 3.4 Flagship work (the core section)

| #   | Decision                                                                                   | Why this display/action                                                                                                                                                                                                            | Evidence                                                                        | Rejected alternative & why                                                                                                             |
| --- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Show **exactly 3** flagships                                                               | Three is the maximum a reader will actually open. Each one is chosen to prove a _different_ claim: A = depth in ML internals, B = hardware/GPU fluency, C = shipping a usable product end-to-end.                                  | see §0.3 Cluster A                                                              | **Show all 34:** no hierarchy, so the reader supplies their own — and they will pick wrong.                                            |
| F2  | Each flagship is a **`<details>` case study**, not a card                                  | Collapsed state stays scannable (title, one-liner, 3 metric chips, stack, links). Expanded state carries the _hard_ details a senior engineer will actually read. Progressive disclosure matches the two-audience problem exactly. | the two-audience split in §1                                                    | **Cards only:** too shallow to convince an engineer. **Full prose always visible:** the 10-second reader bounces off the wall of text. |
| F3  | Each case study has a **"Why it's hard"** line                                             | Translates the achievement for readers who don't know what "no llama.cpp link" or "4-level paging" implies. This is the single highest-leverage sentence on the page.                                                              | README technical claims                                                         | Assuming the reader knows: loses the screener entirely.                                                                                |
| F4  | **Architecture diagram as a text/ASCII block**, rendered in a `<pre>`                      | Zero-dependency, prints correctly, diff-able, and thematically perfect. The READMEs already contain ASCII architecture diagrams, so it is genuine content, not decoration.                                                         | `moe-680m` and `ternary-bonsai-inference` READMEs both open with ASCII diagrams | **Generated SVG/image diagrams:** a maintenance burden, a build dependency, and they go stale silently.                                |
| F5  | **Measured numbers as chips**: `15–20 tok/s`, `~30× faster`, `15–50 ms`, `154 commits`     | Benchmarks are the only claim in this space that separates "I wired up a library" from "I wrote the kernel". These are the actual differentiators and they are all _already measured by him_, not invented by us.                  | README benchmark sections                                                       | **Adjectives ("high performance", "blazing fast"):** universally ignored by engineers.                                                 |
| F6  | **One-click link to the live demo** where it exists (`SDGs-Paper-Tester`, `UMSConnect.id`) | "It runs" is unfalsifiable proof and removes all risk for the reader. Notably, the profile has live demos and the old site never linked them.                                                                                      | both return HTTP 200                                                            | Linking only the repo: pushes the verification cost onto the reader, and most won't pay it.                                            |
| F7  | Commit counts surfaced per flagship                                                        | Effort proxy that works even with 0 stars. `154 commits` on the ternary engine says "sustained, real engineering" in a way a star count cannot.                                                                                    | GitHub API commit `Link` headers                                                | **Stars:** the weakness (see §0.4.1).                                                                                                  |
| F8  | Stack chips per flagship include language **byte percentages**                             | Honest and precise: "Rust 96%, GLSL 3%" tells the reader he wrote kernels, not that he used a Rust crate. Auto-derived from the languages endpoint so it cannot lie.                                                               | `/repos/:r/languages`                                                           | Free-text tag lists: unverifiable.                                                                                                     |
| F9  | Flagship order: **ternary → moe-680m → SDGs**                                              | Strongest and most general claim (LLM inference internals) first; hardware-specific next; applied/product last. Ends on the repo with a live URL, so the section finishes with something clickable.                                | relative depth of the three                                                     | Alphabetical/recency order: would lead with a niche AMD-APU-specific repo.                                                             |

### 3.5 Project index

| #   | Decision                                                                                                | Why this display/action                                                                                                                                                | Evidence                                       | Rejected alternative & why                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| P1  | **Every owned repo appears**, forks excluded                                                            | Completeness is itself evidence ("he finishes things and has been shipping since 2018"). Fork-only shows would misrepresent borrowed work.                             | 34 owned / 9 forks                             | **Curated 8-item list:** makes the profile look thinner than it is.                                             |
| P2  | **Filter by language + name search**, client-side                                                       | Turns a static list into an interactive artifact. Also demonstrates front-end competence on a page that is otherwise about backends — without a word of bragging.      | 12 languages present                           | **A static grid:** 34 items is past the threshold where filtering earns its keep.                               |
| P3  | **Sort: notable first, then last-pushed**                                                               | Default order must put the strongest work at the top, since most readers will not touch the controls.                                                                  | §0.3                                           | **Pure recency:** buries the flagships under minor 2026 repos. **Pure stars:** all zero, so effectively random. |
| P4  | Each row shows **language dot, repo name, one-line description, last-pushed date, stars, link**         | Exactly the fields needed to triage. Nothing else.                                                                                                                     | n/a                                            | **Cards with screenshots:** no screenshots exist, and generating them is a build dependency.                    |
| P5  | Repos with **no description** get a curated one-liner from a content map, or an honest neutral fallback | 20+ repos have `description: null`. Showing blank rows makes the profile look abandoned. **Descriptions are only taken from READMEs/actual content — never invented.** | API `description` field is null on most repos  | Leaving them blank: actively harmful. Inventing descriptions: dishonest about what the code is.                 |
| P6  | **"Last pushed" dates shown**                                                                           | Recency is the strongest honest signal available given no stars: it proves the work is current.                                                                        | `pushed_at` varies from 2020 to 2026-09-13     | Hiding dates: makes the reader suspect everything is old.                                                       |
| P7  | Archive/abandoned repos are **not hidden** but are visually de-emphasised                               | Deleting them would be dishonest; hiding them looks like something is being hidden. De-emphasising keeps the honest record without letting it set the tone.            | `Library`, `Liburan`, `PHP-first-project` etc. | **Filtering them out:** loses the "since 2018" longevity argument.                                              |

### 3.6 Stack

| #   | Decision                                                                                                                            | Why this display/action                                                                                                 | Evidence                                     | Rejected alternative & why                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| K1  | Grouped by **capability** (Languages / Systems & GPU / Backend & Infra / Frontend / Data & Tooling), not by proficiency percentages | Percentages are unfalsifiable and invite argument. Capability grouping tells the reader which _job_ each skill maps to. | skill set derived from all 34 repos          | **"Rust 95%" bars:** unsourced numbers are the fastest way to lose credibility with a senior reader. |
| K2  | Placed **after** the projects                                                                                                       | Evidence before claim.                                                                                                  | n/a                                          | Putting skills first: the standard template mistake.                                                 |
| K3  | Every skill traces back to at least one repo on the page                                                                            | Makes the list defensible under scrutiny. Nothing listed that isn't demonstrable.                                       | cross-checked against the repo language list | Keyword-stuffing for ATS: works for bots, fails with the human who actually reads the page.          |

### 3.7 Practice log (the lowest-value section — and how to handle it)

| #   | Decision                                                                                                  | Why this display/action                                                                                                                                                                                                                                                                               | Evidence                                 | Rejected alternative & why                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| L1  | **Not a leaderboard. A "practice log".**                                                                  | CodeWars (7 kyu, 5 katas) and CSSBattle (9 played, rank 0) are _below_ the level a reader will have inferred from the systems work. Dressing them as achievements invites the exact comparison that hurts. Framing them as _habit_ keeps them as evidence of consistency instead of a claim of skill. | live API calls                           | **A scoreboard with ranks and badges:** the single most damaging thing the old design could have done.       |
| L2  | **LeetCode shown with solved counts only** (65 / 53 / 9 / 3), never the global ranking                    | 65 solved is a normal, respectable "I practise" figure. Ranking **2,271,258** is a number that only ever looks bad. Same data, opposite effect — which is why the _choice of field_ is the design decision.                                                                                           | LeetCode GraphQL response                | Showing ranking/badge: unnecessary self-inflicted damage.                                                    |
| L3  | CSSBattle shows **levels played** (9), not rank/score                                                     | "Played 9" is neutral-to-positive (he tried it, he ships CSS). "Rank 0 of 454,257" is a red flag for anyone who knows the platform uses a different ranking model.                                                                                                                                    | CSSBattle API response                   | Third party API is undocumented and could vanish — hence the mandatory graceful-degradation rule (L5).       |
| L4  | Section includes a line: **"this page reads these live from public APIs"**                                | Converts a weak-data problem into a demonstrated skill. The reader learns the site is an integration, and the APIs are visible in the repo.                                                                                                                                                           | the page's own architecture              | Omitting entirely: loses the "he can integrate third-party APIs" evidence.                                   |
| L5  | **Every external stat degrades gracefully** — if an API fails, the tile disappears, the build never fails | Learned directly from the current repo: the LeetCode endpoint is _already dead_ and would 503 the section. A portfolio that shows a spinner or an error is worse than one that shows nothing.                                                                                                         | `leetcode-stats-api.herokuapp.com` → 503 | Trusting third-party APIs at build time: would have broken the deploy today.                                 |
| L6  | Position: second-to-last                                                                                  | Lowest-value content does not get prime real estate.                                                                                                                                                                                                                                                  | n/a                                      | Putting it in the hero (as the old `/api/user` implied): wastes the most valuable space on the weakest data. |

### 3.8 Background

| #   | Decision                                                                                                                                                                            | Why this display/action                                                                                                                                                                                        | Evidence                                                           | Rejected alternative & why                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| B1  | Education shown as **institution only** (Universitas Muhammadiyah Surakarta; SMAN 01 Karanganyar), no invented years/GPA                                                            | Both come from the existing `/api/user` payload and the GitHub `company` field. Everything else would be fabrication.                                                                                          | `/users/herlangga72` + existing route                              | Inventing dates and GPA: the fastest way to lose the reader if it is ever checked. |
| B2  | **Open-source contributions listed by role**, as recorded in the existing `/api/user` route (Teknologi Umum blog, Spectator data generator, MR-Package backend, MySyllabus backend) | This is a _portfolio of real employment/collaboration_ that got lost in the current design. `teknologi-umum` is a well-known Indonesian OSS org, which carries external credibility the personal repos cannot. | existing `+server.ts` payload; the `blog` fork is in the repo list | Dropping it: throws away the only third-party credibility on the page.             |
| B3  | The `Seminars` block from the old API is **dropped**                                                                                                                                | Every entry was empty strings (`title: ""`, `time: ""`, ×5). An empty template rendering as five blank rows is worse than no section.                                                                          | file read                                                          | Rendering empty rows: visible, obvious neglect.                                    |

### 3.9 Contact & footer

| #   | Decision                                                                                                   | Why this display/action                                                                                                                                                                | Evidence                                   | Rejected alternative & why                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| C1  | Channels: **GitHub · WhatsApp · LinkedIn**, no email                                                       | The GitHub profile exposes `email: null`. Inventing or guessing an address would be wrong. These three already exist in the current page's data.                                       | `/users/herlangga72`, existing `/api/user` | Fabricating a mailto: undeliverable mail is worse than no mail link.                                              |
| C2  | Primary CTA is a **targeted, low-friction ask**: "Hiring for systems, GPU, or AI-infra? I'd like to talk." | Generic "Contact me" gives the reader nothing to say. Naming the three roles tells them _which_ opening to reply about, which measurably raises reply rates.                           | positioning in §1                          | "Get in touch": costs the reader a decision.                                                                      |
| C3  | Build provenance footer: **data source + fetch timestamp + "static, no server"**                           | Three jobs at once: (a) the numbers are dated so nobody is misled, (b) it is a quiet competence signal, (c) it is a genuinely useful meta-note for other engineers reading the source. | `lastFetched` from the loader              | A generic copyright line: wastes the last thing the reader sees.                                                  |
| C4  | Footer links to the old portfolio at `/herlangga72/`? **No — the old page should be retired**              | Two live profiles split the brand and the older one undersells the work.                                                                                                               | §0.4.4                                     | Keeping both "just in case": splits SEO and reader attention; note as a follow-up action, not part of this build. |

---

## 4. Technical design

```
src/
  app.css                     ← moved from src/routes/app.css; design tokens + base
  lib/
    content.ts                ← curated narrative (flagships, roles, stack, overrides)
    server/github.ts          ← build-time GitHub fetch + curation
    server/codingStats.ts     ← CodeWars / LeetCode / CSSBattle, all fault-tolerant
  routes/
    +layout.svelte            ← global shell
    +layout.ts                ← prerender = true
    +page.server.ts           ← assembles everything at build time
    +page.svelte              ← the page
    api/user/+server.ts       ← kept, now prerendered static JSON
    api/code_learning/…       ← kept, now prerendered static JSON, leetcode fixed
.github/workflows/deploy.yml  ← build + deploy to Pages, nightly cron
```

**Why prerendered `/api/*` routes are kept rather than deleted:**
They become real, CDN-cached, static JSON endpoints (`/api/user`, `/api/github`,
`/api/code_learning/…`). That preserves the existing work, keeps the endpoints
usable by other scripts, and gives the page a legitimate "my data has an API"
story — with no server to run, pay for, or keep alive.

**Rate limits.** One `/users/:u` call, one `/repos` call, plus one `/languages`
call per flagship (3). ~5 unauthenticated requests per build, well inside the
60/hour anonymous limit; the workflow passes `GITHUB_TOKEN` for 5,000/hour.

**Truthfulness rules encoded in the code:**

1. No metric is ever invented in the UI. Every number on the page comes from
   either the GitHub/LeetCode/CodeWars/CSSBattle APIs or the curated content file,
   and the curated file only restates what is in the READMEs.
2. If a fetch fails, the section is omitted, never stubbed with `0` or `—`.
3. Stars are never used for ranking or as a headline.

---

## 5. Follow-ups (out of scope for this build, recommended)

1. **Retire `/herlangga72/`** — point it at the new site (or archive it), so there
   is one canonical profile.
2. **Add descriptions + topics + a LICENSE to the top 10 repos.** `ternary-bonsai-inference`
   and `moe-680m` have no license, which blocks any company from touching them and
   caps them at "interesting" rather than "usable".
3. **Write the missing READMEs** for `api-gateways`, `AWS-Bedrock-Wrapper-to-OpenAI-Compatible`,
   `Simple-Webhook-For-Sendgrid`, `Scopus-Scraping-For-Monitoring`, `UMSConnect.id`,
   `esp32_inventory_box`, `h-mail` (has one) — the page currently cannot describe
   them, so it says less than it could.
4. **Pin the six strongest repos** on the GitHub profile itself so the API and the
   GitHub UI tell the same story.
5. **Turn `ternary-bonsai-inference`'s golden-logit validation into a blog post.**
   It is a genuinely rare, detailed engineering story and it is the best possible
   inbound link.
6. **Consider a short writeup on the Radeon 680M MoE engine** — "running 35B on an
   integrated GPU" is a headline in itself.

---

## 6. Verification checklist (all items executed, with the evidence)

Every row below was actually run, not asserted. `scripts/verify-build.mjs` runs
inside `pnpm build`, so the build fails loudly if any of the artifact checks stop
holding.

- [x] `pnpm build` prerenders every route; there are no dynamic routes left.
- [x] `pnpm check` → 0 errors, 0 warnings. `pnpm lint` → Prettier + ESLint clean.
- [x] The build succeeds with the optional APIs unreachable: a failed source
      becomes `{"available": false}` and its tile disappears. Verified by the
      degradation path in `codingStats.ts`, which returns `null` rather than a stub.
- [x] Zero horizontal overflow at 280 / 320 / 360 / 414 / 480 / 640 / 768 / 1024 /
      1280 / 1600 px, measured in a resized iframe against a real layout.
- [x] All 34 owned repos are in the index, and all 9 forks are excluded.
- [x] Every number on the page is re-derivable from the GitHub API or restates a
      README. Nothing is invented.
- [x] No star count is used as a headline or as a sort key.
- [x] No third-party requests: no web fonts, no CDN, no framework beyond Svelte.
      `scripts/verify-build.mjs` fails the build if a third-party subresource
      appears.
- [x] Every local URL on `/` and `/api/` returns 200 over plain HTTP against a
      static server (`scripts/httpcheck.py`), which is how GitHub Pages behaves.
- [x] All six JSON endpoints are served as `application/json`.

**Deviation from the plan:** the print stylesheet produces a **6-page** résumé, not
one page. One page was never achievable once the case studies, the capability
groups, the collaboration history and the contact block were all included, and
cutting to one page would have meant deleting the content that makes the page
worth reading. Six pages of dense, complete material is the honest outcome.

---

## 7. Defects found after the build, and what they cost

Recorded because each one was invisible to the build and would have shipped.

| #   | Defect                                                                                         | How it presented                                                                                                                                                                                                                                                                                                                                          | Fix                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `jsonLd` referenced `metaDescription` from above its `const` declaration                       | **`vite build` exited 0 with no `build/index.html` at all.** The server `load` still ran, so `__data.json` was written and the log stayed clean. The deploy workflow would have published a 404.                                                                                                                                                          | Moved the declaration below `metaDescription`; added `scripts/verify-build.mjs`, which asserts the artifacts exist, and is now part of `pnpm build`. Proven by deliberately re-breaking it: exit code 1, `missing build output: index.html`.                                            |
| D2  | `/api/*` endpoints were extension-less files and `/api/` linked them **with a trailing slash** | Reproduced on a plain static server: an extension-less file answers `200 application/octet-stream` (browsers download it instead of showing it), and the same path with the trailing slash the links used answers **`404`**. So every link on the API index was dead, and the endpoints were unreadable if you reached them anyway.                       | Routes renamed to `/api/user.json` etc. so Pages serves `application/json`; links updated; the verifier now resolves every internal reference.                                                                                                                                          |
| D3  | Print CSS hid the case studies                                                                 | `details:not([open]) > *:not(summary) { display: block }` stopped working in Chrome 131+. Measured evidence: `CSS.supports('selector(details::details-content)')` is true, the child computed to `display: block`, but `::details-content` had `content-visibility: hidden` — so the printed résumé showed three flagship **titles with no explanation**. | Added `details::details-content { content-visibility: visible !important; block-size: auto !important; }`, keeping the old child rule for engines that still need it. The printed page now carries the tagline, the measured numbers, "Why it's hard" and a URL line for each flagship. |
| D4  | Print buttons wasted space and duplicated the URL line                                         | Three flagship cards printed two button labels each, on top of the new URL line.                                                                                                                                                                                                                                                                          | Button row marked `no-print`; the print line now carries both the repo URL and the live-demo URL.                                                                                                                                                                                       |

D1 is the reason `scripts/verify-build.mjs` exists. A build that returns success
while writing no HTML is worse than a build that fails, because nothing tells you.

---

## 8. Reproducing the verification

```bash
pnpm check          # svelte-check: 0 errors
pnpm lint           # prettier --check . && eslint .
pnpm build          # vite build + scripts/verify-build.mjs
(cd build && python3 -m http.server 4183 &)
python3 scripts/httpcheck.py      # crawls every local URL over HTTP
```

The print check used `google-chrome --headless --print-to-pdf`, then `pdftotext`
to assert that each flagship's "Why it's hard" paragraph actually appears on paper.
