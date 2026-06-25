from typing import Any, Dict

from sqlalchemy.orm import Session

from app.categorization.classifier import OpportunityClassifier
from app.intelligence.pipeline import IntelligencePipeline
from app.repositories.opportunity_repo import OpportunityRepository
from app.schemas.opportunity import OpportunityCreate
from app.scrapers.arbeitnow import ArbeitnowScraper
from app.scrapers.authentic_coroflot import AuthenticJobsScraper, CoroflotScraper
from app.scrapers.behance import BehanceScraper
from app.scrapers.dribbble import DribbbleScraper
from app.scrapers.internshala import IntershalaScraper
from app.scrapers.jobspy_scraper import JobSpyScraper
from app.scrapers.justremote_creative import JustRemoteScraper, CreativepoolScraper, SmashingMagScraper
from app.scrapers.krop_motionographer import KropScraper, MotionographerScraper
from app.scrapers.remotive import RemotiveScraper
from app.scrapers.the_muse import TheMuseScraper
from app.scrapers.weworkremotely import WeWorkRemotelyScraper
from app.scrapers.reliable_apis import RemoteOKScraper, HimalayasScraper, JobicyIndiaScraper
from app.scrapers.startups import YCombinatorScraper
from app.scrapers.freelance import UpworkScraper, UXJobsBoardScraper
from app.scrapers.naukri import NaukriScraper
from app.scrapers.instahyre import InstahyreScraper
from app.scrapers.cutshort import CutShortScraper
from app.scrapers.linkedin import LinkedInScraper
from app.scrapers.foundit import FounditScraper
from app.scrapers.hirist import HiristScraper
from app.scrapers.glassdoor import GlassdoorScraper
from app.scrapers.jobspy_scraper import JobSpyScraper
from app.scrapers.internshala_scraper import InternshalaScraper
from app.scrapers.naukri_scraper import NaukriScraper
from app.scrapers.job_scratcher_scraper import JobScratcherScraper

class ScrapingService:
    def __init__(self, db: Session):
        self.repo = OpportunityRepository(db)
        self.classifier = OpportunityClassifier()
        self.pipeline = IntelligencePipeline()
        self.scrapers = {
            # ── External API ─────────────────────────────────────────────
            "jobscratcher": JobScratcherScraper(),
            
            # The following are temporarily disabled as per user request
            # "linkedin": JobSpyScraper(site_names=["linkedin"]),
            # "naukri": NaukriScraper(),
            # "internshala": InternshalaScraper(),
            # "foundit": FounditScraper(),
            # "hirist": HiristScraper(),
            # "instahhyre": InstahyreScraper(),
            # "cutshort": CutShortScraper(),
            # "jobicy_india": JobicyIndiaScraper(),
            
            # ── Global Giants (Global + India via JobSpy/Custom) ─────────
            # "glassdoor": GlassdoorScraper(),
            "jobspy": JobSpyScraper(),
            
            # ── Public APIs ─────────────────────────────────────────────
            "remotive": RemotiveScraper(),
            # "arbeitnow": ArbeitnowScraper(),
            "remoteok": RemoteOKScraper(),
            "himalayas": HimalayasScraper(),
            "ycombinator": YCombinatorScraper(),
            # "uxjobsboard": UXJobsBoardScraper(),
            
            # ── Design-Specific ─────────────────────────────────────────
            # "behance": BehanceScraper(),
            # "dribbble": DribbbleScraper(),
            # "authentic_jobs": AuthenticJobsScraper(),
            # "coroflot": CoroflotScraper(),
            # "justremote": JustRemoteScraper(),
            # "creativepool": CreativepoolScraper(),
            # "smashing": SmashingMagScraper(),
            # "krop": KropScraper(),
            # "motionographer": MotionographerScraper(),
            # "weworkremotely": WeWorkRemotelyScraper(),
            # "the_muse": TheMuseScraper(),
        }

    # Keys from IntelligencePipeline / normalize_job that are NOT in OpportunityCreate schema
    _RAW_KEYS = {"raw_title", "company_name", "job_description", "job_location",
                 "site", "date_posted", "created_at", "updated_at"}

    def _to_opp_data(self, enhanced_job: Dict[str, Any]) -> OpportunityCreate:
        """Strips internal pipeline keys, then constructs a validated OpportunityCreate."""
        clean = {k: v for k, v in enhanced_job.items() if k not in self._RAW_KEYS}
        return OpportunityCreate(**clean)

    def scrape_source(self, source: str = "behance") -> Dict[str, Any]:
        """Legacy synchronous scrape method for a single source."""
        scraper = self.scrapers.get(source)
        if not scraper:
            return {"source": source, "created": 0, "updated": 0, "error": "Unknown source"}

        try:
            raw_items = scraper.scrape()
        except Exception as error:
            return {"source": source, "fetched": 0, "created": 0, "updated": 0, "error": str(error)}

        created = 0
        updated = 0

        for raw_item in raw_items:
            try:
                normalized = scraper.normalize(raw_item)
                enhanced_job = self.pipeline.process_job(normalized)
                skills = self.classifier.classify_skills(enhanced_job.get("description", ""))
                enhanced_job["skills"] = list(skills)

                opp_data = self._to_opp_data(enhanced_job)
                opportunity, was_created = self.repo.upsert_by_advanced_dedupe(opp_data)

                if opportunity and was_created:
                    created += 1
                else:
                    updated += 1
            except Exception as e:
                print(f"[ScrapingService] Failed to save item from {source}: {type(e).__name__}: {e}")
                continue

        return {"source": source, "fetched": len(raw_items), "created": created, "updated": updated}

    def scrape_all(self) -> Dict[str, Any]:
        import concurrent.futures
        
        # Clean up expired or stale opportunities first
        try:
            deleted = self.repo.delete_expired()
            print(f"[ScrapingService] Deleted {deleted} expired opportunities.")
        except Exception as e:
            print(f"[ScrapingService] Failed to delete expired opportunities: {e}")
        
        # 1. Fetch raw items concurrently (Network IO Bound)
        def fetch_raw(source_name: str):
            scraper = self.scrapers.get(source_name)
            try:
                raw_items = scraper.scrape()
                return source_name, raw_items, None
            except Exception as e:
                return source_name, [], str(e)

        results = []
        # Use 15 threads to fetch from all 15+ platforms simultaneously
        with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
            future_to_source = {executor.submit(fetch_raw, src): src for src in self.scrapers}
            for future in concurrent.futures.as_completed(future_to_source):
                source_name, raw_items, error = future.result()
                
                if error:
                    results.append({"source": source_name, "fetched": 0, "created": 0, "updated": 0, "error": error})
                    continue
                    
                scraper = self.scrapers[source_name]
                created = 0
                updated = 0
                
                # 2. Process and insert sequentially to protect SQLite from Database Locked errors
                for raw_item in raw_items:
                    try:
                        normalized = scraper.normalize(raw_item)
                        enhanced_job = self.pipeline.process_job(normalized)
                        skills = self.classifier.classify_skills(enhanced_job.get("description", ""))
                        enhanced_job["skills"] = list(skills)
                        
                        opp_data = self._to_opp_data(enhanced_job)
                        opportunity, was_created = self.repo.upsert_by_advanced_dedupe(opp_data)
                        
                        if opportunity and was_created:
                            created += 1
                            # Push to Matchmaking Engine
                            import requests, os
                            port = os.getenv("PORT", "10000")
                            try:
                                payload = {
                                    "job_id": str(opportunity.id),
                                    "title": opportunity.title,
                                    "company": opportunity.company,
                                    "description": opportunity.description or "",
                                    "skills": [s.name for s in (opportunity.skills or [])],
                                    "tools": [],
                                    "industry": str(opportunity.domain.value) if opportunity.domain else "",
                                    "location": opportunity.location or "",
                                    "job_type": str(opportunity.category.value) if opportunity.category else "",
                                    "metadata": {
                                        "apply_url": opportunity.apply_url or "",
                                        "source": opportunity.source or "",
                                        "salary_range": opportunity.salary or "",
                                        "category": str(opportunity.category.value) if opportunity.category else "",
                                        "domain": str(opportunity.domain.value) if opportunity.domain else "",
                                        "location": opportunity.location or "",
                                        "remote_status": str(opportunity.remote_status.value) if opportunity.remote_status else "",
                                        "description": opportunity.description or "",
                                        "skills": [{"name": s.name} for s in (opportunity.skills or [])]
                                    }
                                }
                                headers = {"x-api-key": os.getenv("MATCHING_API_KEY", "")}
                                res = requests.post(f"http://127.0.0.1:{port}/api/portfolio/v1/jobs", json=payload, headers=headers, timeout=5)
                                res.raise_for_status()
                            except Exception as ingest_err:
                                print(f"[ScrapingService] Failed to ingest job to Matchmaking Engine: {ingest_err}")
                        else:
                            updated += 1
                    except Exception as e:
                        print(f"[ScrapingService] Failed to save item from {source_name}: {type(e).__name__}: {e}")
                        continue
                        
                results.append({
                    "source": source_name,
                    "fetched": len(raw_items),
                    "created": created,
                    "updated": updated
                })
                
        return {
            "results": results,
            "total_sources": len(results),
            "created": sum(r.get("created", 0) for r in results),
            "updated": sum(r.get("updated", 0) for r in results),
        }

