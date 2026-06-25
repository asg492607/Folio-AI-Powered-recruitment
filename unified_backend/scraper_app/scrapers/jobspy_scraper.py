from typing import Any, Dict, List
from app.scrapers.base import BaseScraper
from app.scrapers.common import dedupe_jobs, is_design_related, normalize_job, DESIGN_KEYWORDS


class JobSpyScraper(BaseScraper):
    """
    Scraper powered by python-jobspy.
    Only uses LinkedIn and Indeed — ZipRecruiter and Glassdoor block scrapers with 403.
    Searches across major global cities + all major Indian cities.
    """
    # We use high-level broad search terms instead of 80+ granular terms
    # to avoid 1400+ API calls and rate-limiting. We pull a large volume per
    # broad term, and let is_design_related() do the granular filtering.
    DESIGN_SEARCH_TERMS = [
        "UI UX Designer", 
        "Product Designer", 
        "Graphic Designer", 
        "Art Director", 
        "Web Designer",
        "Motion Graphics"
    ]

    def __init__(
        self,
        site_names: List[str] | None = None,
        locations: List[str] | None = None,
        results_wanted: int = 250,
    ):
        self.site_names = site_names or ["indeed"]
        # Reduced location matrix for speed and to avoid rate limits
        self.locations = locations or [
            "Remote, India",
            "India",
            "Bangalore, India",
            "Mumbai, India",
            "Pune, India",
            "Hyderabad, India"
        ]
        self.results_wanted = results_wanted

    def scrape(self) -> List[Dict[str, Any]]:
        try:
            from jobspy import scrape_jobs
        except ImportError:
            print("[JobSpyScraper] python-jobspy is not installed — skipping.")
            return []

        all_jobs: List[Dict[str, Any]] = []

        for loc in self.locations:
            for term in self.DESIGN_SEARCH_TERMS:
                try:
                    df = scrape_jobs(
                        site_name=self.site_names,
                        search_term=term,
                        location=loc,
                        results_wanted=self.results_wanted,
                        hours_old=720,  # last 30 days (allows older active jobs)
                    )

                    for _, row in df.iterrows():
                        job = {
                            "raw_title": _str(row.get("title")),
                            "company_name": _str(row.get("company_name")),
                            "job_description": _str(row.get("description")),
                            "job_location": _str(row.get("location")),
                            "salary": _build_salary(row),
                            "url": _str(row.get("job_url")),
                            "site": _str(row.get("site")),
                            "date_posted": _str(row.get("date_posted")),
                        }
                        all_jobs.append(job)

                except Exception as exc:
                    print(f"[JobSpyScraper] Error scraping '{term}' in '{loc}': {exc}")
                    continue

        design_jobs = [j for j in all_jobs if is_design_related(j)]
        return dedupe_jobs(design_jobs)

    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        site = raw_data.get("site", "")
        source_label = _SITE_LABELS.get(site.lower(), site.title()) if site else "JobSpy"
        return normalize_job(raw_data, source_label)


# ── helpers ──────────────────────────────────────────────────────────

_SITE_LABELS = {
    "linkedin": "LinkedIn",
    "indeed": "Indeed",
}


def _str(value: Any) -> str | None:
    if value is None:
        return None
    import math
    try:
        if isinstance(value, float) and math.isnan(value):
            return None
    except (TypeError, ValueError):
        pass
    text = str(value).strip()
    return text if text else None


def _build_salary(row: Any) -> str | None:
    lo = row.get("min_amount")
    hi = row.get("max_amount")
    cur = row.get("currency", "")
    parts: List[str] = []
    if lo is not None and _str(lo):
        parts.append(str(lo))
    if hi is not None and _str(hi):
        parts.append(str(hi))
    if not parts:
        return None
    salary = " – ".join(parts)
    if _str(cur):
        salary = f"{cur} {salary}"
    return salary

