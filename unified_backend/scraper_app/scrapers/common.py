import os
import time
from datetime import datetime
from typing import Any, Dict, List

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


DESIGN_KEYWORDS = (
    "graphic designer", "visual designer", "brand designer", "logo designer", "illustrator",
    "infographic designer", "packaging designer", "print designer", "poster designer",
    "typography specialist", "icon designer", "layout artist", "motion graphics designer",
    "2d animator", "3d animator", "concept artist", "character designer", "storyboard artist",
    "digital painter", "art director",
    "ui designer", "ux designer", "product designer", "interaction designer", "experience designer",
    "wireframe specialist", "prototype designer", "usability analyst", "accessibility designer",
    "information architect", "mobile app designer", "web designer", "responsive design specialist",
    "dashboard designer", "design system specialist", "human-centered designer", "service designer",
    "journey mapper", "ux researcher", "ux strategist",
    "creative director", "multimedia designer", "video editor", "content designer",
    "social media designer", "presentation designer", "ar/vr designer", "game designer",
    "level designer", "environment artist", "sound designer", "motion capture specialist",
    "vfx artist", "cinematic designer", "broadcast designer", "title sequence designer",
    "interactive media designer", "digital content creator", "creative technologist",
    "immersive experience designer",
    "industrial designer", "furniture designer", "automotive designer", "toy designer",
    "fashion designer", "textile designer", "jewelry designer", "footwear designer",
    "accessory designer", "interior designer", "exhibition designer", "set designer",
    "retail space designer", "lighting designer", "sustainable product designer",
    "ergonomics specialist", "cad designer", "prototype engineer", "materials designer",
    "design engineer",
    "design researcher", "trend analyst", "market research designer", "innovation strategist",
    "design thinking facilitator", "systems designer", "strategic designer", "policy designer",
    "civic designer", "social impact designer", "behavioral designer", "organizational designer",
    "business designer", "service innovation specialist", "experience strategist",
    "human factors specialist", "ethnographic researcher", "design consultant",
    "creative strategist", "design futurist",
    "webflow designer", "figma specialist", "adobe creative suite expert", "cad specialist",
    "blender artist", "unity designer", "unreal engine designer", "ar developer", "vr developer",
    "xr designer", "interaction developer", "front-end designer", "creative coder",
    "generative designer", "ai design specialist", "data visualization designer",
    "dashboard analyst", "digital twin designer", "simulation designer", "tech product designer",
    "corporate identity designer", "marketing designer", "advertising designer", "campaign designer",
    "brand strategist", "creative project manager", "design operations specialist", "innovation manager",
    "client experience designer", "customer journey designer", "employer branding designer",
    "hr experience designer", "training materials designer", "presentation specialist",
    "proposal designer", "pitch deck designer", "corporate communications designer", "event designer",
    "business development designer", "design entrepreneur",
    "design educator", "design mentor", "workshop facilitator", "freelance designer",
    "portfolio consultant", "design blogger", "content creator", "online course designer",
    "curriculum designer", "instructional designer", "e-learning designer", "creative freelancer",
    "independent illustrator", "design influencer", "community designer", "open source contributor",
    "design podcaster", "creative writer", "design advocate", "student ambassador"
)


class ResilientScraperMixin:
    timeout = 20
    polite_delay_seconds = 1

    def build_session(self) -> requests.Session:
        session = requests.Session()
        retry = Retry(
            total=3,
            connect=3,
            read=3,
            backoff_factor=1,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=("GET",),
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/125.0 Safari/537.36"
                ),
                "Accept-Language": "en-US,en;q=0.9",
            }
        )
        return session

    def get_json(self, url: str) -> Any:
        time.sleep(self.polite_delay_seconds)
        response = self.session.get(url, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def get_html(self, url: str) -> str:
        time.sleep(self.polite_delay_seconds)
        response = self.session.get(url, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def get_rendered_html(self, url: str, wait_until: str = "networkidle") -> str:
        if os.getenv("ENABLE_BROWSER_SCRAPING", "true").lower() != "true":
            return self.get_html(url)

        os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "0"
        from playwright.sync_api import sync_playwright

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent=self.session.headers.get("User-Agent"),
                locale="en-US",
            )
            page.goto(url, wait_until=wait_until, timeout=self.timeout * 1000)
            html = page.content()
            browser.close()
            return html


def is_design_related(raw_data: Dict[str, Any]) -> bool:
    combined_text = " ".join(
        str(raw_data.get(key) or "")
        for key in ("raw_title", "job_description", "tags")
    ).lower()
    return any(keyword in combined_text for keyword in DESIGN_KEYWORDS)


def infer_remote_status(location: Any) -> str:
    location_text = str(location or "").lower()
    if "remote" in location_text or "anywhere" in location_text:
        return "remote"
    if "hybrid" in location_text:
        return "hybrid"
    return "onsite"


def dedupe_jobs(jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    unique_jobs = []
    for job in jobs:
        key = job.get("url") or f"{job.get('raw_title')}:{job.get('company_name')}"
        if key in seen:
            continue
        seen.add(key)
        unique_jobs.append(job)
    return unique_jobs


def normalize_job(raw_data: Dict[str, Any], source: str) -> Dict[str, Any]:
    return {
        "title": raw_data.get("raw_title"),
        "company": raw_data.get("company_name"),
        "description": raw_data.get("job_description"),
        "location": raw_data.get("job_location"),
        "remote_status": infer_remote_status(raw_data.get("job_location")),
        "salary": raw_data.get("salary"),
        "source": source,
        "apply_url": raw_data.get("url"),
        "is_active": True,
        # Preserve raw fields so IntelligencePipeline can still read them
        "raw_title": raw_data.get("raw_title"),
        "company_name": raw_data.get("company_name"),
        "job_description": raw_data.get("job_description"),
        "job_location": raw_data.get("job_location"),
        "site": raw_data.get("site"),
        "date_posted": raw_data.get("date_posted"),
    }

