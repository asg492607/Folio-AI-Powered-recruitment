import requests
from typing import Any, Dict, List
from app.scrapers.base import BaseScraper
from app.scrapers.common import dedupe_jobs, is_design_related, normalize_job


class JobScratcherScraper(BaseScraper):
    """
    Fetches pre-scraped jobs from the external job-scratcher API.
    """
    def __init__(self):
        self.api_url = "https://job-scratcher.onrender.com/api/v1/opportunities"

    def scrape(self) -> List[Dict[str, Any]]:
        try:
            response = requests.get(self.api_url, timeout=30)
            if response.status_code != 200:
                print(f"[JobScratcherScraper] API returned {response.status_code}")
                return []
                
            data = response.json()
            all_jobs = []
            
            for item in data:
                job = {
                    "raw_title": item.get("title", ""),
                    "company_name": item.get("company", ""),
                    "job_description": item.get("description", ""),
                    "job_location": item.get("location", ""),
                    "salary": item.get("stipend") or item.get("salary") or "",
                    "url": item.get("apply_url", ""),
                    "site": item.get("source", "JobScratcher"),
                    "date_posted": item.get("created_at", ""),
                }
                all_jobs.append(job)
                
            design_jobs = [j for j in all_jobs if is_design_related(j)]
            print(f"[JobScratcherScraper] Fetched {len(all_jobs)} jobs, {len(design_jobs)} are design related.")
            return dedupe_jobs(design_jobs)
            
        except Exception as exc:
            print(f"[JobScratcherScraper] Error fetching from API: {exc}")
            return []

    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return normalize_job(raw_data, raw_data.get("site", "JobScratcher"))
