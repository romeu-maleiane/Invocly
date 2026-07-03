#!/usr/bin/env python3
"""
blog.py — Invocly SEO blog generation engine.

Reads a topic brief from topics_queue.yaml (populated by the research
agent using OpenSEO MCP data) and generates a full MDX draft using Gemini.

Usage:
    python seo-pipeline/blog.py --topic-id pdf-to-audio-study
    python seo-pipeline/blog.py --refresh pdf-to-audio-study --notes "CTR low, tighten title"
    python seo-pipeline/blog.py --all-new          # draft every queued topic with status: new

Requires:
    pip install google-genai pyyaml
    export GEMINI_API_KEY=...
"""

import argparse
import datetime as dt
import json
import pathlib
import re
import sys

import os

import yaml
from google import genai

PIPELINE_DIR = pathlib.Path(__file__).resolve().parent
ROOT = PIPELINE_DIR.parent
QUEUE_PATH = PIPELINE_DIR / "topics_queue.yaml"
BRAND_VOICE_PATH = PIPELINE_DIR / "brand-voice.md"
POSTS_DIR = ROOT / "app" / "blog" / "_posts"
MODEL = "gemini-3.5-flash"

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def slugify(text: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", text)


def load_queue() -> dict:
    with open(QUEUE_PATH) as f:
        return yaml.safe_load(f)


def save_queue(data: dict) -> None:
    with open(QUEUE_PATH, "w") as f:
        yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)


def find_topic(data: dict, topic_id: str) -> dict:
    for t in data["topics"]:
        if t["id"] == topic_id:
            return t
    raise SystemExit(f"No topic with id '{topic_id}' in {QUEUE_PATH}")


def build_prompt(topic: dict, brand_voice: str, refresh_notes: str | None,
                  existing_body: str | None) -> str:
    internal_links = "\n".join(
        f"- {l['url']} (anchor idea: {l.get('anchor_hint', '')})"
        for l in topic.get("internal_links", [])
    )
    external_links = "\n".join(
        f"- {l['url']} ({l.get('note', '')})"
        for l in topic.get("external_links", [])
    )
    bullets = "\n".join(f"- {b}" for b in topic.get("bullets", []))

    task = (
        "Write a complete, publish-ready blog post for Invocly's blog."
        if not refresh_notes else
        "Refresh and improve the EXISTING post below based on the ranking notes. "
        "Keep what's working, tighten the title/meta for CTR, add or expand an FAQ "
        "section covering likely 'People Also Ask' angles, and strengthen internal "
        "linking. Return the FULL revised post, not a diff."
    )

    existing_block = f"\n\nEXISTING POST TO REFRESH:\n---\n{existing_body}\n---" if existing_body else ""
    notes_block = f"\n\nRANKING NOTES FROM OPENSEO DATA:\n{refresh_notes}" if refresh_notes else ""

    return f"""{task}

BRAND VOICE / RULES (follow strictly, including the fixed article structure):
{brand_voice}

TARGET KEYWORD: {topic['keyword']}
SEARCH INTENT: {topic.get('intent', 'informational')}

MUST COVER (these are angles, expand each into real content, don't just restate them):
{bullets}

INTERNAL LINKS TO INCLUDE (use these exact URLs, natural anchor text, woven into the body):
{internal_links or '(none provided)'}

EXTERNAL LINKS TO CITE (use these exact URLs where relevant):
{external_links or '(none provided)'}
{notes_block}{existing_block}

REQUIRED ARTICLE STRUCTURE (see brand-voice.md for the full rules):
1. Opening paragraph — real context, no fluff.
2. Quick Answer blockquote (40-60 words) immediately after, answering the main
   question directly. Use Markdown blockquote syntax (> ...).
3. Body organized under H2 headings that are each phrased AS A QUESTION a person
   or AI assistant would actually ask.
4. Internal links woven naturally into the body (not a link dump).
5. FAQ section at the end with AT LEAST 6 question/answer pairs, each answer
   2-4 sentences and self-contained.

OUTPUT FORMAT — return ONLY the MDX file content, starting with frontmatter. The
`faq` list in frontmatter must exactly match the FAQ section written in the body
(same questions, same answers) — it's used to generate FAQPage structured data:

---
title: "<= 60 chars, includes target keyword>"
description: "<= 155 chars meta description, written to earn clicks>"
slug: "{slugify(topic['keyword'])}"
date: "{dt.date.today().isoformat()}"
keyword: "{topic['keyword']}"
faq:
  - question: "<question 1>"
    answer: "<answer 1, plain text, 2-4 sentences>"
  - question: "<question 2>"
    answer: "<answer 2>"
  # ... at least 6 entries total, matching the FAQ section in the body
---

<article body in Markdown:
- opening paragraph
- > Quick Answer blockquote (40-60 words)
- question-phrased H2 sections with internal links woven in
- ## FAQ section at the end, matching the frontmatter faq list exactly>
"""


def generate(topic: dict, refresh_notes: str | None = None,
             existing_body: str | None = None) -> str:
    brand_voice = BRAND_VOICE_PATH.read_text()
    prompt = build_prompt(topic, brand_voice, refresh_notes, existing_body)

    resp = client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )
    return resp.text


def split_frontmatter(content: str) -> tuple[dict, str]:
    """Split MDX into (frontmatter dict, body markdown)."""
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", content, re.DOTALL)
    if not m:
        raise ValueError("Model output missing valid frontmatter block")
    front = yaml.safe_load(m.group(1))
    body = m.group(2)
    return front, body


def build_faq_jsonld(faq: list[dict]) -> str:
    """Real FAQPage structured data generated from frontmatter, not trusted
    to the model's freehand output — this is what actually needs to be valid
    JSON-LD for Google/AI engines to parse it."""
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": item["question"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item["answer"],
                },
            }
            for item in faq
        ],
    }
    return (
        '<script type="application/ld+json">\n'
        + json.dumps(schema, indent=2)
        + "\n</script>"
    )


def qa_check(front: dict, body: str) -> list[str]:
    """Cheap structural checks — not a substitute for the human review pass
    in AGENTS.md, but catches obvious misses before that."""
    problems = []
    faq = front.get("faq", [])
    if len(faq) < 6:
        problems.append(f"Only {len(faq)} FAQ entries in frontmatter (need 6+)")
    if len(front.get("title", "")) > 60:
        problems.append("Title exceeds 60 characters")
    if len(front.get("description", "")) > 155:
        problems.append("Meta description exceeds 155 characters")
    if ">" not in body.split("\n\n")[1] if body.count("\n\n") > 1 else True:
        problems.append("No blockquote (Quick Answer) detected near the top — check manually")
    h2s = re.findall(r"^##\s+(.*)$", body, re.MULTILINE)
    non_faq_h2s = [h for h in h2s if h.strip().lower() != "faq"]
    non_question_h2s = [h for h in non_faq_h2s if not h.strip().endswith("?")]
    if non_question_h2s:
        problems.append(f"H2s not phrased as questions: {non_question_h2s}")
    return problems


def write_draft(topic: dict, content: str) -> pathlib.Path:
    front, body = split_frontmatter(content)

    problems = qa_check(front, body)
    if problems:
        print("  QA warnings (fix before opening a PR):")
        for p in problems:
            print(f"    - {p}")

    faq_jsonld = build_faq_jsonld(front.get("faq", []))
    full_content = (
        "---\n" + yaml.safe_dump(front, sort_keys=False, allow_unicode=True) + "---\n"
        + body.rstrip() + "\n\n" + faq_jsonld + "\n"
    )

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = POSTS_DIR / f"{slugify(topic['keyword'])}.mdx"
    out_path.write_text(full_content)
    return out_path


def main():
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--topic-id", help="Draft a new post from a queued topic id")
    group.add_argument("--refresh", metavar="SLUG_OR_ID", help="Refresh an existing post")
    group.add_argument("--all-new", action="store_true", help="Draft every status:new topic")
    parser.add_argument("--notes", help="Ranking notes to guide a --refresh run")
    args = parser.parse_args()

    data = load_queue()

    if args.all_new:
        targets = [t for t in data["topics"] if t.get("status") == "new"]
        if not targets:
            print("No topics with status: new")
            return
        for t in targets:
            _draft_one(t, data)
        save_queue(data)
        return

    if args.topic_id:
        topic = find_topic(data, args.topic_id)
        _draft_one(topic, data)
        save_queue(data)
        return

    if args.refresh:
        topic = find_topic(data, args.refresh)
        existing_path = POSTS_DIR / f"{slugify(topic['keyword'])}.mdx"
        if not existing_path.exists():
            sys.exit(f"No existing post found at {existing_path} to refresh")
        existing_body = existing_path.read_text()
        content = generate(topic, refresh_notes=args.notes, existing_body=existing_body)
        out_path = write_draft(topic, content)
        print(f"Refreshed: {out_path}")
        return


def _draft_one(topic: dict, data: dict) -> None:
    print(f"Generating: {topic['keyword']} ...")
    content = generate(topic)
    out_path = write_draft(topic, content)
    topic["status"] = "drafted"
    print(f"  -> {out_path}")


if __name__ == "__main__":
    main()
