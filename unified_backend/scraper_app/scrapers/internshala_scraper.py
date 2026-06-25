import re
from typing import Any, Dict, List
from bs4 import BeautifulSoup
from app.scrapers.base import BaseScraper
from app.scrapers.common import dedupe_jobs, is_design_related, normalize_job, ResilientScraperMixin


class InternshalaScraper(BaseScraper, ResilientScraperMixin):
    def __init__(self):
        super().__init__()
        self.session = self.build_session()
        self.base_url = "https://internshala.com"
        self.search_url = "https://internshala.com/internships/design-internship/"

    def scrape(self) -> List[Dict[str, Any]]:
        all_jobs: List[Dict[str, Any]] = []
        try:
            html = self.get_rendered_html(self.search_url)
            soup = BeautifulSoup(html, "html.parser")
            
            # Internshala usually has cards with class 'individual_internship'
            cards = soup.find_all("div", class_=re.compile("individual_internship|internship_meta"))
            
            for card in cards:
                title_elem = card.find("h3", class_="profile")
                company_elem = card.find("h4", class_="company_name")
                location_elem = card.find(string=re.compile("Work From Home|Remote", re.I)) or card.find(class_="location_link")
                
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                company = company_elem.get_text(strip=True) if company_elem else "Unknown Company"
                location = location_elem.get_text(strip=True) if location_elem else "India"
                
                link_elem = title_elem.find("a")
                url = self.base_url + link_elem["href"] if link_elem and "href" in link_elem.attrs else self.search_url
                
                job = {
                    "raw_title": title,
                    "company_name": company,
                    "job_description": "Design internship opportunity on Internshala.",
                    "job_location": location,
                    "salary": "Unpaid/Stipend",
                    "url": url,
                    "site": "Internshala",
                    "date_posted": None,
                }
                all_jobs.append(job)
                
        except Exception as exc:
            print(f"[InternshalaScraper] Error scraping: {exc}")

        if not all_jobs:
            print("[InternshalaScraper] WARNING: 0 jobs found! Page structure might have changed.")
            return []

        design_jobs = [j for j in all_jobs if is_design_related(j)]
        print(f"[InternshalaScraper] Filtered to {len(design_jobs)} design jobs.")
        return dedupe_jobs(design_jobs)

    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return normalize_job(raw_data, "Internshala")
