import type { Event } from './types';
import { scrapeRockefeller } from './scrapers/rockefeller';
import { scrapeBilletto } from './scrapers/billetto';

// Define the shape of our cache
interface ScraperCache {
  data: Event[];
  // We store the promise so that if 100 users arrive at once,
  // we only start ONE scrape, and they all wait for the same result.
  scrapePromise: Promise<void> | null;
  lastScraped: Date | null;
}

// Create an in-memory cache object. This will persist as long as your server instance is running.
const cache: ScraperCache = {
  data: [],
  scrapePromise: null,
  lastScraped: null,
};

// Set a Time-to-Live (TTL) for the cache, e.g., 1 hour
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * This is the main function that manages the scraping process.
 * It ensures that scraping only runs when needed.
 */
export function getScrapedEvents(onData: (chunk: Event[]) => void): Promise<void> {
  const now = new Date();

  // If a scrape is already in progress, return the existing promise
  if (cache.scrapePromise) {
    console.log("Cache: A scrape is already in progress. Waiting for it to complete.");
    return cache.scrapePromise;
  }

  // If we have recent data, send it immediately and don't re-scrape
  if (cache.lastScraped && (now.getTime() - cache.lastScraped.getTime() < CACHE_TTL_MS)) {
    console.log("Cache: Returning fresh data from cache.");
    onData(cache.data); // Send the whole cached chunk
    return Promise.resolve(); // Immediately resolve
  }

  // If the cache is old or empty, start a new scrape
  console.log("Cache: Stale or empty. Starting a new scrape.");
  
  // Create a new promise and store it in the cache. This is the key to the singleton pattern.
  cache.scrapePromise = new Promise(async (resolve) => {
    // A temporary array to hold all results from this run
    const freshData: Event[] = [];

    const streamToCache = (events: Event[]) => {
      freshData.push(...events); // Add to our complete dataset
      onData(events); // Also stream to the current user
    };

    // Run scrapers in parallel
    await Promise.all([
      scrapeRockefeller(streamToCache),
      scrapeBilletto(streamToCache),
    ]);

    // Once complete, update the cache with the full dataset
    cache.data = freshData;
    cache.lastScraped = new Date();
    console.log(`Cache: Updated with ${freshData.length} events.`);

    // Clear the promise now that the scrape is done
    cache.scrapePromise = null;
    resolve();
  });

  return cache.scrapePromise;
}