// app/api/scrape/route.ts for Vercel deployment (Frontend)
// Assuming types.ts is still in your frontend lib/types.ts
import type { Event } from '@/lib/types'; 

// IMPORTANT: This URL MUST point to your self-hosted backend API.
// It will use the BACKEND_API_URL environment variable you set in Vercel and .env.local.
// If the env var isn't set, it falls back to your specific public IP and port.
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://51.175.105.40:3001'; 

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log(`[${new Date().toISOString()}] Frontend: Fetching events from backend API: ${BACKEND_API_URL}/api/events`);
        const response = await fetch(`${BACKEND_API_URL}/api/events`, {
          // Add headers if your backend API requires authentication (highly recommended for security!)
          // headers: { 'Authorization': `Bearer ${process.env.BACKEND_API_KEY}` } // Example
          next: { revalidate: 3600 } // Next.js cache revalidation every hour (optional, but good for performance)
        });

        if (!response.ok) {
          throw new Error(`Backend API responded with status ${response.status}: ${response.statusText}`);
        }

        const events: Event[] = await response.json();
        console.log(`[${new Date().toISOString()}] Frontend: Received ${events.length} events from backend.`);
        const chunk = JSON.stringify(events);
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));

      } catch (error) {
        console.error(`[${new Date().toISOString()}] Frontend: Error fetching events from backend API:`, error);
        // In case of error, send an empty array or an error message to the client
        controller.enqueue(encoder.encode(`data: []\n\n`));
      } finally {
        controller.close(); // Always close the stream
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache', // Important for Server-Sent Events (SSE)
      'Connection': 'keep-alive',
    },
  });
}

// 'force-dynamic' ensures this route is always run on demand and fetches fresh data
export const dynamic = 'force-dynamic';

// The maxDuration is no longer needed here as the heavy work is offloaded to your Ubuntu server.
// Vercel function will just make a quick HTTP request.
// export const maxDuration = 60; // You can remove this line