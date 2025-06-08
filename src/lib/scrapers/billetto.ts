import { chromium, devices, Page } from 'playwright';
import type { Event } from '@/lib/types';

// The function now accepts a callback to stream data out
export async function scrapeBilletto(
  onData: (events: Event[]) => void
): Promise<void> { // It no longer returns an array, it just calls the callback
  console.log('Launching PLAYWRIGHT to scrape Billetto.no...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    // ... browser context and page setup ...
    const context = await browser.newContext({ ...devices['Desktop Chrome'] });
    const page = await context.newPage();
    await page.goto('https://billetto.no/c/oslo-l', { waitUntil: 'networkidle' });

    try {
      await page.click('button:has-text("Accept all")', { timeout: 5000 });
      console.log('Billetto: Cookie banner accepted.');
    } catch(e) {
      console.log('Billetto: No cookie banner found.');
    }

    let pageNum = 1;
    const maxPagesToScrape = 4;

    while (pageNum <= maxPagesToScrape) {
        console.log(`Billetto: Scraping Page ${pageNum}...`);
        await page.waitForSelector('div.grid.gap-4', { state: 'visible', timeout: 20000 });

        const eventsOnPage = await page.evaluate(() => {
            // ... the evaluate function remains the same ...
            const eventCards = document.querySelectorAll('div.grid > a.space-y-2');
            const eventData: Event[] = [];
            eventCards.forEach(card => {
                const url = (card as HTMLAnchorElement).href;
                const title = card.querySelector('p.font-medium > span')?.textContent?.trim() || '';
                const date = card.querySelector('div[x-show="event.starts_at"] span')?.textContent?.trim() || null;
                const imageUrl = card.querySelector('img[loading="lazy"]')?.getAttribute('src') || undefined;
                const venue = card.querySelector('div[x-text="event.location"]')?.textContent?.trim() || 'Unknown Venue';
                if (title && url) {
                    eventData.push({ id: `billetto-${url.split('/').pop()}-${Math.random()}`, url, title, venue, date, imageUrl, ticketStatus: 'Available', source: 'Billetto', city: 'Oslo', country: 'Norway' });
                }
            });
            return eventData;
        });

        // Instead of adding to a local array, we "yield" the data via the callback
        if (eventsOnPage.length > 0) {
          console.log(`Billetto: Found ${eventsOnPage.length} events on page ${pageNum}. Streaming to client.`);
          onData(eventsOnPage);
        }

        const nextButton = page.locator('button[aria-label="Neste"]:not([disabled])').first();
        if (await nextButton.count() > 0) {
            await nextButton.click();
            await page.waitForTimeout(3000);
            pageNum++;
        } else {
            console.log("Billetto: No more pages. Scraping finished.");
            break;
        }
    }
  } catch (error) {
    console.error('An error occurred during the Billetto scraping process:', error);
    // In a real app, you might want to stream an error message to the client
  } finally {
    if (browser) await browser.close();
  }
}