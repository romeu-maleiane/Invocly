# Invocly Brand Voice & Content Rules

## Who's reading this
Mostly three kinds of people: a student trying to get through a dense chapter before an
exam, someone with dyslexia or ADHD who reads more easily by ear, and a professional who
wants to listen to a document during a commute. Write to one of these people specifically
per post — not a vague "everyone."

## Voice
- Direct, practical, a little warm. Not corporate SaaS voice ("unlock," "seamless,"
  "revolutionize," "empower" — avoid these words entirely).
- Short sentences. Vary paragraph length. No walls of text.
- It's fine to say "this won't work well if X" — earns more trust than pretending the
  tool is perfect for everyone.
- Never claim clinical/medical benefits (e.g., don't claim TTS "treats" dyslexia — it's
  an accommodation/tool, not a treatment). Cite real sources if making an accessibility claim.

## Structure every post must follow (fixed format — do not deviate)

1. **Opening paragraph** — real context/information, not throat-clearing. No "In today's
   fast-paced world..." Establish the actual problem in 2-4 sentences.

2. **Quick Answer blockquote**, immediately after the opening paragraph. 40-60 words,
   directly answers the main question the keyword implies. This is what gets lifted into
   AI engine answers and featured snippets, so it has to stand alone — readable with zero
   surrounding context. No hedging, no "it depends" as the whole answer.

3. **Question-based H2 headings** for the body. Every H2 is phrased as an actual question
   someone would type or ask an AI assistant — not a marketing label. ("How accurate is
   text-to-speech for scanned PDFs?" not "Accuracy Considerations.") This is what gets
   pulled into AI engine responses, so phrase headings the way the target audience actually
   asks the question.

4. **Internal links** woven into the body, pointing at relevant invocly.com pages (feature
   pages, pricing) — not just piled into a "related links" list at the end.

5. **FAQ section**, minimum 6 questions, at the bottom. Each answer is 2-4 sentences,
   self-contained (answerable without reading the rest of the article). Pull real angles
   from OpenSEO's "People Also Ask" / SERP data, don't invent generic filler questions.
   This section must also be emitted as FAQPage structured data (see blog.py output
   format) — that's what earns extra SERP real estate and AI citation.

6. One natural mention of Invocly where it's genuinely relevant — not a hard sell in every
   paragraph. If the post is general educational content (e.g. "how dyslexia affects
   reading speed"), one soft mention near the end is enough.

## SEO mechanics (non-negotiable)
- Target keyword appears in: title, meta description, H1, first 100 words, one H2 minimum.
- Meta title ≤ 60 characters. Meta description ≤ 155 characters, written to earn a click,
  not just stuffed with the keyword.
- Every internal link uses natural anchor text (not "click here").
- Alt text on any referenced image describes the image content, not the keyword.

## Things to never do
- Never fabricate statistics, studies, or user counts.
- Never reproduce copyrighted text, lyrics, or long quotes from other sites.
- Never claim a feature Invocly doesn't have — check the marketing site if unsure.
- Never use the word "seamless" or "revolutionize."
