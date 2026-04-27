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
import asyncio
import datetime
import feedparser
from pathlib import Path
from slugify import slugify

from seleniumbase import SB

from google import genai
from google.genai import types


# ──────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent
POSTS_DIR = REPO_ROOT / "src" / "content" / "posts"
LOGS_DIR = REPO_ROOT / "src" / "content" / "logs"
SEO_KEYWORDS_FILE = REPO_ROOT / "scripts" / "seo_keywords.json"
PROMPT_AGENT = REPO_ROOT / "scripts" / "prompts" / "blog_agent_prompt.md"

MODEL = "gemma-4-31b-it"

PILLAR_SLUG_MAP = {
    "Startup Guides": "startup-guides",
    "Industry Trends": "industry-trends",
    "Marketing": "marketing",
    "Operations": "operations",
    "Business Strategy": "business-strategy",
    "Regulatory & Compliance": "regulatory-compliance"
}

# Google News RSS — childcare-focused query per pillar
PILLAR_RSS_QUERIES = {
    "Startup Guides": "starting+a+childcare+business",
    "Industry Trends": "childcare+industry+trends",
    "Marketing": "childcare+center+marketing+strategies",
    "Operations": "childcare+center+operations+management",
    "Business Strategy": "childcare+business+strategy",
    "Regulatory & Compliance": "childcare+regulations+compliance",
}


def get_api_key() -> str:
    key = os.getenv("GM_API_KEY")
    if not key:
        raise RuntimeError("GM_API_KEY environment variable is not set.")
    return key


def get_rss_url(pillar: str) -> dict | None:
    """Fetch the top article info (title, link) from Google News RSS."""
    # Use a broad childcare query if the pillar is too specific
    query = PILLAR_RSS_QUERIES.get(pillar, pillar)
    rss_url = f"https://news.google.com/rss/search?q={query}+childcare&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(rss_url)

    if not feed.entries:
        return None

    top_entry = feed.entries[0]
    return {
        "title": top_entry.get("title", ""),
        "link": top_entry.get("link", "")
    }


def scrape_article_text(url: str) -> str | None:
    """Use SeleniumBase UC Mode to bypass Google News redirects and Cloudflare."""
    print(f"[INFO] Launching SeleniumBase (UC Mode) for: {url}")
    try:
        # CONFIGURATION FOR CI/CD:
        # uc=True: Activates Undetected-Chromedriver mode (bypasses Google blocks)
        # use_chromium=True: Downloads/uses a pinned Chromium binary (ignores system Chrome)
        # xvfb=True: Creates a virtual display (Xvfb) ensuring bot evasion via headed browsing. 
        with SB(uc=True, use_chromium=True, xvfb=True) as sb:
            # Use uc_open_with_reconnect to bypass initial bot detection
            sb.uc_open_with_reconnect(url, reconnect_time=3)
            
            # Wait for any complex JS redirects to finish
            sb.sleep(2)
            
            # The DOM has settled.
            final_url = sb.get_current_url()
            print(f"[INFO] Reached: {final_url}")
            
            # Robust text extraction: Attempt to target the main content, 
            # falling back to the entire body. Gemini will filter out the noise.
            scraped_text = ""
            selectors = ["article", "main", ".entry-content", ".post-content", "body"]
            
            for css in selectors:
                if sb.is_element_visible(css):
                    candidate = sb.get_text(css)
                    # Keep the longest valid text block found
                    if len(candidate) > max(len(scraped_text), 300):
                        scraped_text = candidate
            
            if not scraped_text or len(scraped_text) < 200:
                print("[WARN] Scraped content too thin. Likely blocked or paywalled.")
                return None
                
            print(f"[SUCCESS] Scraped {len(scraped_text)} characters.")
            return scraped_text

    except Exception as e:
        print(f"[ERROR] SeleniumBase scraper failed: {e}")
        return None


def generate_news_path(client: genai.Client, news_text: str, source_url: str, pillar: str, date_str: str) -> str:
    """Generate a news reaction post using Path B (20% logic)."""
    system_instruction = PROMPT_AGENT.read_text(encoding="utf-8")
    pillar_slug = PILLAR_SLUG_MAP.get(pillar, "marketing")

    prompt = f"""[INPUT DATA FOR POST GENERATION]
NEWS_CONTENT: {news_text}
SCRAPED_URL: {source_url}
PILLAR: {pillar}
DATE: {date_str}
PILLAR_SLUG: {pillar_slug}
"""
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        ),
    )
    return response.text.strip()


def generate_evergreen_path(client: genai.Client, date_str: str) -> tuple[str, str]:
    """Generate an SEO-driven evergreen post using Path A (80% logic)."""
    # Load keywords
    keywords_data = json.loads(SEO_KEYWORDS_FILE.read_text())
    category = random.choice(list(keywords_data.keys()))
    keyword = random.choice(keywords_data[category])
    pillar_slug = PILLAR_SLUG_MAP.get(category, "marketing")

    system_instruction = PROMPT_AGENT.read_text(encoding="utf-8")
    
    prompt = f"""[INPUT DATA FOR POST GENERATION]
TARGET_KEYWORD: {keyword}
CATEGORY: {category}
DATE: {date_str}
PILLAR_SLUG: {pillar_slug}
"""
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        ),
    )
    return response.text.strip(), keyword


def extract_slug_from_mdx(mdx_content: str, date_str: str) -> str:
    """Extract the title from frontmatter and generate a slug from it."""
    match = re.search(r'^title:\s*"(.+?)"', mdx_content, re.MULTILINE)
    if match:
        title = match.group(1)
        return f"{date_str}-{slugify(title, max_length=60)}"
    # Fallback if title can't be extracted
    return f"{date_str}-childcare-blog-post"


def sanitize_mdx(content: str) -> str:
    """Remove AI-injected markdown code blocks and LaTeX math artifacts."""
    # 1. Strip markdown code block wrappers if the AI ignored the prompt
    # Handles ```mdx, ```markdown, ``` or any other variant
    content = content.strip()
    if content.startswith("```"):
        # Find the first newline and remove everything before it
        newline_idx = content.find("\n")
        if newline_idx != -1:
            content = content[newline_idx:].strip()
            
    if content.endswith("```"):
        content = content[:-3].strip()

    # 2. Convert LaTeX currency blocks (e.g., $\text{\$500}$) to plain text ($500)
    # This specifically targets the common pattern seen in the logs.
    content = re.sub(r"\$\\(?:text|mathrm)\{\\\$([\d,]+(?: to \\\$[\d,]+)?)\}\$", r"$\1", content)
    
    return content.strip()


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
    date_str = datetime.date.today().isoformat()
    
    # Probabilistic Logic: 25% News, 75% Evergreen. Forcing True for SB testing.
    is_news_day = random.random() < 0.25
    path_taken = "Path B (News)" if is_news_day else "Path A (Evergreen)"

    print(f"\n{'='*50}")
    print(f"  Daily Blog Bot | {date_str}")
    print(f"  Selected Mode: {path_taken}")
    print(f"{'='*50}\n")

    # Create timestamped log directory
    timestamp = datetime.datetime.now().strftime("%H-%M-%S")
    run_log_dir = LOGS_DIR / date_str / timestamp
    run_log_dir.mkdir(parents=True, exist_ok=True)

    mdx_content = ""
    log_data = {
        "date": date_str,
        "timestamp": timestamp,
        "mode": path_taken,
        "pillar": "Searching...",
        "status": "In Progress"
    }

    try:
        if is_news_day:
            # TRY PATH B: News
            pillar = random.choice(list(PILLAR_RSS_QUERIES.keys()))
            log_data["pillar"] = pillar
            rss_info = get_rss_url(pillar)
            
            if rss_info:
                text = scrape_article_text(rss_info["link"])
                if text:
                    mdx_content = generate_news_path(client, text, rss_info["link"], pillar, date_str)
                    log_data["source_url"] = rss_info["link"]
                else:
                    print("[INFO] News scrape failed. Falling back to Path A.")
                    is_news_day = False # Trigger fallback
            else:
                 print("[INFO] No news found. Falling back to Path A.")
                 is_news_day = False

        if not is_news_day:
            # PATH A: Evergreen SEO
            mdx_content, keyword = generate_evergreen_path(client, date_str)
            log_data["mode"] = "Path A (Evergreen Fallback)" if "Path B" in path_taken else "Path A (Evergreen)"
            log_data["target_keyword"] = keyword

        # Sanitize content before further processing
        mdx_content = sanitize_mdx(mdx_content)

        # Save Raw Output to logs
        with open(run_log_dir / "draft.mdx", "w") as f:
            f.write(mdx_content)
        
        # Step 4: Validate
        warnings = validate_mdx(mdx_content)
        if warnings:
            for w in warnings:
                print(f"[VALIDATION] {w}")
            log_data["warnings"] = warnings

        # Step 5: Write file
        slug = extract_slug_from_mdx(mdx_content, date_str)
        filepath = write_post(mdx_content, slug)
        
        log_data["status"] = "Success"
        log_data["output_file"] = filepath.name
        print(f"\n[SUCCESS] Generated: {filepath.name}")

    except Exception as e:
        print(f"[ERROR] Pipeline failed: {e}")
        log_data["status"] = "Failed"
        log_data["error"] = str(e)
        raise e
    finally:
        with open(run_log_dir / "manifest.json", "w") as f:
            json.dump(log_data, f, indent=2)


if __name__ == "__main__":
    main()
