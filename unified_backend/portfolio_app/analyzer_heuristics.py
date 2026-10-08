import re
import uuid
import datetime

# ─────────────────────────────────────────────────────────────────────────────
# Offline fallback analyzer.
# Used ONLY when no AI provider (Gemini / Groq) is reachable. It reports strictly what is present
# in the scraped portfolio text — no invented names, roles, scores or case studies.
# All vocabulary matching is whole-word so "driven" never produces the tool "Rive".
# ─────────────────────────────────────────────────────────────────────────────

DESIGN_TOOLS = {
    "figma": "Figma", "figjam": "FigJam", "framer": "Framer", "sketch": "Sketch", "photoshop": "Photoshop",
    "illustrator": "Illustrator", "adobe xd": "Adobe XD", "invision": "InVision", "miro": "Miro", "canva": "Canva",
    "zeplin": "Zeplin", "procreate": "Procreate", "after effects": "After Effects", "premiere pro": "Premiere Pro",
    "indesign": "InDesign", "spline": "Spline", "blender": "Blender", "principle": "Principle", "lottie": "Lottie",
    "webflow": "Webflow", "cinema 4d": "Cinema 4D", "protopie": "ProtoPie", "maze": "Maze", "lightroom": "Lightroom",
    "rive": "Rive", "notion": "Notion", "midjourney": "Midjourney", "mural": "Mural", "balsamiq": "Balsamiq",
    "axure": "Axure", "adobe creative suite": "Adobe Creative Suite", "dovetail": "Dovetail", "hotjar": "Hotjar",
}

METHODOLOGIES = {
    "user research": "User Research", "ux research": "UX Research", "design research": "Design Research",
    "wireframing": "Wireframing", "wireframes": "Wireframing", "prototyping": "Prototyping", "prototype": "Prototyping",
    "usability testing": "Usability Testing", "design thinking": "Design Thinking",
    "information architecture": "Information Architecture", "persona": "Personas", "personas": "Personas",
    "user flows": "User Flows", "user journey": "User Journey Mapping", "journey mapping": "Journey Mapping",
    "service design": "Service Design", "service blueprint": "Service Blueprinting",
    "service blueprinting": "Service Blueprinting", "storyboarding": "Storyboarding", "card sorting": "Card Sorting",
    "heuristic evaluation": "Heuristic Evaluation", "design systems": "Design Systems", "design system": "Design Systems",
    "accessibility": "Accessibility", "wcag": "Accessibility (WCAG)", "interaction design": "Interaction Design",
    "visual design": "Visual Design", "ui design": "UI Design", "ux design": "UX Design",
    "product design": "Product Design", "brand strategy": "Brand Strategy", "brand positioning": "Brand Positioning",
    "branding": "Branding", "brand identity": "Brand Identity", "typography": "Typography",
    "a/b testing": "A/B Testing", "agile": "Agile", "scrum": "Scrum", "thematic analysis": "Thematic Analysis",
    "stakeholder mapping": "Stakeholder Mapping", "competitive analysis": "Competitive Analysis",
    "ethnography": "Ethnography", "foresight": "Strategic Foresight", "futures": "Futures Thinking",
    "scenario planning": "Scenario Planning", "co-creation": "Co-creation", "workshop": "Workshop Facilitation",
    "market research": "Market Research", "consumer insights": "Consumer Insights", "motion design": "Motion Design",
    "packaging design": "Packaging Design", "illustration": "Illustration", "art direction": "Art Direction",
    "interviews": "User Interviews", "survey": "Surveys", "synthesis": "Research Synthesis",
}

SOFT_SKILLS = {
    "creative direction": "Creative Direction", "stakeholder management": "Stakeholder Management",
    "communication": "Communication", "collaboration": "Collaboration", "design critique": "Design Critique",
    "problem solving": "Problem Solving", "leadership": "Leadership", "empathy": "Empathy",
    "presentation": "Presentation", "mentoring": "Mentoring", "storytelling": "Storytelling",
    "facilitation": "Facilitation", "strategic thinking": "Strategic Thinking",
}

ARTIFACT_KEYWORDS = {
    "wireframes": ["wireframe", "wireframes", "wireframing", "lo-fi", "low fidelity"],
    "mockups": ["mockup", "mockups", "mock-up", "high fidelity", "hi-fi"],
    "case studies": ["case study", "case studies"],
    "user flows": ["user flow", "user flows", "user journey", "journey map", "task flow"],
    "prototypes": ["prototype", "prototypes", "prototyping", "clickable"],
    "design systems": ["design system", "design systems", "component library", "design tokens"],
    "research": ["user research", "design research", "research findings", "user interview", "interviews", "usability test", "thematic analysis"],
    "personas": ["persona", "personas", "user archetype"],
    "information architecture": ["information architecture", "sitemap", "card sort"],
    "style guides": ["style guide", "brand guide", "brand guidelines", "typography guide"],
    "service blueprints": ["service blueprint", "service blueprinting", "service map"],
    "frameworks": ["framework", "value architecture"],
}

ROLE_KEYWORDS = [
    "product designer", "ui/ux designer", "ux/ui designer", "ux designer", "ui designer", "visual designer",
    "graphic designer", "brand designer", "interaction designer", "motion designer", "ux researcher",
    "service designer", "design researcher", "design lead", "art director", "illustrator", "creative director",
    "web designer", "design strategist", "design manager",
]

INDUSTRY_KEYWORDS = {
    "FinTech & Banking": ["fintech", "banking", "payments", "insurance", "neobank"],
    "Healthcare": ["healthcare", "healthtech", "medical", "telehealth", "hospital"],
    "Education": ["edtech", "education", "e-learning", "university", "students"],
    "E-Commerce & Retail": ["e-commerce", "ecommerce", "retail", "shopping", "fashion"],
    "Travel & Hospitality": ["travel", "hospitality", "hotel", "tourism"],
    "Food & Beverage": ["restaurant", "beverage", "food delivery", "cafe"],
    "Entertainment & Media": ["entertainment", "music", "gaming", "streaming", "film"],
    "SaaS & Enterprise": ["saas", "enterprise software", "b2b", "dashboard"],
    "Automotive": ["automotive", "mercedes", "vehicle", "car brand", "mobility"],
    "Art & Culture": ["art gallery", "contemporary art", "museum", "artists", "exhibition"],
    "Beauty & Personal Care": ["beauty", "cosmetic", "skincare", "personal care"],
    "Water & Infrastructure": ["wastewater", "municipal", "infrastructure", "water management"],
    "Sustainability": ["sustainability", "climate", "circular economy"],
    "Social Impact": ["nonprofit", "social impact", "ngo", "public sector"],
}

NON_PROJECT_WORDS = {
    "openai", "anthropic", "google", "meta", "microsoft", "behance", "dribbble", "linkedin", "adobe",
    "suggest", "overview", "background", "career", "topics", "cookie", "privacy", "login", "signup",
    "pricing", "explore", "follow", "appreciate", "view", "sign in", "stats", "on the web", "member since",
}

PROJECT_TYPES = [
    ("service design", "Service Design"),
    ("foresight", "Futures & Foresight"),
    ("brand positioning", "Brand Strategy"),
    ("brand strategy", "Brand Strategy"),
    ("branding", "Branding & Identity"),
    ("packaging", "Packaging Design"),
    ("design system", "Design System"),
    ("motion", "Motion Design"),
    ("mobile app", "Mobile App UX/UI"),
    ("website", "Web Design"),
    ("dashboard", "Product UX/UI"),
    ("ux", "UX/UI Design"),
    ("research", "Design Research"),
    ("experience", "Experience Design"),
]

TYPE_TO_ROLE = {
    "Service Design": "Service Designer",
    "Futures & Foresight": "Strategic Designer",
    "Brand Strategy": "Brand Strategist",
    "Branding & Identity": "Brand Designer",
    "Packaging Design": "Packaging Designer",
    "Design System": "Design Systems Designer",
    "Motion Design": "Motion Designer",
    "Mobile App UX/UI": "UI/UX Designer",
    "Web Design": "Web Designer",
    "Product UX/UI": "Product Designer",
    "UX/UI Design": "UI/UX Designer",
    "Design Research": "Design Researcher",
    "Experience Design": "Experience Designer",
}


def _has(text_lower: str, term: str) -> bool:
    """Whole-word / whole-phrase match so 'driven' never matches 'rive'."""
    return re.search(r'(?<![a-z0-9])' + re.escape(term) + r'(?![a-z0-9])', text_lower) is not None


def _collect(text_lower: str, vocab: dict) -> list:
    found = []
    for term, display in vocab.items():
        if _has(text_lower, term) and display not in found:
            found.append(display)
    return found


def _sentences(text: str, limit: int = 520) -> str:
    flat = re.sub(r'\s+', ' ', text).strip()
    if len(flat) <= limit:
        return flat
    cut = flat[:limit]
    last_stop = max(cut.rfind('. '), cut.rfind('! '), cut.rfind('? '))
    return cut[:last_stop + 1] if last_stop > 140 else cut.rstrip() + "…"


def _strip_ui(text: str) -> str:
    """Remove image markers, urls and common UI chrome from a block of scraped text."""
    text = re.sub(r'\[IMAGE_URL:[^\]]*\]', '', text)
    text = re.sub(r'https?://\S+', '', text)
    kept = []
    for line in text.splitlines():
        l = line.strip()
        low = l.lower()
        if len(l) < 3 or low in NON_PROJECT_WORDS or low.startswith(("summary:", "source url", "page title")):
            continue
        if re.match(r'^(project views|appreciations|followers|following|member since)\b', low):
            continue
        kept.append(l)
    return "\n".join(kept)


def _labelled(block: str, labels: tuple) -> str:
    """Pulls 'Role: X' / 'Client: X' style facts that are literally written in the project text."""
    m = re.search(r'(?im)^\s*(?:' + "|".join(labels) + r')\s*[:\-–]\s*(.{2,140})$', block)
    return m.group(1).strip() if m else ""


def _infer_type(title: str, body: str) -> str:
    hay = f"{title} {body[:800]}".lower()
    for kw, label in PROJECT_TYPES:
        if _has(hay, kw):
            return label
    return "Design Project"


def run_heuristic_analysis(text: str, filename: str, images: list = None) -> dict:
    text_lower = text.lower()
    flat_images = images or []

    # ── Skills (whole-word, from real text only) ────────────────────────────────
    detected = {
        "design_tools": _collect(text_lower, DESIGN_TOOLS),
        "methodologies_and_processes": _collect(text_lower, METHODOLOGIES),
        "soft_skills": _collect(text_lower, SOFT_SKILLS),
    }

    artifacts_found, artifacts_missing = [], []
    for name, kws in ARTIFACT_KEYWORDS.items():
        (artifacts_found if any(_has(text_lower, k) for k in kws) else artifacts_missing).append(name)

    # ── Projects ────────────────────────────────────────────────────────────────
    projects, seen = [], []

    def _clean_title(t: str) -> str:
        t = re.sub(r'\(https?://[^)]*\)?', '', t)
        t = t.replace(':: Behance', '').replace('on Behance', '').replace('on Dribbble', '')
        return re.sub(r'\s+', ' ', t).strip(" -|:()")

    def _valid(name: str) -> bool:
        n = name.lower()
        if len(n) < 4 or n in NON_PROJECT_WORDS or any(n.startswith(w + " ") for w in NON_PROJECT_WORDS):
            return False
        return not any(n == s or n in s or s in n for s in seen)

    def _add(title: str, body: str, raw_block: str = ""):
        name = _clean_title(title)
        if not _valid(name):
            return
        seen.append(name.lower())
        block_imgs = re.findall(r'\[IMAGE_URL:\s*([^\s\]]+)', raw_block or body)
        clean_body = _strip_ui(body)
        # drop a leading line that merely repeats the title
        lines = [l for l in clean_body.splitlines() if l.strip().lower() not in (name.lower(), title.strip().lower())]
        desc = _sentences(" ".join(lines)) if lines else ""
        projects.append({
            "name": name,
            "type": _infer_type(name, clean_body),
            "role": _labelled(clean_body, ("my role", "role")) or None,
            "client_or_organization": _labelled(clean_body, ("client", "company", "organization", "organisation")) or None,
            "timeline": _labelled(clean_body, ("timeline", "duration", "year", "date")) or None,
            "team_size": _labelled(clean_body, ("team", "team size")) or None,
            "details": desc or "Project listed in the connected portfolio (no description was published).",
            "technologies": _collect(clean_body.lower(), DESIGN_TOOLS),
            "challenges": _labelled(clean_body, ("problem", "challenge", "brief", "insight")) or None,
            "outcomes": _labelled(clean_body, ("outcome", "result", "results", "impact", "deliverables", "solution")) or None,
            "images": block_imgs or flat_images[len(projects) * 2: len(projects) * 2 + 2],
        })

    # 1. Behance profile → one block per project
    for m in re.finditer(r'--- Behance Project: (.+?) \(https?://[^)]+\) ---\n(.*?)(?=\n--- Behance Project:|\Z)', text, re.DOTALL):
        _add(m.group(1).split(' - ')[0], m.group(2), m.group(2))

    # 2. Profile / search snippets "- Title: description"
    for title, desc in re.findall(r'^-\s*([^:\n\r]{4,70})\s*:\s*([^\n\r]+)$', text, re.MULTILINE):
        _add(title.split('|')[0].split('::')[0], desc.strip(), desc)

    # 3. Explicit labels
    for p in re.findall(r'(?:Case Study|Project|Shot|Redesign)\s*:\s*([^\n\r\.\,\;\:]{3,70})', text, re.IGNORECASE):
        _add(p, "")

    # 4. Numbered lists  "1. Title\n description"
    for _n, title, block in re.findall(r'(?:^|\n)\s*(\d+)\.\s*([^\n\r]{3,70})\n((?:(?!\n\s*\d+\.).)*)', text, re.DOTALL):
        if not any(k in title.lower() for k in ["step", "phase", "rule", "item", "chapter", "skill", "year", "month"]):
            _add(title, block)

    # 5. Markdown headers
    for title, block in re.findall(r'(?:^|\n)#{2,4}\s+([^\n\r]{3,70})\n((?:(?!\n#{2,4}\s).)*)', text, re.DOTALL):
        if not any(k in title.lower() for k in ["about", "experience", "education", "contact", "skills", "tools", "summary", "overview", "introduction", "background"]):
            _add(title, block)

    # 6. Single project page → the page itself is the case study
    if not projects:
        page_title = re.search(r'Page Title:\s*(.+)', text)
        page_body = re.search(r'(?:Page Content|Main Portfolio Case Study Content|Dribbble Page Content):\n(.+)', text, re.DOTALL)
        if page_title and page_body:
            _add(page_title.group(1).split(' - ')[0].split(' | ')[0], page_body.group(1))

    # ── Candidate profile fields ────────────────────────────────────────────────
    def _field(label: str) -> str:
        m = re.search(r'^' + label + r'\s*:\s*([^\n\r]{1,120})$', text, re.IGNORECASE | re.MULTILINE)
        return m.group(1).strip() if m else ""

    name = ""
    cand = _field(r'(?:Designer Name|Candidate Name|Full Name|Name)')
    if cand and not any(x in cand.lower() for x in ["http", "portfolio", "profile", "intelligence", "project", "source"]):
        name = cand
    if not name:
        tm = re.search(r'Title:\s*([^\|\n\-]+)[\|\-]\s*([^\n\r]+)', text, re.IGNORECASE)
        if tm:
            for part in (tm.group(2).strip(), tm.group(1).strip()):
                if len(part.split()) in (2, 3) and not any(x in part.lower() for x in ["project", "portfolio", "home", "studio", "system", "app", "behance"]):
                    name = part
                    break

    headline = _field(r'Designer Headline\s*/?\s*Role')
    institution = _field(r'Institution\s*/?\s*Company')
    location = _field(r'Location')
    availability = _field(r'Availability')
    if not headline:
        counts = {r: text_lower.count(r) for r in ROLE_KEYWORDS if _has(text_lower, r)}
        if counts:
            headline = max(counts, key=counts.get).title().replace("Ui/Ux", "UI/UX").replace("Ux/Ui", "UX/UI")

    # Roles: stated roles first, otherwise derived from the types of projects actually found
    target_roles = []
    stated = re.search(r'target\s+roles?\s*:\s*([^\n]+)', text, re.IGNORECASE)
    if stated:
        target_roles = [r.strip().title() for r in stated.group(1).split(',') if r.strip()]
    else:
        for r in ROLE_KEYWORDS:
            if _has(text_lower, r):
                target_roles.append(r.title().replace("Ui/Ux", "UI/UX").replace("Ux/Ui", "UX/UI"))
        for p in projects:
            role = TYPE_TO_ROLE.get(p["type"])
            if role and role not in target_roles:
                target_roles.append(role)

    # Summary: real meta description if meaningful, otherwise composed ONLY from extracted facts
    summary = ""
    meta = re.search(r'Meta Description(?:\s*/\s*Summary)?:\s*([^\n]+)', text, re.IGNORECASE)
    if meta and not meta.group(1).strip().lower().endswith(("on behance", "on dribbble")):
        summary = meta.group(1).strip()
    elif name and (headline or projects):
        bits = f"{name} is a designer"
        if headline:
            bits += f" with a focus on {headline}"
        if institution:
            bits += f" ({institution})"
        if location:
            bits += f", based in {location}"
        bits += "."
        if availability:
            bits += f" {availability.rstrip('.')}."
        if projects:
            titles = [p["name"] for p in projects[:3]]
            bits += " Portfolio work includes " + ", ".join(titles[:-1]) + (" and " if len(titles) > 1 else "") + titles[-1] + "."
        methods = detected["methodologies_and_processes"][:4]
        if methods:
            bits += " Methods evidenced across the work: " + ", ".join(methods) + "."
        summary = bits
    else:
        body = re.search(r'(?:Page Content|Main Portfolio Case Study Content|Dribbble Page Content):\n(.+)', text, re.DOTALL)
        if body:
            summary = _sentences(_strip_ui(body.group(1)), 420)

    yrs = re.search(r'(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?experience', text_lower)
    years_experience = float(yrs.group(1)) if yrs else None

    industries = [label for label, kws in INDUSTRY_KEYWORDS.items() if any(_has(text_lower, k) for k in kws)]
    strengths = (detected["soft_skills"] + detected["methodologies_and_processes"])[:4]

    return {
        "report_id": str(uuid.uuid4()),
        "candidate_id": f"CAN-{str(uuid.uuid4())[:8].upper()}",
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "full_name": name,
        "headline": headline,
        "summary": summary,
        "target_roles": target_roles[:3],
        "years_experience": years_experience,
        "industries": industries,
        "strengths": strengths,
        "tools": list(detected["design_tools"]),
        "skills": detected,
        "design_artifacts": {
            "artifacts_found": artifacts_found,
            "artifacts_missing": artifacts_missing,
        },
        "projects": projects,
    }
