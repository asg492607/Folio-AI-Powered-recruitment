import asyncio
import httpx
from unified_backend.portfolio_app.analyzer import _fetch_page, scrape_behance_content, scrape_url_content, BROWSER_HEADERS

async def main():
    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True, headers=BROWSER_HEADERS) as client:
        res = await _fetch_page(client, "https://www.behance.net/dishadubey6")
        print("BEHANCE _fetch_page text length:", len(res['text']))
        print("BEHANCE _fetch_page via:", res['via'])
        print("BEHANCE text snippet:", res['text'][:200])

        res2 = await scrape_url_content("https://www.vaibhavbariyar.in/")
        print("\nWEBSITE scrape_url_content text length:", len(res2[0]))
        print("WEBSITE snippet:", res2[0][:500])

if __name__ == "__main__":
    asyncio.run(main())
