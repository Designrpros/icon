import type { Event } from './types';
import { scrapeRockefeller } from './scrapers/rockefeller';
import { scrapeBilletto } from './scrapers/billetto';
import { kv } from '@vercel/kv'; // Import Vercel KV client

// Cache key for our events data
const CACHE_KEY = 'all_events_cache';
// Cache TTL in seconds (Vercel KV uses seconds for expire)
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

// Use a simple lock mechanism for concurrent scrapes
// This is NOT perfect for distributed serverless functions,
// but better than nothing. A truly robust solution would use
// distributed locks (e.g., Redis `SETNX` or similar).
let scrapeInProgressPromise: Promise<void> | null = null; // In-memory lock for a single instance

/**
 * This function manages the scraping process, using an external cache.
 * It checks the cache, scrapes if necessary, and stores results externally.
 *
 * @param onData Callback to stream events as they are found to the current request.
 */
export async function getScrapedEvents(onData: (chunk: Event[]) => void): Promise<void> {
  // 1. Try to get data from cache
  try {
    const cachedDataString = await kv.get<string>(CACHE_KEY);
    if (cachedDataString) {
      const cachedEvents: Event[] = JSON.parse(cachedDataString);
      console.log("Cache: Returning data from Vercel KV cache.");
      onData(cachedEvents); // Send the whole cached chunk immediately
      return; // Data found, no need to scrape
    }
  } catch (error) {
    console.error("Error fetching from KV cache:", error);
    // Continue to scrape if cache read fails
  }

  // 2. No fresh data in cache or cache read failed, need to scrape.
  // Implement a basic distributed lock for Vercel functions using a KV key
  const LOCK_KEY = 'scrape_lock';
  const LOCK_TTL_SECONDS = 300; // Lock for 5 minutes, should be longer than max scrape time

  // Attempt to acquire a lock
  const lockAcquired = await kv.set(LOCK_KEY, 'locked', { nx: true, ex: LOCK_TTL_SECONDS });

  if (lockAcquired) {
    // We acquired the lock, start a new scrape
    console.log("Scraper: Acquired lock, starting new scrape.");
    scrapeInProgressPromise = new Promise(async (resolve, reject) => {
      const freshData: Event[] = [];
      const streamToCache = (events: Event[]) => {
        freshData.push(...events); // Add to our complete dataset
        onData(events); // Also stream to the current user
      };

      try {
        await Promise.all([
          scrapeRockefeller(streamToCache),
          scrapeBilletto(streamToCache),
        ]);

        console.log(`Scraper: Completed scrape with ${freshData.length} events.`);
        // Store the new data in KV and set its TTL
        await kv.set(CACHE_KEY, JSON.stringify(freshData), { ex: CACHE_TTL_SECONDS });
        console.log("Scraper: Stored new data in Vercel KV.");

        // Release the lock
        await kv.del(LOCK_KEY);
        console.log("Scraper: Released lock.");

        resolve();
      } catch (error) {
        console.error("Scraper: Error during scrape:", error);
        // Ensure lock is released even on error
        await kv.del(LOCK_KEY);
        reject(error);
      } finally {
        scrapeInProgressPromise = null; // Clear local instance promise
      }
    });
    return scrapeInProgressPromise;
  } else {
    // Lock is held by another instance or was recently held, wait or try cache again
    console.log("Scraper: Lock is held by another instance. Trying cache again in case it updated.");
    // Wait for a brief moment and check cache again, or simply return an existing promise if there is one.
    // For simplicity, we'll try fetching from cache one more time in case the other instance
    // just finished and updated KV. If not, the user might have to wait for the next scrape cycle.
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    const cachedDataString = await kv.get<string>(CACHE_KEY);
    if (cachedDataString) {
      const cachedEvents: Event[] = JSON.parse(cachedDataString);
      console.log("Cache: Returning data from Vercel KV cache after brief wait.");
      onData(cachedEvents);
      return;
    } else {
      // If still no cache after waiting, it means another instance is probably scraping.
      // We can either return an empty array, or throw an error, or just wait longer.
      // For a robust system, you might poll the lock or use WebSockets to inform the client.
      console.log("Scraper: No cached data available, and another scrape is likely in progress.");
      onData([]); // Send an empty array to avoid hanging the client
      return;
    }
  }
}