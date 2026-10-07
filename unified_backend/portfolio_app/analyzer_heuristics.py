import re
import uuid
import datetime

# Design-domain keyword vocabularies. Used ONLY to detect what is actually written in the scraped text.
TECH_KEYWORDS = {
    "design_tool": [
        "figma", "framer", "sketch", "photoshop", "illustrator", "adobe xd", "invision", "miro", "canva",
        "zeplin", "procreate", "after effects", "premiere", "indesign", "spline", "blender", "principle",
        "lottie", "webflow", "figjam", "cinema 4d", "protopie", "maze", "lightroom", "rive",
    ],
    "methodology": [
        "user research", "wireframing", "prototyping", "usability testing", "design thinking",
        "information architecture", "persona", "user flows", "journey mapping", "storyboarding",
        "card sorting", "heuristic evaluation", "design systems", "accessibility", "wcag",
        "interaction design", "visual design", "ux research", "ui design", "product design",
        "branding", "typography", "a/b testing", "agile", "scrum",
    ],
    "soft_skill": [
        "creative direction", "stakeholder management", "communication", "collaboration", "design critique",
        "problem solving", "leadership", "empathy", "presentation", "mentoring",
    ],
}

ARTIFACT_KEYWORDS = {
    "wireframes": ["wireframe", "wireframing", "lo-fi", "low-fi", "low fidelity"],
    "mockups": ["mockup", "mock-up", "high fidelity", "hi-fi", "high-fi"],
    "case studies": ["case study", "case studies", "project overview"],
    "user flows": ["user flow", "user journey", "flow diagram", "task flow"],
    "prototypes": ["prototype", "prototyping", "interactive prototype", "clickable"],
    "design systems": ["design system", "component library", "style guide", "design tokens"],
    "research": ["user research", "research findings", "user interview", "survey", "usability test", "a/b test"],
    "personas": ["persona", "user persona", "user archetype"],
    "information architecture": ["information architecture", "ia diagram", "sitemap", "card sort"],
    "style guides": ["style guide", "brand guide", "typography guide", "color palette"],
}

ROLE_KEYWORDS = [
    "product designer", "ui/ux designer", "ux/ui designer", "ux designer", "ui designer", "visual designer",
    "graphic designer", "brand designer", "interaction designer", "motion designer", "ux researcher",
    "design lead", "art director", "illustrator", "creative director", "web designer",
]

INDUSTRY_KEYWORDS = {
    "FinTech & Banking": ["fintech", "banking", "finance", "payments", "insurance"],
    "Healthcare": ["healthcare", "health tech", "healthtech", "medical", "wellness", "telehealth"],
    "Education": ["education", "edtech", "learning", "e-learning"],
    "E-Commerce & Retail": ["e-commerce", "ecommerce", "retail", "shopping", "fashion"],
    "Travel & Hospitality": ["travel", "hospitality", "hotel", "booking"],
    "Food & Beverage": ["food", "beverage", "restaurant", "packaging"],
    "Entertainment & Media": ["entertainment", "music", "gaming", "game", "media", "streaming"],
    "SaaS & Enterprise": ["saas", "enterprise", "dashboard", "b2b", "analytics"],
    "Social & Community": ["social media", "community", "social network"],
}

NON_PROJECT_WORDS = {
    "openai", "anthropic", "google", "meta", "microsoft", "behance", "dribbble", "linkedin", "adobe",
    "suggest", "overview", "background", "career", "topics", "cookie", "privacy",
    "login", "signup", "pricing", "explore", "follow", "appreciate", "view", "sign in",
}


def _tools_in(text_lower: str) -> list:
    found = []
    for word in TECH_KEYWORDS["design_tool"]:
        if word in text_lower:
            found.append(word.title() if len(word) > 3 else word.upper())
    return found


def _first_sentences(text: str, limit: int = 320) -> str:
    flat = re.sub(r'\s+', ' ', text).strip()
    if len(flat) <= limit:
        return flat
    cut = flat[:limit]
    last_stop = max(cut.rfind('. '), cut.rfind('! '), cut.rfind('? '))
    return (cut[:last_stop + 1] if last_stop > 120 else cut.rstrip() + "…")


def run_heuristic_analysis(text: str, filename: str, images: list = None) -> dict:
    """
    Offline fallback used only when no AI provider is reachable.
    It reports strictly what is present in the scraped text — no invented names, roles, scores or case studies.
    """
    text_lower = text.lower()
    flat_images = images or []

    # ── Skill detection ─────────────────────────────────────────────────────────
    detected = {"design_tools": [], "methodologies_and_processes": [], "soft_skills": []}
    for cat, words in TECH_KEYWORDS.items():
        for word in words:
            if word in text_lower:
                val = word.title() if len(word) > 3 else word.upper()
                key = {"design_tool": "design_tools", "methodology": "methodologies_and_processes", "soft_skill": "soft_skills"}[cat]
                if val not in detected[key]:
                    detected[key].append(val)

    # ── Design artifact detection ────────────────────────────────────────────────
    artifacts_found, artifacts_missing = [], []
    for artifact_name, keywords in ARTIFACT_KEYWORDS.items():
        (artifacts_found if any(kw in text_lower for kw in keywords) else artifacts_missing).append(artifact_name)

    # ── Project extraction (from the real scraped content only) ──────────────────
    extracted_projects = []
    seen = set()

    def _is_valid(name: str) -> bool:
        n = name.lower().strip()
        return len(n) > 3 and n not in seen and not any(w == n or n.startswith(w + " ") for w in NON_PROJECT_WORDS)

    def _add(name: str, details: str, block_text: str):
        clean = re.sub(r'\s+', ' ', name).strip(" -|:")
        if not _is_valid(clean):
            return
        seen.add(clean.lower())
        extracted_projects.append({
            "name": clean,
            "type": "Design Project",
            "role": None,
            "client_or_organization": None,
            "timeline": None,
            "team_size": None,
            "details": details or "Project found in the connected portfolio.",
            "technologies": _tools_in(block_text.lower()),
            "challenges": None,
            "outcomes": None,
            "images": flat_images[len(extracted_projects) * 2: len(extracted_projects) * 2 + 2],
        })

    # 1. Behance profile → one block per project: "--- Behance Project: TITLE (url) ---"
    for m in re.finditer(r'--- Behance Project: (.+?) \(https?://[^)]+\) ---\n(.*?)(?=\n--- Behance Project:|\Z)', text, re.DOTALL):
        title = m.group(1).split(' - ')[0].replace('on Behance', '')
        _add(title, _first_sentences(m.group(2)), m.group(2))

    # 2. Search / profile snippets: "- Title: description"
    for title, desc in re.findall(r'^-\s*([^:\n\r]{4,70})\s*:\s*([^\n\r]+)$', text, re.MULTILINE):
        title = title.split('|')[0].split('::')[0].split('on Behance')[0].split('on Dribbble')[0]
        _add(title, desc.strip(), desc)

    # 3. Explicit "Case Study: X" or "Project: X" style labels
    for p in re.findall(r'(?:Case Study|Project|Shot|Redesign)\s*:\s*([^\n\r\.\,\;\:]{3,70})', text, re.IGNORECASE):
        _add(p, "", p)

    # 4. Numbered project lists: e.g. "1. NeoBank Mobile App\nDescription..."
    for num, title, block in re.findall(r'(?:^|\n)\s*(\d+)\.\s*([^\n\r]{3,70})\n((?:(?!\n\s*\d+\.).)*)', text, re.DOTALL):
        if not any(k in title.lower() for k in ["step", "phase", "rule", "item", "chapter", "skill", "year", "month"]):
            _add(title, _first_sentences(block), block)

    # 5. Markdown header project sections: e.g. "## Project Title\n..."
    for title, block in re.findall(r'(?:^|\n)#{2,4}\s+([^\n\r]{3,70})\n((?:(?!\n#{2,4}\s).)*)', text, re.DOTALL):
        if not any(k in title.lower() for k in ["about", "experience", "education", "contact", "skills", "tools", "summary", "overview", "introduction", "background"]):
            _add(title, _first_sentences(block), block)

    # 6. Single Behance / Dribbble / Portfolio project page
    if not extracted_projects:
        page_title = re.search(r'Page Title:\s*(.+)', text)
        page_body = re.search(r'(?:Page Content|Main Portfolio Case Study Content|Dribbble Page Content):\n(.+)', text, re.DOTALL)
        if page_title and page_body:
            clean_title = page_title.group(1).split(' - ')[0].split(' | ')[0].strip()
            if _is_valid(clean_title):
                _add(clean_title, _first_sentences(page_body.group(1)), page_body.group(1))

    # ── Candidate profile fields ────────────────────────────────────────────────
    guessed_name = ""
    explicit_name = re.search(r'(?:Designer Name|Candidate Name|Full Name|Name)\s*:\s*([^\n\r]{2,60})', text, re.IGNORECASE)
    if explicit_name:
        cand = explicit_name.group(1).strip()
        if not any(x in cand.lower() for x in ["http", "portfolio", "profile", "intelligence", "project", "source"]):
            guessed_name = cand
    if not guessed_name:
        title_match = re.search(r'Title:\s*([^\|\n\-]+)[\|\-]\s*([^\n\r]+)', text, re.IGNORECASE)
        if title_match:
            for part in [title_match.group(2).strip(), title_match.group(1).strip()]:
                if len(part.split()) in (2, 3) and not any(x in part.lower() for x in ["project", "portfolio", "home", "studio", "system", "app", "behance"]):
                    guessed_name = part
                    break

    # Headline: the most frequently mentioned design role in the text
    guessed_headline = ""
    role_counts = {r: text_lower.count(r) for r in ROLE_KEYWORDS if r in text_lower}
    if role_counts:
        guessed_headline = max(role_counts, key=role_counts.get).title().replace("Ui/Ux", "UI/UX").replace("Ux/Ui", "UX/UI")

    # Summary: real meta description if present, else the start of the real page content
    guessed_summary = ""
    meta_desc = re.search(r'Meta Description(?:\s*/\s*Summary)?:\s*([^\n]+)', text, re.IGNORECASE)
    if meta_desc:
        guessed_summary = meta_desc.group(1).strip()
    else:
        body = re.search(r'(?:Page Content|Main Portfolio Case Study Content|Dribbble Page Content):\n(.+)', text, re.DOTALL)
        if body:
            guessed_summary = _first_sentences(body.group(1), 400)

    exp_match = re.search(r'(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?experience', text_lower)
    years_experience = float(exp_match.group(1)) if exp_match else None

    role_match = re.search(r'target\s+roles?\s*:\s*([^\n]+)', text_lower)
    if role_match:
        target_roles = [r.strip().title() for r in role_match.group(1).split(',') if r.strip()]
    else:
        target_roles = [guessed_headline] if guessed_headline else []

    detected_industries = [name for name, kws in INDUSTRY_KEYWORDS.items() if any(k in text_lower for k in kws)]
    detected_strengths = detected["soft_skills"][:4]

    return {
        "report_id": str(uuid.uuid4()),
        "candidate_id": f"CAN-{str(uuid.uuid4())[:8].upper()}",
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "full_name": guessed_name,
        "headline": guessed_headline,
        "summary": guessed_summary,
        "target_roles": target_roles[:3],
        "years_experience": years_experience,
        "industries": detected_industries,
        "strengths": detected_strengths,
        "tools": list(detected["design_tools"]),
        "skills": detected,
        "design_artifacts": {
            "artifacts_found": artifacts_found,
            "artifacts_missing": artifacts_missing,
        },
        "projects": extracted_projects,
    }
