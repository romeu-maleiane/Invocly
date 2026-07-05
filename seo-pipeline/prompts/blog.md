Write a complete, publish-ready blog post for Invocly's blog.

BRAND VOICE / RULES (follow strictly, including the fixed article structure):
{{brand_voice}}

TARGET KEYWORD: {{keyword}}
SEARCH INTENT: {{intent}}

MUST COVER (these are angles, expand each into real content, don't just restate them):
{{bullets}}

INTERNAL LINKS TO INCLUDE (use these exact URLs, natural anchor text, woven into the body):
{{internal_links}}

EXTERNAL LINKS TO CITE (use these exact URLs where relevant):
{{external_links}}
{{notes_block}}{{existing_block}}

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
slug: "{{slug}}"
date: "{{date}}"
keyword: "{{keyword}}"
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