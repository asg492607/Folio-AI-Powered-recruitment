import os
import re
import json
import uuid
import asyncio
import datetime
import httpx
from bs4 import BeautifulSoup

# PyMuPDF is fitz, fallback to pypdf if fitz not installed
try:
    import fitz
    use_fitz = True
except ImportError:
    use_fitz = False
    from pypdf import PdfReader

# Default weights — 7-module real engine
DEFAULT_WEIGHTS = {
    "deep_analysis": 0.20,
    "skill_extractor": 0.15,
    "design_artifacts": 0.20,
    "innovation_score": 0.10,
    "project_quality": 0.15,
    "tech_depth": 0.10,
    "consistency": 0.10
}


# 1. PDF parsing using PyMuPDF (fitz)
def extract_text_from_pdf(file_path: str, job_id: str = None) -> str:
    text_content = ""
    try:
        if use_fitz:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text()
                
                # If job_id is provided, extract images on the fly and embed placeholders
                page_images_placeholders = ""
                if job_id:
                    storage_target = os.path.join("/tmp", "local_storage", job_id) if (os.path.exists("/tmp") and os.environ.get("VERCEL")) else f"local_storage/{job_id}"
                    os.makedirs(storage_target, exist_ok=True)
                    image_list = page.get_images(full=True)
                    for img_idx, img in enumerate(image_list):
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        img_filename = f"{job_id}/extracted_img_{page_num + 1}_{img_idx + 1}.{image_ext}"
                        
                        try:
                            from portfolio_app.storage import storage_client
                        except ImportError:
                            from storage import storage_client
                        url = storage_client.upload_data(image_bytes, img_filename, f"image/{image_ext}")
                        
                        if url.startswith("local_storage/"):
                            url = "/" + url
                        
                        page_images_placeholders += f"\n[IMAGE_URL: {url} CAPTION: Page {page_num + 1} Image {img_idx + 1}]\n"
                
                text_content += page_text + "\n" + page_images_placeholders + "\n"
        else:
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text_content.strip()

def extract_images_from_pdf(file_path: str, job_id: str) -> list:
    # Deprecated/Handled inline by extract_text_from_pdf to inject placeholders.
    # Return empty list to prevent duplicate logic execution
    return []

# 2. Web Scraping for LinkedIn, Behance & Portfolios (with Anti-Scraping Bypass & Discovery)
async def scrape_linkedin_content(url: str) -> tuple:
    """Dedicated resolver for LinkedIn profiles that bypasses authwalls (999/403) by discovering candidate portfolios and public search data."""
    import urllib.parse
    match = re.search(r'linkedin\.com/in/([^/?#&]+)', url)
    slug = match.group(1) if match else ''
    clean_name = ' '.join(word.capitalize() for word in re.sub(r'[^a-zA-Z0-9]', ' ', slug).split())
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    discovered_content = ""
    discovered_images = []
    discovered_links = []
    discovered_site_url = ""
    search_snippets = []
    
    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True, headers=headers) as client:
        # 1. Check personal portfolio domains
        cleaned_slug = slug.replace('-', '').replace('_', '')
        potential_domains = [
            f"https://{cleaned_slug}.in",
            f"https://{cleaned_slug}.com",
            f"https://{cleaned_slug}.dev",
            f"https://{cleaned_slug}.me",
            f"https://{cleaned_slug}.vercel.app",
            f"https://{cleaned_slug}.netlify.app",
            f"https://{slug}.in",
            f"https://{slug}.com",
            f"https://{slug}.dev",
            f"https://{slug}.me",
            f"https://{slug}.vercel.app",
            f"https://{slug}.netlify.app",
            f"https://{cleaned_slug}.design",
            f"https://{cleaned_slug}.framer.website",
            f"https://{cleaned_slug}.webflow.io",
        ]
        
        for domain in potential_domains:
            try:
                r = await client.get(domain)
                if r.status_code == 200 and len(r.text) > 1000:
                    discovered_site_url = domain
                    soup = BeautifulSoup(r.text, "html.parser")
                    
                    for img in soup.find_all("img"):
                        src = img.get("src") or img.get("data-src")
                        if src and not any(x in src.lower() for x in ["pixel", "analytics", "icon", "svg"]):
                            full_img = urllib.parse.urljoin(domain, src)
                            if full_img.startswith("http"):
                                discovered_images.append(full_img)
                                if len(discovered_images) >= 12:
                                    break
                                    
                    for a in soup.find_all("a"):
                        href = a.get("href")
                        if href and href.startswith("http") and not any(x in href.lower() for x in ["linkedin", "twitter", "facebook"]):
                            discovered_links.append(href)
                            if len(discovered_links) >= 10:
                                break
                                
                    for noise in soup(["script", "style", "nav", "header", "footer", "noscript"]):
                        noise.extract()
                    lines = (line.strip() for line in soup.get_text().splitlines())
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    discovered_content = "\n".join(chunk for chunk in chunks if chunk)
                    break
            except Exception:
                continue

        # 2. Query public search index for career highlights & bio
        try:
            query = f'"{clean_name}" linkedin OR developer OR designer OR engineer'
            r_search = await client.get(f"https://www.bing.com/search?q={urllib.parse.quote(query)}")
            if r_search.status_code == 200:
                soup = BeautifulSoup(r_search.text, "html.parser")
                for item in soup.select(".b_algo"):
                    title = item.select_one("h2")
                    snippet = item.select_one(".b_caption p")
                    t_str = title.get_text(strip=True) if title else ""
                    s_str = snippet.get_text(strip=True) if snippet else ""
                    if t_str or s_str:
                        search_snippets.append(f"- {t_str}: {s_str}")
                    if len(search_snippets) >= 6:
                        break
        except Exception:
            pass

    # Assemble structured profile context
    context = [
        f"LinkedIn Candidate Profile Intelligence",
        f"Candidate Name: {clean_name}",
        f"Profile URL: {url}",
        f"LinkedIn Handle: {slug}",
    ]
    if discovered_site_url:
        context.append(f"Discovered Personal Website & Portfolio: {discovered_site_url}")
    if search_snippets:
        context.append("\nPublic Career & Professional Highlights:")
        context.extend(search_snippets)
    if discovered_content:
        context.append(f"\nProjects & Portfolio Details:\n{discovered_content[:18000]}")
    elif not search_snippets:
        context.append(f"\nCandidate Career Profile:\nName: {clean_name}\nNote: No public profile details could be retrieved for this LinkedIn URL.")

    return "\n".join(context), discovered_images, discovered_links

async def scrape_dribbble_content(url: str) -> tuple:
    """Dedicated resolver for Dribbble portfolios and shots that bypasses Cloudflare authwalls by discovering candidate portfolios, UI designs, and public search data."""
    import urllib.parse
    slug_match = re.search(r'dribbble\.com/(?:shots/\d+-)?([^/?#&]+)', url)
    slug = slug_match.group(1) if slug_match else 'Designer'
    clean_name = ' '.join(word.capitalize() for word in re.sub(r'[^a-zA-Z0-9]', ' ', slug).split())
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    discovered_content = ""
    discovered_images = []
    discovered_links = []
    discovered_site_url = ""
    search_snippets = []
    
    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True, headers=headers) as client:
        # 1. Check personal portfolio and developer domains
        cleaned_slug = slug.replace('-', '').replace('_', '')
        potential_domains = [
            f"https://{cleaned_slug}.in",
            f"https://{cleaned_slug}.com",
            f"https://{cleaned_slug}.dev",
            f"https://{cleaned_slug}.me",
            f"https://{cleaned_slug}.vercel.app",
            f"https://{cleaned_slug}.netlify.app",
            f"https://{slug}.in",
            f"https://{slug}.com",
            f"https://{slug}.dev",
            f"https://{slug}.me",
            f"https://{slug}.vercel.app",
            f"https://{slug}.netlify.app",
        ]
        
        for domain in potential_domains:
            try:
                r = await client.get(domain)
                if r.status_code == 200 and len(r.text) > 1000:
                    discovered_site_url = domain
                    soup = BeautifulSoup(r.text, "html.parser")
                    
                    for img in soup.find_all("img"):
                        src = img.get("src") or img.get("data-src")
                        if src and not any(x in src.lower() for x in ["pixel", "analytics", "icon", "svg"]):
                            full_img = urllib.parse.urljoin(domain, src)
                            if full_img.startswith("http"):
                                discovered_images.append(full_img)
                                if len(discovered_images) >= 12:
                                    break
                                    
                    for a in soup.find_all("a"):
                        href = a.get("href")
                        if href and href.startswith("http") and not any(x in href.lower() for x in ["linkedin", "twitter", "facebook"]):
                            discovered_links.append(href)
                            if len(discovered_links) >= 10:
                                break
                                
                    for noise in soup(["script", "style", "nav", "header", "footer", "noscript"]):
                        noise.extract()
                    lines = (line.strip() for line in soup.get_text().splitlines())
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    discovered_content = "\n".join(chunk for chunk in chunks if chunk)
                    break
            except Exception:
                continue

        # 1b. Read the actual Dribbble page the user submitted (falls back to a reader proxy when blocked)
        dribbble_page = await _fetch_page(client, url)
        if dribbble_page["text"]:
            discovered_images = (dribbble_page["images"] + discovered_images)[:12]

        # 2. Query public search for Dribbble design works & portfolio
        try:
            query = f'"{clean_name}" dribbble OR "UI/UX" OR "Product Designer" OR "Visual Design"'
            r_search = await client.get(f"https://www.bing.com/search?q={urllib.parse.quote(query)}")
            if r_search.status_code == 200:
                soup = BeautifulSoup(r_search.text, "html.parser")
                for item in soup.select(".b_algo"):
                    title = item.select_one("h2")
                    snippet = item.select_one(".b_caption p")
                    t_str = title.get_text(strip=True) if title else ""
                    s_str = snippet.get_text(strip=True) if snippet else ""
                    if t_str or s_str:
                        search_snippets.append(f"- {t_str}: {s_str}")
                    if len(search_snippets) >= 6:
                        break
        except Exception:
            pass

    context = [
        f"Dribbble Design Portfolio Intelligence",
        f"Designer Name: {clean_name}",
        f"Dribbble Profile / Shot URL: {url}",
    ]
    if dribbble_page["text"]:
        context.append(f"\nDribbble Page Content:\n{dribbble_page['text'][:12000]}")
    if discovered_site_url:
        context.append(f"Discovered Designer Website & Case Studies: {discovered_site_url}")
    if search_snippets:
        context.append("\nDesign Works & Public Highlights:")
        context.extend(search_snippets)
    if discovered_content:
        context.append(f"\nProjects & Portfolio Details:\n{discovered_content[:18000]}")
    elif not search_snippets and not dribbble_page["text"]:
        context.append(f"\nCandidate Design Profile:\nName: {clean_name}\nNote: No public profile details could be retrieved for this Dribbble URL.")

    return "\n".join(context), discovered_images, discovered_links

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

_IMAGE_NOISE = ["pixel", "analytics", "icon", "svg", "avatar", "logo", "sprite", "tracker", "blank", "spacer"]
_NAV_NOISE = {
    "sign in", "sign up", "explore", "jobs", "resources", "hire", "share work", "more behance", "careers at behance",
    "download on the app store", "get it on google play", "log in", "login", "follow", "following", "message",
    "appreciate", "save", "share", "report", "cookie preferences", "privacy", "terms of use", "search", "adobe",
}


def _clean_markdown(md: str) -> str:
    """Turns reader-proxy markdown into plain text (drops images, link targets and nav chrome)."""
    md = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', md)
    md = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', md)
    out, prev = [], ""
    for raw in md.splitlines():
        line = re.sub(r'^[\*\-\s#>]+', '', raw).strip()
        if len(line) < 3 or line.lower() in _NAV_NOISE:
            continue
        if line.startswith(("URL Source:", "Markdown Content:", "Title:")):
            continue
        if line == prev:
            continue
        out.append(line)
        prev = line
    return "\n".join(out)


_BOILERPLATE_PHRASES = (
    "to view personalized recommendations", "follow creatives", "sign up with", "continue with google",
    "continue with facebook", "continue with apple", "by signing up", "already have an account",
    "forgot password", "cookie preferences", "do not sell or share", "download on the app store",
    "get it on google play", "try behance pro", "more behance", "careers at behance", "terms of use",
    "adobe portfolio", "view all comments", "add a comment", "report project", "copy link",
    "just a moment", "enable javascript", "checking your browser",
)


def _html_to_text(soup) -> str:
    """Readable, newline-separated page text with site chrome removed (keeps fields like name / degree / location on separate lines)."""
    for noise in soup(["script", "style", "nav", "header", "footer", "noscript", "svg", "form", "button"]):
        noise.extract()
    out, prev = [], ""
    for raw in soup.get_text("\n").splitlines():
        line = re.sub(r'\s+', ' ', raw).strip()
        low = line.lower()
        if not line or low in _NAV_NOISE or any(p in low for p in _BOILERPLATE_PHRASES):
            continue
        if line == prev:
            continue
        out.append(line)
        prev = line
    return "\n".join(out)


def _fetch_html_robust(url: str) -> str:
    """Fallback fetcher using curl with browser TLS & challenge resolution, with proxy fallback."""
    import subprocess
    import urllib.parse
    
    # 1. Try curl with browser headers and automatic cookie handshake
    try:
        cmd1 = [
            "curl", "-s", "-L", "-i",
            "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            url
        ]
        res1 = subprocess.run(cmd1, capture_output=True, text=True, timeout=12)
        html = res1.stdout
        
        if "js_challenge_value=" in html or "set-cookie:" in html.lower():
            cookies = []
            for m in re.finditer(r"set-cookie:\s*([^;\r\n]+)", html, re.IGNORECASE):
                cookies.append(m.group(1).strip())
            js_m = re.search(r"js_challenge_value=([^;\s\"]+)", html)
            if js_m:
                cookies.append(f"js_challenge_value={js_m.group(1)}")
            if cookies:
                cookie_header = "; ".join(cookies)
                cmd2 = [
                    "curl", "-s", "-L",
                    "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "-H", f"Cookie: {cookie_header}",
                    url
                ]
                res2 = subprocess.run(cmd2, capture_output=True, text=True, timeout=12)
                if len(res2.stdout) > 400:
                    return res2.stdout
        if len(html) > 400 and not ("<title>Just a moment..." in html and "challenges.cloudflare.com" in html):
            return html
    except Exception:
        pass

    # 2. Try allorigins proxy
    try:
        q = urllib.parse.quote(url, safe="")
        cmd_proxy = ["curl", "-s", "-L", "https://api.allorigins.win/raw?url=" + q]
        res_proxy = subprocess.run(cmd_proxy, capture_output=True, text=True, timeout=12)
        if len(res_proxy.stdout) > 400:
            return res_proxy.stdout
    except Exception:
        pass

    return ""


async def _fetch_page(client: httpx.AsyncClient, url: str, use_reader: bool = True) -> dict:
    """
    Loads a page and returns {title, text, images, links, via}.
    Tries a direct request first, then reader proxy, then robust curl/proxy fallback.
    """
    import urllib.parse
    result = {"title": "", "text": "", "images": [], "links": [], "via": ""}

    try:
        r = await client.get(url)
        if r.status_code == 200 and len(r.text) > 1500:
            soup = BeautifulSoup(r.text, "html.parser")
            og = soup.find("meta", attrs={"property": "og:title"})
            title = (og.get("content", "").strip() if og else "") or (soup.title.string.strip() if soup.title and soup.title.string else "")
            images = []
            for img in soup.find_all("img"):
                src = img.get("src") or img.get("data-src")
                if src and not any(x in src.lower() for x in _IMAGE_NOISE):
                    full = urllib.parse.urljoin(url, src)
                    if full.startswith("http") and full not in images:
                        images.append(full)
            links = [urllib.parse.urljoin(url, a["href"]) for a in soup.find_all("a", href=True)]
            text = _html_to_text(soup)
            if len(text) > 300:
                result.update(title=title, text=text, images=images[:12], links=links, via="direct")
                return result
    except Exception:
        pass

    if use_reader:
        try:
            rr = await client.get(f"https://r.jina.ai/{url}", timeout=25.0, headers={"Accept": "text/plain"})
            if rr.status_code == 200 and len(rr.text) > 300 and "Just a moment..." not in rr.text:
                md = rr.text
                tm = re.search(r'^Title:\s*(.+)$', md, re.MULTILINE)
                images = []
                for img_url in re.findall(r'!\[[^\]]*\]\((https?://[^)\s]+)\)', md):
                    if not any(x in img_url.lower() for x in _IMAGE_NOISE) and img_url not in images:
                        images.append(img_url)
                links = re.findall(r'\]\((https?://[^)\s]+)\)', md)
                text = _clean_markdown(md)
                if len(text) > 100:
                    result.update(
                        title=(tm.group(1).strip() if tm else ""),
                        text=text, images=images[:12], links=links, via="reader"
                    )
                    return result
        except Exception:
            pass

    # 3. Robust curl / proxy fallback
    try:
        raw_html = await asyncio.to_thread(_fetch_html_robust, url)
        if raw_html and len(raw_html) > 400:
            soup = BeautifulSoup(raw_html, "html.parser")
            og = soup.find("meta", attrs={"property": "og:title"})
            title = (og.get("content", "").strip() if og else "") or (soup.title.string.strip() if soup.title and soup.title.string else "")
            
            meta_desc_tag = soup.find("meta", {"name": "description"}) or soup.find("meta", {"property": "og:description"})
            meta_desc = meta_desc_tag.get("content", "").strip() if meta_desc_tag else ""
            
            images = []
            for img in soup.find_all("img"):
                src = img.get("src") or img.get("data-src")
                if src and ("project_modules" in src or "mir-s3-cdn-cf.behance.net" in src or not any(x in src.lower() for x in _IMAGE_NOISE)):
                    full = urllib.parse.urljoin(url, src)
                    if full.startswith("http") and full not in images:
                        images.append(full)
                        
            links = [urllib.parse.urljoin(url, a["href"]) for a in soup.find_all("a", href=True)]
            
            text = _html_to_text(soup)

            generic_meta = (not meta_desc) or meta_desc.lower().endswith("on behance") or meta_desc.lower().endswith("on dribbble")
            if not generic_meta and meta_desc[:60] not in text:
                text = f"{meta_desc}\n\n{text}"
                
            if len(text) > 100:
                result.update(title=title, text=text, images=images[:15], links=links, via="robust_curl")
                return result
    except Exception:
        pass

    return result


async def scrape_behance_content(url: str) -> tuple:
    """
    Behance resolver. Reads the real profile / project page (and the projects listed on a profile)
    and returns only what is actually on the page.
    """
    import urllib.parse
    target = url.strip()
    if not target.startswith(("http://", "https://")):
        target = f"https://{target}"

    gallery_match = re.search(r'behance\.net/gallery/(\d+)', target)
    own_id = gallery_match.group(1) if gallery_match else ""
    is_gallery = bool(gallery_match)

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True, headers=BROWSER_HEADERS) as client:
        page = await _fetch_page(client, target)
        if not page["text"]:
            return "", [], []

        project_links = []
        for link in page["links"]:
            clean_link = link.split("?")[0]
            m = re.match(r'(https?://(?:www\.)?behance\.net/gallery/(\d+)/?[^\s?#)\]"]*)', clean_link)
            if m:
                gid = m.group(2)
                if gid != own_id and m.group(1) not in project_links:
                    project_links.append(m.group(1))

        sub_pages = []
        if not is_gallery and project_links:
            fetched = await asyncio.gather(*[_fetch_page(client, p) for p in project_links[:5]])
            sub_pages = [(link, sp) for link, sp in zip(project_links[:5], fetched) if sp["text"]]

    def _behance_images(imgs: list) -> list:
        keep = [i for i in imgs if "behance.net" in i and ("project_modules" in i or "/projects/" in i or "/project_covers/" in i)]
        return keep or []

    raw_title = page["title"].replace("on Behance", "").replace(":: Behance", "").strip(" |-")

    # Name / headline / location from the page title, e.g. "_Disha _ - M.Des Design Management in India"
    designer_name, designer_role, designer_location = raw_title, "", ""
    if " - " in raw_title and not is_gallery:
        designer_name, rest = [p.strip() for p in raw_title.split(" - ", 1)]
        if " in " in rest:
            designer_role, designer_location = [p.strip() for p in rest.rsplit(" in ", 1)]
        else:
            designer_role = rest
    elif is_gallery and " by " in raw_title:
        designer_name = raw_title.rsplit(" by ", 1)[-1].strip()

    # Structured facts from the profile block (lines are now separated)
    profile_lines = [l for l in page["text"].splitlines() if l.strip()]
    facts = []
    for l in profile_lines[:30]:
        low = l.lower()
        if low.startswith(("available for", "open to")) or re.match(r'^(project views|appreciations|followers|following)\b', low):
            facts.append(l)
    stats = {}
    flat = " ".join(profile_lines[:60])
    for label in ("Project Views", "Appreciations", "Followers", "Following"):
        m = re.search(label + r'\s*[:\n ]?\s*([\d,\.]+[KkMm]?)', flat)
        if m:
            stats[label] = m.group(1)
    institution = ""
    if designer_role:
        try:
            idx = next(i for i, l in enumerate(profile_lines) if designer_role.lower() in l.lower())
            if idx + 1 < len(profile_lines):
                nxt = profile_lines[idx + 1]
                if len(nxt) < 80 and nxt.lower() not in (designer_location.lower(), "follow", "message"):
                    institution = nxt
        except StopIteration:
            pass

    context = [
        "Behance Portfolio Content",
        f"Source URL: {target}",
        f"Page Title: {page['title']}",
        f"Designer Name: {designer_name}",
    ]
    if designer_role:
        context.append(f"Designer Headline / Role: {designer_role}")
    if institution:
        context.append(f"Institution / Company: {institution}")
    if designer_location:
        context.append(f"Location: {designer_location}")
    if facts:
        context.append("Availability: " + "; ".join(f for f in facts if f.lower().startswith(("available", "open"))))
    if stats:
        context.append("Behance stats: " + ", ".join(f"{k} {v}" for k, v in stats.items()))

    context.append(f"\nPage Content:\n{page['text'][:8000]}")
    images = _behance_images(page["images"])
    for link, sp in sub_pages:
        sub_title = sp['title'].replace(":: Behance", "").replace("on Behance", "").strip(" |-") or link
        sub_imgs = _behance_images(sp["images"])[:4]
        img_markers = "\n".join(f"[IMAGE_URL: {u}]" for u in sub_imgs)
        context.append(f"\n--- Behance Project: {sub_title} ({link}) ---\n{sp['text'][:4500]}\n{img_markers}")
        for img in sub_imgs:
            if img not in images:
                images.append(img)

    return "\n".join(context), images[:20], project_links[:15]


async def scrape_url_content(url: str) -> tuple:
    clean_url = url.strip()
    
    # 1. If URL is a Behance portfolio or gallery, use dedicated Behance resolver
    if "behance.net" in clean_url.lower():
        return await scrape_behance_content(clean_url)
    # 2. If URL is a Dribbble profile or shot, use dedicated Dribbble resolver
    if "dribbble.com" in clean_url.lower():
        return await scrape_dribbble_content(clean_url)
    # 3. If URL is a LinkedIn profile, use dedicated LinkedIn resolver
    if "linkedin.com" in clean_url.lower():
        return await scrape_linkedin_content(clean_url)

    # Ensure URL has protocol
    target_url = clean_url
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = f"https://{target_url}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True, headers=headers) as client:
            response = await client.get(target_url)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Extract image URLs
                images = []
                for img_tag in soup.find_all("img"):
                    src = img_tag.get("src") or img_tag.get("data-src") or img_tag.get("data-hi-res") or img_tag.get("srcset")
                    alt = img_tag.get("alt") or ""
                    if src:
                        if "," in src:
                            src = src.split(",")[0].strip().split(" ")[0]
                        from urllib.parse import urljoin
                        absolute_url = urljoin(target_url, src)
                        if absolute_url.startswith("http") and not any(x in absolute_url.lower() for x in ["pixel", "analytics", "tracker", "sprite", "logo", "icon", "svg"]):
                            images.append(absolute_url)
                            placeholder = soup.new_tag("p")
                            placeholder.string = f"\n[IMAGE_URL: {absolute_url} CAPTION: {alt}]\n"
                            img_tag.insert_after(placeholder)
                            if len(images) >= 15:
                                break
                
                # Extract links & discover design project subpages
                links = []
                internal_project_urls = []
                from urllib.parse import urljoin, urlparse
                base_domain = urlparse(target_url).netloc

                for a_tag in soup.find_all("a", href=True):
                    href = a_tag["href"].strip()
                    if not href:
                        continue
                    absolute_url = urljoin(target_url, href)
                    if absolute_url.startswith("http") and not any(x in absolute_url.lower() for x in ["facebook", "twitter", "instagram", "youtube", "pinterest", "reddit"]):
                        links.append(absolute_url)
                        # Check for internal design project subpages
                        parsed_link = urlparse(absolute_url)
                        if parsed_link.netloc == base_domain and parsed_link.path and parsed_link.path != "/":
                            if any(kw in parsed_link.path.lower() for kw in ["project", "work", "case-study", "portfolio", "design", "ui", "ux"]):
                                if absolute_url not in internal_project_urls and absolute_url != target_url:
                                    internal_project_urls.append(absolute_url)

                # Extract meta description & title
                meta_desc = ""
                meta_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
                if meta_tag:
                    meta_desc = meta_tag.get("content", "").strip()

                og_title = ""
                og_title_tag = soup.find("meta", attrs={"property": "og:title"})
                if og_title_tag:
                    og_title = og_title_tag.get("content", "").strip()

                # Extract text contents
                for noise in soup(["script", "style", "nav", "footer", "aside", "noscript"]):
                    noise.extract()
                
                lines = (line.strip() for line in soup.get_text().splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                main_text = "\n".join(chunk for chunk in chunks if chunk)
                title = og_title or (soup.title.string if soup.title else "Design Portfolio")
                
                context_blocks = [
                    f"Source Design Portfolio URL: {target_url}",
                    f"Title: {title}"
                ]
                if meta_desc:
                    context_blocks.append(f"Meta Description / Summary: {meta_desc}")
                context_blocks.append(f"Main Portfolio Case Study Content:\n{main_text[:14000]}")

                # Crawl discovered internal design project pages in parallel
                if internal_project_urls:
                    async def fetch_subpage(sub_url: str) -> str:
                        try:
                            sub_res = await client.get(sub_url, timeout=8.0)
                            if sub_res.status_code == 200:
                                sub_soup = BeautifulSoup(sub_res.text, "html.parser")
                                for n in sub_soup(["script", "style", "nav", "footer"]):
                                    n.extract()
                                sub_lines = (l.strip() for l in sub_soup.get_text().splitlines())
                                sub_chunks = (p.strip() for p in sub_lines for p in p.split("  "))
                                sub_text = "\n".join(c for c in sub_chunks if c)
                                sub_title = sub_soup.title.string if sub_soup.title else sub_url
                                return f"\n--- Design Case Study Subpage: {sub_title} ({sub_url}) ---\n{sub_text[:3500]}"
                        except Exception:
                            pass
                        return ""

                    sub_tasks = [fetch_subpage(u) for u in internal_project_urls[:5]]
                    sub_results = await asyncio.gather(*sub_tasks)
                    for r in sub_results:
                        if r:
                            context_blocks.append(r)

                return "\n\n".join(context_blocks), images, links
            else:
                fallback = await _fetch_page(client, target_url)
                if fallback["text"]:
                    blocks = [
                        f"Source Design Portfolio URL: {target_url}",
                        f"Title: {fallback['title']}",
                        f"Main Portfolio Case Study Content:\n{fallback['text'][:14000]}",
                    ]
                    return "\n\n".join(blocks), fallback["images"], fallback["links"][:15]
                return "", [], []
    except Exception as e:
        print(f"[scrape_url_content] Error scraping {target_url}: {e}")
        return "", [], []


# 3. Figma API Parser (Enhanced to extract Structural Design Artifact Signals)
def extract_figma_file_key(url: str) -> str:
    """Extract 22-character alpha-numeric Figma key from URL."""
    match = re.search(r'/(?:file|design)/([a-zA-Z0-9]{22,})', url)
    return match.group(1) if match else None

async def parse_figma_content(url: str) -> str:
    file_key = extract_figma_file_key(url)
    if not file_key:
        return f"Figma URL: {url}\nError: Could not extract Figma File Key from the URL."

    token = os.getenv("FIGMA_ACCESS_TOKEN")
    if not token:
        # Graceful fallback: simulate file layout information
        return f"Figma URL: {url}\nFile Key: {file_key}\nWarning: FIGMA_ACCESS_TOKEN is missing. Fallback to mock Figma structural parsing.\nNodes: [Text Node: 'Hero Header', Frame Node: 'Mockup Screen Desktop', Text Node: 'Portfolio Projects', Component Node: 'Card component', Style: 'Inter 14px Regular', Colors: ['#0f172a', '#38bdf8', '#ffffff']]"

    try:
        headers = {"X-Figma-Token": token}
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(f"https://api.figma.com/v1/files/{file_key}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                
                text_layers = []
                detected_artifacts = set()
                styles_count = len(data.get("styles", {}))
                components_count = len(data.get("components", {}))
                
                # Mapping of figma layer names to design artifacts (to help AI evaluate with 100% accuracy)
                artifact_indicators = {
                    "wireframe": "Wireframe / Lo-fi Screen",
                    "user flow": "User Flow / Journey Map",
                    "prototype": "Interactive Prototype",
                    "persona": "User Persona Profile",
                    "moodboard": "Inspiration Moodboard",
                    "style guide": "Style Guide / Token Sheet",
                    "design system": "Design System Library",
                    "mockup": "Hi-fi Mockup Screen",
                    "usability": "Usability Testing Results"
                }

                # Helper to traverse Figma JSON Document Nodes
                def traverse_nodes(node):
                    node_name = str(node.get("name", "")).lower()
                    
                    # Inspect layer name to check if it matches design artifacts
                    for keyword, tag in artifact_indicators.items():
                        if keyword in node_name:
                            detected_artifacts.add(tag)

                    if node.get("type") == "TEXT":
                        char_text = node.get("characters", "").strip()
                        if char_text:
                            text_layers.append(char_text)
                    if "children" in node:
                        for child in node["children"]:
                            traverse_nodes(child)

                if "document" in data:
                    traverse_nodes(data["document"])

                compiled_text = "\n".join(text_layers[:400]) # Cap to avoid huge string sizes
                artifacts_str = ", ".join(detected_artifacts) if detected_artifacts else "None directly labeled in frame hierarchy"
                
                return f"Figma File: {data.get('name', 'Unnamed')}\nComponents count: {components_count}\nStyles count: {styles_count}\nStructural Artifact Signals: [{artifacts_str}]\nContent:\n{compiled_text}"
            else:
                return f"Figma API error. Status: {response.status_code}. Detail: {response.text}"
    except Exception as e:
        return f"Error calling Figma API: {str(e)}"

# 4. Generate Embeddings (Optional Vector representation)
async def generate_text_embedding(text: str) -> list:
    """Generate embedding vector (returns dummy vector to remove external API dependency)."""
    # Dummy embedding fallback matching Qdrant size
    import random
    return [random.uniform(-0.1, 0.1) for _ in range(768)]

# Heuristics local engine fallback
try:
    from portfolio_app.analyzer_heuristics import run_heuristic_analysis
except ImportError:
    try:
        from unified_backend.portfolio_app.analyzer_heuristics import run_heuristic_analysis
    except ImportError:
        try:
            from analyzer_heuristics import run_heuristic_analysis
        except ImportError:
            from .analyzer_heuristics import run_heuristic_analysis

def run_ai_analysis(text: str, filename: str, images: list = None, links: list = None) -> dict:
    """Runs high-fidelity data extraction using Gemini, Groq, or fallback heuristics."""
    from openai import OpenAI

    prompt = f"""
    You are Portfolio Ingestion Agent — an expert design-recruiter analyst. You read a DESIGNER's portfolio (Behance, Dribbble, Figma, LinkedIn, personal site or PDF) and turn it into a precise, richly detailed candidate profile.
    Everything you output must come from the portfolio text below. Do not rate, score, review or grade anything.

    CRITICAL RULES:
    1. Extract EVERY real project / case study in the text (do not stop at 1-2). Use the project's real title exactly as written.
    2. For each project write a substantive `details` paragraph (3-5 sentences) in your own words summarising: the context/client, the problem or brief, the approach/process, and what was produced — using only facts present in that project's text.
    3. Fill `challenges` (the problem / brief / insight) and `outcomes` (deliverables, frameworks, findings, results) whenever the project text states them. Use null only if truly absent.
    4. `role`, `client_or_organization`, `timeline`, `team_size`: fill only if stated or clearly implied by the text (e.g. 'Service Design at VHC' -> client 'VHC'). Otherwise null.
    5. `type`: classify the project as a designer would (e.g. 'Service Design', 'Brand Strategy', 'Mobile App UX/UI', 'Design Research', 'Futures / Foresight', 'Branding & Identity', 'Motion', 'Packaging', 'Design System').
    6. `summary`: 3-4 sentence professional bio of the designer built from their headline, education/company, location, availability and the nature of their projects. Never copy raw page text, UI labels, statistics or navigation text.
    7. `skills.design_tools`: only real software/tools explicitly named (Figma, Illustrator, Miro, After Effects...). `skills.methodologies_and_processes`: design methods evidenced in the projects (user research, thematic analysis, journey mapping, service blueprinting, foresight, brand positioning, prototyping...). `skills.soft_skills`: only those clearly demonstrated.
    8. `industries`: industries the projects are actually about (e.g. 'Automotive', 'Art & Culture', 'Beauty & Personal Care', 'Water & Infrastructure'). `strengths`: 3-5 concise strengths evidenced by the work.
    9. `target_roles`: 1-3 realistic design roles that fit the evidenced work (e.g. 'Service Designer', 'Design Researcher', 'Brand Strategist'). `headline`: the designer's own headline/degree/title from the text.
    10. Do NOT invent facts, companies, tools or numbers. Do not treat third-party brands as the candidate's employers unless stated. If something is not in the text use null or an empty list.
    11. Inline markers like `[IMAGE_URL: <url>]` inside a project block belong to that project: put them in that project's `images`.
    12. The candidate name is the person who owns the portfolio (see 'Designer Name' / page title), never a project name.

    Source Context: {filename}

    Portfolio text content:
    ---
    {text[:24000]}
    ---

    Return a JSON object matching EXACTLY this structure. Output only valid JSON — no markdown, no preambles:
    {{
      "report_id": "unique-uuid",
      "candidate_id": "CAN-XXXXXX",
      "generated_at": "ISO-TIMESTAMP",
      "full_name": "candidate full name or empty string if not found",
      "headline": "candidate professional headline or role title",
      "summary": "a brief professional summary/bio summarizing their background",
      "target_roles": ["1 to 3 primary target roles for candidate"],
      "years_experience": float or null for years of experience,
      "industries": ["list of industries they worked in or design for"],
      "strengths": ["list of candidate's core strengths/qualities"],
      "tools": ["list of tools/technologies mentioned in the portfolio"],
      "skills": {{
        "design_tools": ["Design software, tools, and visual technical capabilities"],
        "methodologies_and_processes": ["Design methodologies, frameworks, UX research methods, design thinking, and workflow processes"],
        "soft_skills": ["Demonstrated soft skills extracted from project descriptions"]
      }},
      "design_artifacts": {{
        "artifacts_found": ["identified design artifacts e.g. wireframes, mockups, case studies, user flows, prototypes, design systems, style guides"],
        "artifacts_missing": ["expected design artifacts not found in the content"]
      }},
      "projects": [
        {{ 
          "name": "project name", 
          "type": "type of project, e.g. Mobile App, E-Commerce Website, Digital Headquarters", 
          "role": "candidate's specific title and level of contribution on this project",
          "client_or_organization": "the company, client, or organization the project was built for, or null",
          "timeline": "project duration or dates, or null",
          "team_size": "the number of people on the team, e.g. 'Solo builder', 'Team of 4', or null",
          "details": "detailed description of the project scope, background context, and problem statement (2-3 sentences)",
          "technologies": ["specific tools, libraries, or technologies used specifically to build/design this project"],
          "challenges": "what major technical, design, or collaboration challenges they faced and how they resolved them",
          "outcomes": "key results, impact, user feedback, or deliverables of the project",
          "images": ["list of matching IMAGE_URL strings found in the text for this project"]
        }}
      ]
    }}
    """

    try:
        from dotenv import load_dotenv
        _cur_dir = os.path.dirname(os.path.abspath(__file__))
        load_dotenv(os.path.join(_cur_dir, ".env"))
        load_dotenv(os.path.join(os.path.dirname(_cur_dir), ".env"))
        load_dotenv(os.path.join(os.path.dirname(os.path.dirname(_cur_dir)), ".env"))
        load_dotenv(os.path.join("/tmp", ".env"))
        load_dotenv()
    except Exception:
        pass

    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    configured_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    candidate_models = [configured_model, "gemini-3.5-flash-lite", "gemini-3.8-flash"]
    # Deduplicate while preserving order
    models_to_try = list(dict.fromkeys(candidate_models))

    # Primary: Google Gemini API
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key, http_options={"timeout": 40000})
            
            for m in models_to_try:
                try:
                    response = client.models.generate_content(
                        model=m,
                        contents=prompt,
                        config={"response_mime_type": "application/json", "temperature": 0.2}
                    )
                    clean_text = response.text.strip()
                    match = re.search(r'\{[\s\S]*\}', clean_text)
                    if match:
                        clean_text = match.group(0)
                    result = json.loads(clean_text)
                    if "candidate_id" not in result or not result["candidate_id"]:
                        result["candidate_id"] = f"CAN-{str(uuid.uuid4())[:8].upper()}"
                    if "report_id" not in result or not result["report_id"]:
                        result["report_id"] = str(uuid.uuid4())
                    if "generated_at" not in result or not result["generated_at"]:
                        result["generated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
                    result["analysis_engine"] = f"gemini:{m}"
                    print(f"[Gemini API] Successfully analyzed portfolio using model: {m}")
                    return sync_project_skills_to_profile(result)
                except Exception as e:
                    print(f"[Gemini API] Model {m} returned error: {e}. Trying next model...")
        except Exception as e:
            print(f"[Gemini API] Client initialization error: {e}")

    # Secondary: Groq LLM API
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key:
        groq_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]
        try:
            from openai import OpenAI
            groq_client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key, timeout=40.0)
            for gm in groq_models:
                try:
                    chat_resp = groq_client.chat.completions.create(
                        model=gm,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.2,
                        response_format={"type": "json_object"}
                    )
                    raw_content = chat_resp.choices[0].message.content.strip()
                    match = re.search(r'\{[\s\S]*\}', raw_content)
                    if match:
                        raw_content = match.group(0)
                    result = json.loads(raw_content)
                    if "candidate_id" not in result or not result["candidate_id"]:
                        result["candidate_id"] = f"CAN-{str(uuid.uuid4())[:8].upper()}"
                    if "report_id" not in result or not result["report_id"]:
                        result["report_id"] = str(uuid.uuid4())
                    if "generated_at" not in result or not result["generated_at"]:
                        result["generated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
                    result["analysis_engine"] = f"groq:{gm}"
                    print(f"[Groq API] Successfully analyzed portfolio using model: {gm}")
                    return sync_project_skills_to_profile(result)
                except Exception as e:
                    print(f"[Groq API] Model {gm} returned error: {e}. Trying next model...")
        except Exception as e:
            print(f"[Groq API] Client initialization error: {e}")

    print("[Portfolio Analyzer] AI APIs unavailable. Falling back to local heuristic extraction engine.")
    fallback_result = run_heuristic_analysis(text, filename, images=images)
    fallback_result["analysis_engine"] = "heuristic"
    return sync_project_skills_to_profile(fallback_result)


def sync_project_skills_to_profile(report: dict) -> dict:
    """Extracts skills and technologies from each project and updates them in the main skills and tools sections."""
    if not report or not isinstance(report, dict):
        return report

    # Ensure sections exist
    if "skills" not in report or not isinstance(report["skills"], dict):
        report["skills"] = {"design_tools": [], "methodologies_and_processes": [], "soft_skills": []}
    
    skills = report["skills"]
    if "design_tools" not in skills:
        skills["design_tools"] = []
    if "methodologies_and_processes" not in skills:
        skills["methodologies_and_processes"] = []
    if "soft_skills" not in skills:
        skills["soft_skills"] = []
        
    if "tools" not in report or not isinstance(report["tools"], list):
        report["tools"] = []
        
    tools_set = {t.strip().lower(): t for t in report["tools"]}
    design_tools_set = {t.strip().lower(): t for t in skills.get("design_tools", [])}
    methodologies_set = {m.strip().lower(): m for m in skills.get("methodologies_and_processes", [])}
    soft_skills_set = {s.strip().lower(): s for s in skills.get("soft_skills", [])}
    
    # Predefined keyword matching lists for mapping project skills to correct subcategories
    design_tool_keywords = [
        "figma", "sketch", "photoshop", "illustrator", "adobe xd", "invision", "miro", "canva", "zeplin", "framer",
        "procreate", "indesign", "after effects", "premiere", "xd", "figjam", "spline", "blender", "cinema 4d",
        "principle", "lottie", "webflow", "proto.io", "balsamiq", "marvel", "axure", "fable", "rive"
    ]
    methodology_keywords = [
        "user research", "wireframing", "prototyping", "usability testing", "agile", "scrum", "design thinking", 
        "information architecture", "persona", "user flows", "journey mapping", "storyboarding", "card sorting", 
        "heuristic evaluation", "site mapping", "user testing", "ab testing", "a/b testing", "affinity diagramming",
        "ux research", "ui design", "product design", "interaction design", "visual design", "branding", "packaging"
    ]
    soft_skill_keywords = [
        "communication", "collaboration", "leadership", "problem solving", "time management", "adaptability", 
        "critical thinking", "teamwork", "empathy", "facilitation", "presentation", "stakeholder management"
    ]

    projects = report.get("projects", [])
    if isinstance(projects, list):
        for proj in projects:
            if not isinstance(proj, dict):
                continue
            
            # Technologies/Skills explicitly listed in project
            proj_techs = proj.get("technologies", [])
            if isinstance(proj_techs, list):
                for tech in proj_techs:
                    if not isinstance(tech, str) or not tech.strip():
                        continue
                    
                    tech_clean = tech.strip()
                    tech_lower = tech_clean.lower()
                    
                    # Update global tools list
                    if tech_lower not in tools_set:
                        tools_set[tech_lower] = tech_clean
                        
                    # Classify into specific skills categories
                    # 1. Methodology Check
                    if any(kw in tech_lower for kw in methodology_keywords):
                        if tech_lower not in methodologies_set:
                            methodologies_set[tech_lower] = tech_clean
                    # 2. Soft Skill Check
                    elif any(kw in tech_lower for kw in soft_skill_keywords):
                        if tech_lower not in soft_skills_set:
                            soft_skills_set[tech_lower] = tech_clean
                    # 3. Default to Design Tools / Capabilities
                    else:
                        if tech_lower not in design_tools_set:
                            design_tools_set[tech_lower] = tech_clean

    # Reassign updated and deduplicated lists back to report
    report["tools"] = list(tools_set.values())
    skills["design_tools"] = list(design_tools_set.values())
    skills["methodologies_and_processes"] = list(methodologies_set.values())
    skills["soft_skills"] = list(soft_skills_set.values())
    
    return report



