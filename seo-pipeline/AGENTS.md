# Invocly SEO Blog Pipeline — Agent Instructions

This file is the "mission" doc for any agent working in this project.
Read it fully before doing anything. It defines two recurring jobs: **Research & Publish**
and **Rank Review & Double-Down**. Keep a human review gate before anything gets merged
to the main branch — everything else can run unattended.

Product context: Invocly (invocly.com) converts PDF/DOCX/TXT documents into natural
sounding speech. Primary audiences: students studying from notes/textbooks, people with
dyslexia or reading difficulties, professionals who want to listen to documents while
commuting/multitasking, and accessibility-focused users generally.

MCP tool required: **OpenSEO** (`https://app.openseo.so/mcp`). Confirm it's connected
before starting either job. If it's not connected, stop and ask the human to connect it
(Settings → MCP Servers) rather than guessing at keyword data.

---

## Job 1 — Research & Publish (run 1–2x/week)

1. **Research keywords with OpenSEO MCP**, not from memory. For each pillar in
   `seo-pipeline/topics_seed.yaml`, call `openseo.keyword_research` on the seed terms, then
   `openseo.get_serp` on the 3–5 best candidates to see who currently ranks and why.
   Prioritize keywords that are:
   - Long-tail (3+ words), clearly matched to one of Invocly's actual use cases
   - Low-to-medium difficulty (don't chase head terms this early)
   - Not already covered by an existing post in `blog/`

2. **Write bullet-point briefs**, not full outlines. For each chosen keyword, append an
   entry to `seo-pipeline/topics_queue.yaml` with:
   - `keyword`, `intent` (informational/comparison/how-to), `search_volume`, `difficulty`
   - 4–6 bullet points of what the post must cover (not prose — just the angles)
   - `internal_links`: 1–3 relevant Invocly pages (pull real URLs from the site, don't invent them)
   - `external_links`: 1–2 authoritative outside sources worth citing (studies, docs — not competitors)

   Keep briefs terse. The writing model does the expansion, not you.

3. **Generate drafts**: for each new queue entry, run:
   ```
   python scripts/blog.py --topic-id <id>
   ```
   This writes a full MDX draft to `blog/` using `brand-voice.md` as the style
   guide and marks the queue entry `status: drafted`.

4. **Update `topic_seed.yaml`** internal_pages after     generated 

   After a blog post is successfully generated and stored, the system MUST automatically append it to `seo-pipeline/topic_seed.yaml` under `internal_pages`.

   This ensures newly generated content becomes immediately available for internal linking in future SEO research and writing cycles.

   The appended entry must follow this structure:

   ```yaml
   - url: "https://invocly.com/blog/<slug>"
     topic: "<post title>"
   ```

5. **QA pass** on each draft before it goes further. `blog.py` runs cheap structural
   checks automatically and prints warnings (FAQ count, title/description length,
   missing Quick Answer blockquote, non-question H2s) — treat those as a starting
   checklist, not the full review:
   - Opening paragraph is real context, not fluff
   - Quick Answer blockquote present right after the opening, 40-60 words, stands
     alone without needing the rest of the article for context
   - Every H2 (except "FAQ") is phrased as a real question, in the way the audience
     actually asks it — not a marketing label
   - Meta title ≤ 60 chars, meta description ≤ 155 chars, both contain the target
     keyword naturally
   - Internal links actually resolve (don't 404-link to imagined pages) and are woven
     into the body, not dumped in a list
   - FAQ section has 6+ questions and matches the `faq` frontmatter exactly (that's
     what the generated FAQPage JSON-LD is built from — check the `<script
     type="application/ld+json">` block at the bottom of the file is valid)
   - No unverifiable claims about Invocly features — check against the marketing site
   - Reads like it was written by someone who understands dyslexia/accessibility/studying,
     not generic AI filler. If it sounds like every other SaaS blog post, rewrite the intro.

6. **Open a PR**, don't push to main. Title it `blog: <keyword>`. Include the brief in the
   PR description so the human reviewer can see what it was supposed to cover. Wait for
   human merge — do not self-merge.

7. Mark the queue entry `status: published` only after the PR is merged.

---

## Job 2 — Rank Review & Double-Down (run weekly, ~7+ days after each post goes live)

This is the highest-ROI recurring task — prioritize it over publishing more new posts.

1. Use `openseo.get_gsc_performance` (or `get_rank_tracker` if configured) for every post
   published 7–30 days ago. Pull clicks, impressions, CTR, average position.

2. Classify each post:
   - **Early riser**: position 8–25 and climbing, or impressions rising with low CTR →
     candidate for improvement. This is where you focus.
   - **Flat/no signal**: negligible impressions after 2+ weeks → leave it, don't waste
     cycles rewriting something with no demand signal yet.
   - **Ranking well** (top 10): light touch only — check for featured-snippet opportunities.

3. For each early riser, run:
   ```
   python scripts/blog.py --refresh <slug> --notes "<what OpenSEO data suggests>"
   ```
   Typical improvements: tighten the title/meta to lift CTR, add an FAQ section answering
   the exact "People Also Ask" queries from `openseo.get_serp`, strengthen internal linking
   from newer posts back to this one, expand thin sections competitors cover better.

4. Open a PR per refreshed post (`refresh: <slug>`), same human-review gate as Job 1.

5. Log the before/after position and the change made in `content/briefs/refresh-log.md`
   so future refreshes don't repeat the same experiment.

---

## Guardrails

- Never fabricate search volume, difficulty, or ranking data — always pull it from OpenSEO MCP.
- Never invent internal links to pages that don't exist on invocly.com.
- Never publish directly to main without a human-merged PR.
- If OpenSEO MCP calls fail or look rate-limited, stop and report — don't fall back to guessing.
- Cap new-post output at what Job 2 review can keep up with. More unreviewed posts is not the goal;
  a smaller set of posts that get tuned into rankers is.
