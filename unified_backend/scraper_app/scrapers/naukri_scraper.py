import re
from typing import Any, Dict, List
from bs4 import BeautifulSoup
from app.scrapers.base import BaseScraper
from app.scrapers.common import dedupe_jobs, is_design_related, normalize_job, ResilientScraperMixin


class NaukriScraper(BaseScraper, ResilientScraperMixin):
    def __init__(self):
        super().__init__()
        self.session = self.build_session()
        self.base_url = "https://www.naukri.com"
        # Search URL for UI/UX/Design related jobs in India
        self.search_url = "https://www.naukri.com/ui-ux-designer-jobs"

    def scrape(self) -> List[Dict[str, Any]]:
        all_jobs: List[Dict[str, Any]] = []
        try:
            html = self.get_rendered_html(self.search_url)
            soup = BeautifulSoup(html, "html.parser")
            
            # Naukri uses jobTuple wrappers
            cards = soup.find_all("div", class_=re.compile("jobTuple|srp-jobtuple-wrapper"))
            
            for card in cards:
                title_elem = card.find("a", class_=re.compile("title"))
                company_elem = card.find("a", class_=re.compile("comp-name|subTitle"))
                location_elem = card.find("span", class_=re.compile("locWdth|location"))
                desc_elem = card.find("div", class_=re.compile("job-desc"))
                sal_elem = card.find("span", class_=re.compile("sal|salary"))
                
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                company = company_elem.get_text(strip=True) if company_elem else "Unknown Company"
                location = location_elem.get_text(strip=True) if location_elem else "India"
                description = desc_elem.get_text(strip=True) if desc_elem else "Design opportunity on Naukri."
                salary = sal_elem.get_text(strip=True) if sal_elem else "Not specified"
                
                url = title_elem["href"] if "href" in title_elem.attrs else self.search_url
                
                job = {
                    "raw_title": title,
                    "company_name": company,
                    "job_description": description,
                    "job_location": location,
                    "salary": salary,
                    "url": url,
                    "site": "Naukri",
                    "date_posted": None,
                }
                all_jobs.append(job)
                
        except Exception as exc:
            print(f"[NaukriScraper] Error scraping: {exc}")

        if not all_jobs:
            print("[NaukriScraper] WARNING: 0 jobs found! Page structure might have changed or bot blocked.")
            return []

        design_jobs = [j for j in all_jobs if is_design_related(j)]
        print(f"[NaukriScraper] Filtered to {len(design_jobs)} design jobs.")
        return dedupe_jobs(design_jobs)

    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return normalize_job(raw_data, "Naukri")
