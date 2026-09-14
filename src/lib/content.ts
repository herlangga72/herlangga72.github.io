/**
 * Curated narrative content.
 *
 * Rules for this file:
 *  - Nothing here is invented. Every claim restates something that is verifiable in a
 *    public repo, README, or API response (see PLAN.md, "Truthfulness rules").
 *  - No invented dates, employers, job titles, GPAs, or user counts.
 *  - Descriptions for repos that GitHub reports as having none are drawn from the
 *    repository's own README/content, never from guesswork about what it "should" be.
 */

export const identity = {
	name: 'Herlangga Yusuf Syailendra',
	handle: 'herlangga72',
	role: 'Systems & inference engineer',
	// Deliberately concrete: every clause is checkable in one click.
	subline: 'Rust · GPU compute · LLM inference internals · bare-metal x86-64',
	location: 'Karanganyar, Central Java, Indonesia',
	timezone: 'UTC+7',
	github: 'https://github.com/herlangga72',
	// His own words, kept in Indonesian because it is his voice and a memorable line.
	bioQuote:
		'Optimalisasi itu “By Design”, jangan berharap kedepan aplikasi itu optimal kalau tidak ada yang mau meng-“optimal”-kan.',
	bioTranslation:
		'Optimisation is by design. Do not expect an application to become optimal later if nobody is willing to do the optimising.',
	availability: 'Open to systems, GPU, and AI-infrastructure roles'
};

export const contact = [
	{
		label: 'GitHub',
		value: '@herlangga72',
		href: 'https://github.com/herlangga72',
		note: '43 repositories · open an issue or a discussion'
	},
	{
		label: 'WhatsApp',
		value: '+62 856-0755-5744',
		href: 'https://api.whatsapp.com/send?phone=6285607555744&text=Hi%20Herlangga%20-%20I%20saw%20your%20portfolio',
		note: 'Fastest channel, UTC+7'
	}
];

export type Metric = { value: string; label: string };

export type Flagship = {
	id: string;
	repo: string;
	liveUrl?: string;
	title: string;
	tagline: string;
	/** Plain-language translation of why this is not a tutorial project. */
	whyHard: string;
	metrics: Metric[];
	detail: string[];
	/** Real structure taken from the repo, rendered as plain text. */
	blueprint?: { caption: string; text: string };
};

/**
 * Exactly three, chosen so each proves a different claim (PLAN.md F1):
 *  1. depth in model internals, 2. hardware/GPU fluency, 3. shipping a usable product.
 */
export const flagships: Flagship[] = [
	{
		id: 'ternary',
		repo: 'ternary-bonsai-inference',
		title: 'Pure-Rust 27B ternary inference engine',
		tagline:
			'A full LLM runtime written from scratch — GGUF reader, BPE tokenizer, 64-layer hybrid forward pass, sampler, detokenizer — with no llama.cpp in the link path.',
		whyHard:
			'Wiring a model up to llama.cpp proves you can follow a README. This reimplements the runtime and then proves it correct against llama.cpp\u2019s own logits, kernel op by kernel op.',
		metrics: [
			{ value: '154', label: 'commits' },
			{ value: '27B', label: 'parameters' },
			{ value: '1.71', label: 'bits / weight' },
			{ value: '4.4e-3', label: 'logit rel. error' },
			{ value: '0', label: 'llama.cpp links' }
		],
		detail: [
			'**Architecture ported by hand:** qwen35 hybrid — 64 layers, 262K context, GQA with 24 query / 4 KV heads, every fourth layer full attention and the rest a gated SSM branch (conv1d kernel 4, state 128, dt rank 48) with partial-split RoPE.',
			'**Weights:** PQ2_0 ternary, ~1.71 effective bits per weight, measured at ~95% of the FP16 model\u2019s benchmark score with no higher-precision escape hatch.',
			'**Correctness, not vibes:** golden-logit captures from a llama.cpp fork, plus dedicated comparison harnesses for kernels (`bonsai-kerncmp`), activations (`bonsai-actcmp`) and the tokenizer (`bonsai-tokcmp`) run against real tensor data.',
			'**GPU path:** the whole forward pass is recorded as one Vulkan command buffer per token; the PQ2_0 matvec is a fused single-pass kernel with a shared-memory reduction. On a gfx902 iGPU that lands at DRAM parity with the AVX2 CPU path, which is the honest result — the target is a discrete RX 7600.',
			'**Memory engineering:** KV cache as f16, or rotation-quantised (4-bit planar is ~7.8\u00d7 smaller), which is what makes a 32K context fit on the APU at all.'
		],
		blueprint: {
			caption: 'Module map',
			text: `src/gguf.rs       pure-Rust GGUF reader, PQ2_0 dequant, layout checks
src/tokenizer.rs  qwen35 BPE + GPT-2 byte decoder
src/forward.rs    attention · GDN recurrent · FFN · decoder
src/kernels.rs    RMSNorm · L2 · SiLU · softmax · PQ2_0 matvec
src/rope.rs       IMROPE multi-rope
src/gdn.rs        gated-delta-net step (validated vs ggml)
src/sampler.rs    top-k · top-p · min-p · temperature
gdev.rs           one Vulkan command buffer per token`
		}
	},
	{
		id: 'moe',
		repo: 'moe-680m',
		title: '35B MoE inference on an integrated GPU',
		tagline:
			'Qwen3.6-35B-A3B running at ~15\u201320 tok/s on an AMD Radeon 680M — an RDNA2 APU with no dedicated VRAM.',
		whyHard:
			'An APU shares DDR5 with the CPU, so there is no fast memory to hide behind. Throughput has to come from keeping 256 experts resident and the KV cache small, not from raw bandwidth you do not have.',
		metrics: [
			{ value: '~15\u201320', label: 'tok/s' },
			{ value: '256', label: 'experts' },
			{ value: '40', label: 'layers' },
			{ value: 'Q4_0', label: 'KV cache' },
			{ value: '26', label: 'commits' }
		],
		detail: [
			'**Vulkan compute, no ROCm:** dispatch goes through `ash` onto RADV, so the engine has no HIP/ROCm toolchain dependency and runs on a stock Mesa driver.',
			'**Built around the actual bottleneck:** shared DDR5 with the host is the constraint, so the design optimises residency of the expert set and the KV footprint rather than raw FLOPs.',
			'**MoE specifics:** 40 layers, 256 experts, ~3B active parameters per token, Q4_0 KV cache.',
			'**Why it is worth reading:** it is a worked example of doing more with the hardware people already own, on the single most common integrated GPU in AMD laptops.'
		],
		blueprint: {
			caption: 'Pipeline',
			text: `token ──▶ router ──▶ top-k experts (of 256)
                    │
                    ├─▶ Vulkan compute (ash / RADV)
                    │
                    ▼
              Q4_0 KV cache  ──▶ ~15–20 tok/s
                 (shared DDR5)`
		}
	},
	{
		id: 'sdgs',
		repo: 'SDGs-Paper-Tester',
		liveUrl: 'https://sdgs-paper-tester.onrender.com/',
		title: 'SDG Paper Matcher — SIMD-accelerated research classifier',
		tagline:
			'Checks an academic paper against the exact Scopus queries for the 17 UN Sustainable Development Goals. Rust + a hand-written SIMD ladder, with a live demo you can try.',
		whyHard:
			'It has to reproduce Scopus\u2019s own AND/OR/NOT query semantics over ~21,000 keywords exactly, and be fast enough that nobody waits for the answer.',
		metrics: [
			{ value: '~30\u00d7', label: 'faster than Python' },
			{ value: '15\u201350 ms', label: 'per paper' },
			{ value: '21k', label: 'keywords indexed' },
			{ value: 'live', label: 'public demo' },
			{ value: '50', label: 'commits' }
		],
		detail: [
			'**Hand-written SIMD ladder:** AVX-512 (64 B), AVX2 (32 B), SSE3\u2013SSE4.2 (16 B) and a scalar fallback, runtime-detected, applied to case folding, substring search and whitespace scanning.',
			'**One semantics, two engines:** a Rust engine and a Python reference implementation, with `tests/parity_check.py` failing on any block-level disagreement. Two implementations are only useful if they are held to the same answer.',
			'**Speed from structure, not just SIMD:** all 21k query keywords are precompiled once at boot, with per-request text indexes and memoisation.',
			'**It is a product, not a benchmark:** DOI auto-fill via Crossref (with a landing-page fallback for missing keywords), a per-SDG near-miss guide that says exactly which keywords to add, an advanced keyword browser, `POST /api/match` for batch use, gzip, JSONL access logs with anonymous visitor counts, Sentry error reporting, and CSV/JSONL dataset exports.',
			'**It runs on a 0.1-CPU free tier** and still answers in 80\u2013270 ms, which is the point: the speed is real enough to survive bad hardware.'
		],
		blueprint: {
			caption: 'Match path',
			text: `paper ──▶ parse ──▶ AST ──▶ SIMD match ──▶ report
                 (17 SDG        (21k keywords)   ├─ matched
                  queries)                        ├─ near miss
                                                  │   + fastest fix
                                                  └─ NOT terms`
		}
	}
];

/**
 * Repos GitHub reports as having no description. Each line restates what the repo
 * itself contains (README, language breakdown, or the repo's own stated purpose).
 * Repos where nothing verifiable could be said are intentionally absent.
 */
export const descriptionOverrides: Record<string, string> = {
	'h-mail':
		'Self-hosted email client with an AI agent, running entirely on Cloudflare Workers — Durable Objects + SQLite per mailbox, R2 attachments, Workers AI.',
	'Blender-CLI-TUI-Renderer':
		'Textual TUI that drives Blender headless renders: engine, samples, resolution and device selection, with live log streaming and process control.',
	'api-gateways': 'Rust API gateway work.',
	'AWS-Bedrock-Wrapper-to-OpenAI-Compatible':
		'Exposes AWS Bedrock models behind an OpenAI-compatible API, with a container build.',
	'Simple-Webhook-For-Sendgrid': 'Rust webhook receiver for SendGrid event callbacks.',
	'Scopus-Scraping-For-Monitoring':
		'Python scraper that monitors Scopus publication data over time.',
	'Minecraft-Java-Proxy-to-Network': 'Rust proxy for Minecraft Java Edition network traffic.',
	esp32_inventory_box: 'ESP32 (C++) inventory box with a browser dashboard and shell tooling.',
	'UMSConnect.id':
		'Campus connectivity platform for Universitas Muhammadiyah Surakarta. Deployed and live.',
	'umsconnect.id-deploy': 'Deployment configuration for UMSConnect.id.',
	'herlangga72.github.io': 'This site — a prerendered SvelteKit portfolio, no runtime server.',
	herlangga72: 'Earlier hand-written HTML portfolio page.',
	listmonk_static_page: 'Static landing page for a self-hosted Listmonk newsletter instance.',
	'laravel-untuk-test-masuk': 'Laravel recruitment-test submission (PHP).',
	'laravel-test-api': 'Laravel REST API exercise.',
	'rumahkuthan.site': 'Site build for rumahkuthan.site.',
	'svelte-traceback': 'Markdown-file viewer for tracebacks.',
	hosts_file: 'Personal hosts-file collection.',
	'django-template': 'Django project scaffolding template with shell tooling.',
	'server-dashboard': 'Server dashboard UI.'
};

/**
 * Capability matrix. Grouped by the job each skill maps to, not by invented
 * proficiency percentages (PLAN.md K1/K3). Every entry links to the repo that proves it.
 */
export type Skill = { name: string; evidence: string };
export type SkillGroup = { title: string; blurb: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
	{
		title: 'Languages',
		blurb: 'Across the stack, but Rust and Python carry the interesting work.',
		skills: [
			{ name: 'Rust', evidence: 'ternary-bonsai-inference' },
			{ name: 'Python', evidence: 'Scopus-Scraping-For-Monitoring' },
			{ name: 'TypeScript', evidence: 'h-mail' },
			{ name: 'JavaScript', evidence: 'UMSConnect.id' },
			{ name: 'C / C++', evidence: 'esp32_inventory_box' },
			{ name: 'x86-64 assembly', evidence: 'LunaOS-x' },
			{ name: 'PHP', evidence: 'laravel-test-api' },
			{ name: 'GLSL / shaders', evidence: 'moe-680m' }
		]
	},
	{
		title: 'Systems & GPU',
		blurb: 'Where the profile is hardest to find a substitute for.',
		skills: [
			{ name: 'Vulkan compute', evidence: 'moe-680m' },
			{ name: 'SIMD (AVX-512 / AVX2 / SSE4)', evidence: 'SDGs-Paper-Tester' },
			{ name: 'Quantised inference (GGUF, PQ2_0)', evidence: 'ternary-bonsai-inference' },
			{ name: 'Transformer / SSM forward passes', evidence: 'ternary-bonsai-inference' },
			{ name: 'Numerical validation against a reference', evidence: 'ternary-bonsai-inference' },
			{ name: 'Memory paging & allocators', evidence: 'LunaOS-x' },
			{ name: 'ACPI, SMP, bare-metal boot', evidence: 'LunaOS-x' },
			{ name: 'Embedded (ESP32)', evidence: 'esp32_inventory_box' }
		]
	},
	{
		title: 'Backend & infrastructure',
		blurb: 'Shipped services, not just exercises.',
		skills: [
			{ name: 'Rust HTTP services', evidence: 'SDGs-Paper-Tester' },
			{ name: 'Cloudflare Workers', evidence: 'h-mail' },
			{ name: 'Durable Objects + SQLite', evidence: 'h-mail' },
			{ name: 'R2 object storage', evidence: 'h-mail' },
			{ name: 'Workers AI / agents', evidence: 'h-mail' },
			{ name: 'Webhooks & integrations', evidence: 'Simple-Webhook-For-Sendgrid' },
			{ name: 'AWS Bedrock', evidence: 'AWS-Bedrock-Wrapper-to-OpenAI-Compatible' },
			{ name: 'Docker', evidence: 'SDGs-Paper-Tester' },
			{ name: 'Django', evidence: 'Preview-django-view' },
			{ name: 'Laravel', evidence: 'laravel-untuk-test-masuk' }
		]
	},
	{
		title: 'Data & tooling',
		blurb: 'The unglamorous half of shipping.',
		skills: [
			{ name: 'SQLite', evidence: 'SDGs-Paper-Tester' },
			{ name: 'Crossref API', evidence: 'SDGs-Paper-Tester' },
			{ name: 'Scopus query semantics', evidence: 'SDGs-Paper-Tester' },
			{ name: 'Web scraping & monitoring', evidence: 'Scopus-Scraping-For-Monitoring' },
			{ name: 'Observability (Sentry, JSONL logs)', evidence: 'SDGs-Paper-Tester' },
			{ name: 'TUI applications (Textual)', evidence: 'Blender-CLI-TUI-Renderer' }
		]
	},
	{
		title: 'Frontend',
		blurb: 'Enough to ship the whole thing yourself.',
		skills: [
			{ name: 'SvelteKit', evidence: 'herlangga72.github.io' },
			{ name: 'Svelte', evidence: 'admin-dashboard' },
			{ name: 'Tailwind CSS', evidence: 'herlangga72.github.io' },
			{ name: 'React', evidence: 'UMSConnect.id' },
			{ name: 'Vite', evidence: 'admin-dashboard' },
			{ name: 'CSS craft', evidence: 'svelte-traceback' }
		]
	}
];

export const background = {
	education: [
		{
			institution: 'Universitas Muhammadiyah Surakarta',
			detail: 'Graduated'
		},
		{
			institution: 'SMAN 01 Karanganyar',
			detail: 'Graduated'
		}
	],
	contributions: [
		{
			what: 'Teknologi Umum Blog',
			role: 'Contributor',
			href: 'https://github.com/teknologi-umum/blog'
		},
		{
			what: 'Spectator',
			role: 'Data generator',
			href: 'https://github.com/teknologi-umum/spectator'
		},
		{
			what: 'MR-Package',
			role: 'Backend developer',
			href: 'https://mr-package.com/'
		},
		{
			what: 'MySyllabus',
			role: 'Backend developer'
		}
	] as { what: string; role: string; href?: string }[]
};

/** Repos that get a "notable" flag in the index even without stars. */
export const notableRepos = new Set([
	'ternary-bonsai-inference',
	'moe-680m',
	'SDGs-Paper-Tester',
	'LunaOS-x',
	'h-mail',
	'UMSConnect.id',
	'api-gateways',
	'esp32_inventory_box',
	'AWS-Bedrock-Wrapper-to-OpenAI-Compatible',
	'Simple-Webhook-For-Sendgrid',
	'Blender-CLI-TUI-Renderer',
	'Scopus-Scraping-For-Monitoring',
	'Minecraft-Java-Proxy-to-Network'
]);
