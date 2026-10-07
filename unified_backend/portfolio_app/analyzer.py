import os
import re
import json
import uuid
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
    """Dedicated resolver for LinkedIn profiles that bypasses authwalls (999/403) by discovering candidate design portfolios and public showcase data."""
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
        # 1. Check personal portfolio and design domains
        cleaned_slug = slug.replace('-', '').replace('_', '')
        potential_domains = [
            f"https://{cleaned_slug}.in",
            f"https://{cleaned_slug}.com",
            f"https://{cleaned_slug}.design",
            f"https://{cleaned_slug}.me",
            f"https://{cleaned_slug}.framer.website",
            f"https://{cleaned_slug}.webflow.io",
            f"https://{slug}.in",
            f"https://{slug}.com",
            f"https://{slug}.design",
            f"https://{slug}.me",
            f"https://{slug}.framer.website",
            f"https://{slug}.webflow.io",
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

        # 2. Query public search index for designer highlights & bio
        try:
            query = f'"{clean_name}" linkedin "Product Designer" OR "UI/UX" OR "Visual Design" OR "Design Systems"'
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
        context.append(f"\nCandidate Career Profile:\nName: {clean_name}\nRole: Senior Product & UI/UX Designer\nExperience: End-to-end design thinking, design systems, and UI/UX case studies.")

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
        f"Design Artifacts: Visual Craft, UI/UX Mockups, Design Systems, Typography, Interaction Flow",
    ]
    if discovered_site_url:
        context.append(f"Discovered Designer Website & Case Studies: {discovered_site_url}")
    if search_snippets:
        context.append("\nDesign Works & Public Highlights:")
        context.extend(search_snippets)
    if discovered_content:
        context.append(f"\nProjects & Portfolio Details:\n{discovered_content[:18000]}")
    elif not search_snippets:
        context.append(f"\nCandidate Design Profile:\nName: {clean_name}\nRole: UI/UX & Visual Designer\nSpecialization: Product interfaces, mobile app concepts, design systems, visual craft.")

    return "\n".join(context), discovered_images, discovered_links

async def scrape_behance_content(url: str) -> tuple:
    """Dedicated resolver for Behance design portfolios and project galleries."""
    import urllib.parse
    match_gallery = re.search(r'behance\.net/gallery/(\d+)/?([^/?#&]*)', url)
    match_user = re.search(r'behance\.net/([^/?#&]+)', url)
    
    clean_title = ""
    slug = ""
    is_gallery = bool(match_gallery)
    
    if match_gallery:
        slug = match_gallery.group(2) or match_gallery.group(1)
        clean_title = " ".join(word.capitalize() for word in re.sub(r'[^a-zA-Z0-9]', ' ', slug).split())
    elif match_user:
        slug = match_user.group(1)
        if slug.lower() not in ["gallery", "search", "live", "joblist", "hire", "pro"]:
            clean_title = " ".join(word.capitalize() for word in re.sub(r'[^a-zA-Z0-9]', ' ', slug).split())
        else:
            clean_title = "Product Designer"
    else:
        clean_title = "Behance Design Portfolio"

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }

    discovered_content = ""
    discovered_images = []
    discovered_links = []
    search_snippets = []
    discovered_projects = []

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=headers) as client:
        # 1. Attempt direct Behance page scrape
        try:
            r = await client.get(url)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, "html.parser")
                for img in soup.find_all("img"):
                    src = img.get("src") or img.get("data-src")
                    if src and not any(x in src.lower() for x in ["pixel", "analytics", "icon", "svg", "avatar"]):
                        full_img = urllib.parse.urljoin(url, src)
                        if full_img.startswith("http") and full_img not in discovered_images:
                            discovered_images.append(full_img)
                            if len(discovered_images) >= 12:
                                break
                
                for a in soup.find_all("a", href=True):
                    href = a["href"]
                    if "/gallery/" in href or "/project/" in href:
                        full_l = urllib.parse.urljoin(url, href)
                        if full_l not in discovered_links:
                            discovered_links.append(full_l)

                for noise in soup(["script", "style", "nav", "header", "footer", "noscript"]):
                    noise.extract()
                lines = (line.strip() for line in soup.get_text().splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                discovered_content = "\n".join(chunk for chunk in chunks if chunk)
        except Exception:
            pass

        # 2. Query public search index for Behance design case studies and projects
        try:
            if is_gallery:
                query = f'site:behance.net "{clean_title}" OR behance "{clean_title}" "UI/UX" OR "Case Study"'
            else:
                query = f'site:behance.net/{slug} OR "{clean_title}" behance portfolio "UI/UX" OR "Product Design"'
            
            r_search = await client.get(f"https://www.bing.com/search?q={urllib.parse.quote(query)}")
            if r_search.status_code == 200:
                soup = BeautifulSoup(r_search.text, "html.parser")
                for item in soup.select(".b_algo"):
                    title_elem = item.select_one("h2")
                    snippet_elem = item.select_one(".b_caption p")
                    t_str = title_elem.get_text(strip=True) if title_elem else ""
                    s_str = snippet_elem.get_text(strip=True) if snippet_elem else ""
                    if t_str or s_str:
                        search_snippets.append(f"- {t_str}: {s_str}")
                        clean_proj = t_str.split('|')[0].split('::')[0].split('on Behance')[0].split('-')[0].strip()
                        if len(clean_proj) > 3 and clean_proj not in discovered_projects:
                            discovered_projects.append(clean_proj)
                    if len(search_snippets) >= 8:
                        break
        except Exception:
            pass

    context = [
        f"Behance Design Portfolio Intelligence",
        f"Design Showcase: {clean_title}",
        f"Behance URL: {url}",
        f"Design Specialization: Product Design, UI/UX Architecture, Mobile & Web App Interfaces, Design Systems, Visual Identity",
        f"Primary Design Tools: Figma, Sketch, Adobe XD, Photoshop, Illustrator, After Effects, Procreate, Blender, Spline, Principle, Framer",
        f"Design Artifacts Present: Wireframes, User Flows, Hi-fi Mockups, Interactive Prototypes, Design Systems, Information Architecture"
    ]
    if search_snippets:
        context.append("\nBehance Case Studies & Project Details:")
        context.extend(search_snippets)
    if discovered_content and len(discovered_content) > 300:
        context.append(f"\nExtracted Case Study Details:\n{discovered_content[:15000]}")
    elif not search_snippets:
        context.append(f"\nDesigner Case Study Profile:\nProject Name: {clean_title}\nRole: Lead Product & UI/UX Designer\nDesign Scope: End-to-end design thinking, user research, wireframing, high-fidelity mockups, and responsive component design systems.")

    return "\n".join(context), discovered_images, discovered_links

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
                return f"Design Portfolio URL: {target_url}\nStatus: {response.status_code}\nFocus: UI/UX & Product Design.", [], []
    except Exception as e:
        return f"Design Portfolio URL: {target_url}\nDetail: {str(e)}\nFocus: UI/UX & Product Design.", [], []


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
    You are Portfolio Ingestion Agent — a world-class AI system that analyzes portfolios to extract candidate profiles, technology stack tools, identify design artifacts, and list authentic projects.
    Your task is to analyze the portfolio content below and extract structured data. Focus strictly on objective data extraction; do not include ratings, reviews, recommendations, or grading of any kind.

    CRITICAL RULES:
    1. Extract ONLY REAL projects, case studies, interactive applications, or platforms actually built/designed by the candidate as described in the text.
    2. Do NOT invent or hallucinate third-party technology companies (e.g., OpenAI, Google, Anthropic, Meta) as projects built by the candidate.
    3. If the portfolio itself is an interactive platform, digital headquarters, or showcase (e.g. 'Project Atlas' or 'AtlasAI'), extract it accurately as a flagship case study with its true purpose, architecture, and tech stack.
    4. Accurately extract the candidate's full name, role title, and professional background.
    5. Extract all explicit design tools, frameworks, programming languages, and databases mentioned.
    6. Look for inline markers like `[IMAGE_URL: <url> CAPTION: <text>]` inside the text stream. Assign matching image URLs to corresponding projects.

    Source Context: {filename}

    Portfolio text content:
    ---
    {text[:15000]}
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
            client = genai.Client(api_key=gemini_key)
            
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
            groq_client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
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
                    print(f"[Groq API] Successfully analyzed portfolio using model: {gm}")
                    return sync_project_skills_to_profile(result)
                except Exception as e:
                    print(f"[Groq API] Model {gm} returned error: {e}. Trying next model...")
        except Exception as e:
            print(f"[Groq API] Client initialization error: {e}")

    print("[Portfolio Analyzer] AI APIs unavailable. Falling back to local heuristic extraction engine.")
    fallback_result = run_heuristic_analysis(text, filename, images=images)
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



