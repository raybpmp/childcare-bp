"""
auto_blog.py — Daily AI Blog Post Generator
============================================
GitHub Actions calls this script daily. It:
  1. Picks a random content pillar.
  2. Pulls the top URL from a Google News RSS feed for that pillar.
  3. Pass 1: Sends the URL to Gemini (flash-lite-latest) with Search Grounding — the AI reads the page and extracts grounded facts.
  4. Pass 2: Sends the draft facts back to Gemini with the strict blog_agent_prompt.md system instruction to format into a valid .mdx file.
  5. Writes the file to src/content/posts/YYYY-MM-DD-slug.mdx.

Requirements:
  pip install google-genai feedparser python-slugify
"""

import os
import re
import json
import random
import datetime
import feedparser
from pathlib import Path
from slugify import slugify

from google import genai
from google.genai import types


# ──────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent
POSTS_DIR = REPO_ROOT / "src" / "content" / "posts"
PROMPT_FILE = Path(__file__).parent / "prompts" / "blog_agent_prompt.md"

MODEL = "gemini-flash-lite-latest"

PILLARS = [
    "Startup Guides",
    "Industry Trends",
    "Marketing",
    "Operations",
    "Business Strategy",
    "Regulatory & Compliance",
]

PILLAR_SLUG_MAP = {
    "Startup Guides": "startup-guides",
    "Industry Trends": "industry-trends",
    "Marketing": "marketing",
    "Operations": "operations",
    "Business Strategy": "business-strategy",
    "Regulatory & Compliance": "regulatory-compliance",
}

# Google News RSS — childcare-focused query per pillar
PILLAR_RSS_QUERIES = {
    "Startup Guides": "starting+a+childcare+business",
    "Industry Trends": "childcare+industry+trends+2026",
    "Marketing": "childcare+center+marketing+strategies",
    "Operations": "childcare+center+operations+management",
    "Business Strategy": "childcare+business+strategy+growth",
    "Regulatory & Compliance": "childcare+regulations+compliance+2026",
}


def get_api_key() -> str:
    key = os.getenv("GM_API_KEY")
    if not key:
        raise RuntimeError("GM_API_KEY environment variable is not set.")
    return key


def get_rss_url(pillar: str) -> str | None:
    """Fetch the top article URL from Google News RSS for a given pillar."""
    query = PILLAR_RSS_QUERIES[pillar]
    rss_url = f"https://news.google.com/rss/search?q={query}+childcare&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(rss_url)

    if not feed.entries:
        print(f"[WARN] No RSS entries found for pillar: {pillar}")
        return None

    top_entry = feed.entries[0]
    link = top_entry.get("link", "")
    print(f"[INFO] Pillar: {pillar} | Source URL: {link}")
    return link


def pass_one_research(client: genai.Client, url: str, pillar: str) -> str:
    """
    Pass 1: Use Search Grounding to read and extract facts from the source URL.
    Returns raw research notes as a string.
    """
    prompt = f"""
You are a research analyst for childcarebusinessplan.com.

Your task: Visit and read the full content of this URL: {url}

Extract all facts relevant to the following content pillar: "{pillar}" — specifically for childcare business owners in the United States.

Your output must be a structured research brief with:
- 5-8 specific, grounded facts or statistics with context (year, source, scope).
- The core argument or trend described in the source.
- Any financial figures, policy changes, or operational data mentioned.
- The user segment this most serves: "startup" (aspiring owners) or "growth" (existing owners).

Be specific. Do not paraphrase vaguely. If the source has numbers, use them.
"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=0.3,
        ),
    )

    research = response.text
    print(f"[INFO] Pass 1 complete. Research brief: {len(research)} chars.")
    return research


def pass_two_format(
    client: genai.Client, research: str, pillar: str, date_str: str
) -> str:
    """
    Pass 2: Use the strict blog_agent_prompt.md to format the research into a valid .mdx file.
    Returns the complete .mdx string ready to write to disk.
    """
    system_instruction = PROMPT_FILE.read_text(encoding="utf-8")
    pillar_slug = PILLAR_SLUG_MAP[pillar]

    prompt = f"""
Using the research brief below, write a complete .mdx blog post.

INJECT_PILLAR = "{pillar}"
INJECT_PILLAR_SLUG = "{pillar_slug}"
TODAY_DATE = "{date_str}"

---RESEARCH BRIEF---
{research}
---END RESEARCH BRIEF---

Follow your system instructions exactly. Output ONLY the raw .mdx file content. 
Start directly with the frontmatter `---` block. Do not include any explanation, preamble, or markdown code fences.
"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.5,
        ),
    )

    mdx_content = response.text.strip()

    # Strip any accidental markdown fences the model might add
    if mdx_content.startswith("```"):
        mdx_content = re.sub(r"^```[a-z]*\n?", "", mdx_content)
        mdx_content = re.sub(r"\n?```$", "", mdx_content.strip())

    print(f"[INFO] Pass 2 complete. MDX output: {len(mdx_content)} chars.")
    return mdx_content


def extract_slug_from_mdx(mdx_content: str, date_str: str) -> str:
    """Extract the title from frontmatter and generate a slug from it."""
    match = re.search(r'^title:\s*"(.+?)"', mdx_content, re.MULTILINE)
    if match:
        title = match.group(1)
        return f"{date_str}-{slugify(title, max_length=60)}"
    # Fallback if title can't be extracted
    return f"{date_str}-childcare-blog-post"


def validate_mdx(content: str) -> list[str]:
    """Basic validation checks. Returns a list of warnings."""
    warnings = []

    if "---" not in content[:10]:
        warnings.append("CRITICAL: Frontmatter block may be missing.")

    if "author: " not in content:
        warnings.append("CRITICAL: author field missing from frontmatter.")

    if "junya-herron" not in content:
        warnings.append("CRITICAL: author is not junya-herron.")

    # Check for raw HTML tags that would break Astro build
    html_tags = re.findall(r"<(?!lt;|&)[a-zA-Z][^>]*>", content)
    if html_tags:
        warnings.append(f"WARNING: Raw HTML tags found (may break build): {html_tags[:5]}")

    # Check for unescaped { which would break MDX
    if re.search(r"\{[^}]*\}", content.split("---", 2)[-1]):
        warnings.append("WARNING: Unescaped { } found in body. Verify these are intentional MDX expressions.")

    return warnings


def write_post(mdx_content: str, slug: str) -> Path:
    """Write the .mdx file to src/content/posts/."""
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    filepath = POSTS_DIR / f"{slug}.mdx"

    if filepath.exists():
        # Avoid duplicate posts on retries
        filepath = POSTS_DIR / f"{slug}-v2.mdx"

    filepath.write_text(mdx_content, encoding="utf-8")
    print(f"[INFO] Post written: {filepath}")
    return filepath


def main():
    api_key = get_api_key()
    client = genai.Client(api_key=api_key)

    pillar = random.choice(PILLARS)
    date_str = datetime.date.today().isoformat()  # YYYY-MM-DD

    print(f"\n{'='*50}")
    print(f"  Daily Blog Bot")
    print(f"  Date:   {date_str}")
    print(f"  Pillar: {pillar}")
    print(f"{'='*50}\n")

    # Step 1: Get source URL from RSS
    source_url = get_rss_url(pillar)
    if not source_url:
        print("[ERROR] Could not fetch RSS source URL. Aborting.")
        raise SystemExit(1)

    # Step 2: Pass 1 — Research
    research = pass_one_research(client, source_url, pillar)

    # Step 3: Pass 2 — Format into MDX
    mdx_content = pass_two_format(client, research, pillar, date_str)

    # Step 4: Validate
    warnings = validate_mdx(mdx_content)
    if warnings:
        for w in warnings:
            print(f"[VALIDATION] {w}")
        if any("CRITICAL" in w for w in warnings):
            print("[ERROR] Critical validation failure. Aborting to prevent broken build.")
            raise SystemExit(1)

    # Step 5: Write file
    slug = extract_slug_from_mdx(mdx_content, date_str)
    filepath = write_post(mdx_content, slug)

    print(f"\n[SUCCESS] Blog post generated: {filepath.name}")
    print(f"[INFO] Pillar: {pillar} | Model: {MODEL}")


if __name__ == "__main__":
    main()
