# Invocly SEO Blog Pipeline

Frugal-SEO pipeline for invocly.com: OpenSEO MCP for keyword research + rank data,
a deterministic Python engine for writing, IDE as the agent runtime tying
it together. Modeled on the "research → publish → wait a week → double down on
what ranks" approach rather than volume-publishing.

## How the pieces fit

```
OpenSEO MCP (keyword data, SERPs, GSC)
        │  used by the agent directly
        ▼
config/topics_queue.yaml   ← agent writes bullet-point briefs here
        │
        ▼
scripts/blog.py             ← deterministic: brief + brand-voice.md → MDX draft
        │
        ▼
blog/*.mdx         ← draft, human-reviewed via PR, merged
        │
        ▼  (7+ days later)
OpenSEO MCP GSC data checked by agent → early risers flagged
        │
        ▼
scripts/blog.py --refresh   ← improves the existing post, not a new one
```

The MCP tool calls (research + rank checking) only happen inside the agent's
turn — that's how MCP works. The Python scripts handle the parts that don't
need judgment calls: templating, file writing, frontmatter.

## Setup

1. **Connect OpenSEO MCP to IDE**
   In IDE: Settings → MCP Servers → Add remote server →
   `https://app.openseo.so/mcp`. Sign in / approve when prompted.
   (OpenSEO is open source and self-hostable if you'd rather not use the hosted
   version — see github.com/every-app/open-seo. Managed plan is ~$10/mo and
   includes Search Console access without any Google Cloud setup.)

2. **Connect Google Search Console** to your OpenSEO project (needed for Job 2 —
   without this the agent can't tell what's actually ranking).

3. **Install script dependencies**
   ```
   pip install anthropic pyyaml
   export ANTHROPIC_API_KEY=your-key-here
   ```

4. **Fill in real internal pages** in `seo-pipeline/topics_seed.yaml` — the agent should
   never invent URLs that don't exist on invocly.com.

5. **Open this folder as an agent project.** Point the agent at `AGENTS.md`
   as its mission doc — that file defines both recurring jobs (Research & Publish,
   Rank Review & Double-Down) in detail.

## Running it manually (without the agent, for testing)

```bash
# Draft every queued topic with status: new
python scripts/blog.py --all-new

# Draft one specific topic
python scripts/blog.py --topic-id pdf-to-audio-study

# Refresh an existing post based on ranking notes
python scripts/blog.py --refresh pdf-to-audio-study --notes "Position 14, low CTR, add FAQ"
```

Output lands in `blog/*.mdx` — adjust the frontmatter/output format in
`scripts/blog.py` to match whatever your actual site (Next.js/Astro/etc.) expects
if MDX with this frontmatter shape isn't a direct fit.

## Cadence

- Job 1 (research + publish): 1–2x/week, a handful of posts at a time — not a
  flood. More unreviewed drafts than you can QA is wasted effort.
- Job 2 (rank review + refresh): weekly, and treat it as higher priority than
  publishing new posts. Per the frugal-SEO approach this is usually higher ROI
  than constantly writing new content.

## What's intentionally NOT automated

- Publishing straight to main — every post/refresh goes through a PR a human merges.
- Fabricating keyword data — the agent must pull real numbers from OpenSEO, not guess.
- Backlink outreach / distribution — still manual, that's relationship-based work
  that doesn't compress well into a script.
