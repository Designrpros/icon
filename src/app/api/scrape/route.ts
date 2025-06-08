import { getScrapedEvents } from '@/lib/scraper-cache';
import type { Event } from '@/lib/types';

export const dynamic = 'force-dynamic'; // Ensure this route is always run dynamically

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const onData = (events: Event[]) => {
        const chunk = JSON.stringify(events);
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
      };
      
      // Call our cache manager. It handles all the logic about
      // whether to return cached data or start a new scrape.
      await getScrapedEvents(onData);

      // Once the manager is done (either by sending cache or finishing a scrape), close the stream.
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}