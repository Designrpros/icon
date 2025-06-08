import { chromium, devices, type Page } from 'playwright';
import type { Event } from '@/lib/types';
import path from 'path';

const ROCKEFELLER_BASE_URL = 'https://www.rockefeller.no';

async function revealAllEvents(page: Page) {
  const eventListSelector = 'ul.grid-cols-1 > li';

  console.log('Rockefeller: Waiting for the first event item to be rendered...');
  try {
    await page.waitForSelector(`${eventListSelector}:first-child`, { state: 'visible', timeout: 20000 });
    console.log('Rockefeller: First event is visible. Starting gentle, human-like scroll...');
  } catch (error) {
    console.error("Rockefeller: Fatal: The first event item did not appear.");
    await page.screenshot({ path: path.join(process.cwd(), 'debug-rockefeller-fail.png') });
    return;
  }

  let previousEventCount = 0;
  let scrollAttempts = 0;
  const maxScrolls = 30;

  while (scrollAttempts < maxScrolls) {
    const currentEventCount = await page.locator(eventListSelector).count();
    if (scrollAttempts > 0 && currentEventCount === previousEventCount) {
      console.log('Rockefeller: Scroll did not reveal new events. Assuming end of list.');
      break;
    }
    console.log(`Rockefeller: Scroll attempt #${scrollAttempts + 1}: Found ${currentEventCount} events.`);
    previousEventCount = currentEventCount;
    await page.evaluate(() => { window.scrollBy(0, window.innerHeight); });
    await page.waitForTimeout(750);
    scrollAttempts++;
  }
  console.log(`Rockefeller: Gentle scroll complete. Total event items revealed: ${previousEventCount}`);
}

async function ensureAllImagesAreLoaded(page: Page) {
    console.log('Rockefeller: Scanning page to ensure all images are loaded...');
    const eventLocators = await page.locator('ul.grid-cols-1 > li').all();
    if (eventLocators.length === 0) return;
    for (let i = 0; i < eventLocators.length; i++) {
        try {
            await eventLocators[i].scrollIntoViewIfNeeded({ timeout: 1000 });
            await page.waitForTimeout(25); 
        } catch (e) {
            console.log(`Rockefeller: Could not scroll to event ${i + 1}, but continuing scan.`);
        }
    }
    console.log('Rockefeller: Image loading scan complete.');
}


export async function scrapeRockefeller(
  onData: (events: Event[]) => void
): Promise<void> {
  console.log('Launching MANUAL STEALTH PLAYWRIGHT to scrape Rockefeller.no...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      ...devices['Desktop Chrome'],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    console.log('Rockefeller: Navigating...');
    await page.goto(ROCKEFELLER_BASE_URL, { waitUntil: 'domcontentloaded' });
    
    await revealAllEvents(page);
    await ensureAllImagesAreLoaded(page);

    console.log("Rockefeller: Extracting data from the page...");
    const events = await page.evaluate((baseUrl: string) => {
      type ScrapedEvent = {
        id: string; url: string; title: string; venue: string; date: string | null;
        imageUrl?: string; description?: string;
        ticketStatus?: 'Available' | 'Sold Out' | 'Few Tickets' | 'Free' | 'Cancelled' | 'Info';
        source: string; city: string; country: string;
      };
      const getTicketStatusInBrowser = (buttonText: string | undefined | null): ScrapedEvent['ticketStatus'] => {
         const text = buttonText?.trim().toLowerCase();
          if (!text) return 'Info';
          if (text.includes('utsolgt')) return 'Sold Out';
          if (text.includes('få billetter')) return 'Few Tickets';
          if (text.includes('billetter')) return 'Available';
          return 'Info';
      }
      const eventCards = document.querySelectorAll('ul.grid-cols-1 > li');
      const eventData: ScrapedEvent[] = [];
      eventCards.forEach(card => {
        const linkElement = card.querySelector('a');
        const relativeUrl = linkElement?.getAttribute('href');
        if (relativeUrl) {
          const url = `${baseUrl}${relativeUrl}`;
          const title = card.querySelector('div.font-bold.font-heading')?.textContent?.trim() || '';
          const date = card.querySelector('div.shrink-0')?.textContent?.trim() || null;
          const venue = card.querySelector('div.font-auditorium.text-sm.font-light')?.textContent?.trim() || 'Unknown Venue';
          const description = card.querySelector('div.group-hover\\:italic')?.textContent?.trim() || undefined;
          const imageUrl = card.querySelector('img')?.getAttribute('src') || undefined;
          const ticketButtonText = card.querySelector('button[role="link"]')?.textContent;
          const ticketStatus = getTicketStatusInBrowser(ticketButtonText);
          const id = `rockefeller-${relativeUrl.split('/').pop()}`;
          if (title && url) {
             eventData.push({ id, url, title, date, venue, imageUrl, description, ticketStatus, source: 'Rockefeller', city: 'Oslo', country: 'Norway', });
          }
        }
      });
      return eventData;
    }, ROCKEFELLER_BASE_URL);

    if (events.length > 0) {
      console.log(`Rockefeller: Found ${events.length} events. Streaming to client.`);
      onData(events);
    }

  } catch (error) {
    console.error('An error occurred during the Rockefeller scraping process:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Rockefeller: Playwright browser closed.');
    }
  }
}