// app/api/scrape/route.ts (for your Vercel frontend deployment)

import type { Event } from '@/lib/types'; 

// IMPORTANT: This URL MUST point to your self-hosted backend API.
// It uses the BACKEND_API_URL environment variable from Vercel's settings.
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://51.175.105.40:3001'; 

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log(`[${new Date().toISOString()}] Frontend-Route: Attempting to fetch from backend API: ${BACKEND_API_URL}/api/events`);
        
        const response = await fetch(`${BACKEND_API_URL}/api/events`, {
          // Add headers if your backend API requires authentication
          // headers: { 'Authorization': `Bearer ${process.env.BACKEND_API_KEY}` },
          next: { revalidate: 3600 } // Next.js cache revalidation every hour (optional, but good)
        });

        if (!response.ok) {
          // Log more details if the response status is not OK
          const errorBody = await response.text(); // Try to read the error body
          console.error(`[${new Date().toISOString()}] Frontend-Route: Backend API responded with non-OK status: ${response.status} ${response.statusText}`);
          console.error(`[${new Date().toISOString()}] Frontend-Route: Backend API error body received: ${errorBody.substring(0, 500)}... (truncated)`);
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        // --- BEGIN: Added Robustness for JSON Parsing ---
        const responseText = await response.text(); // Read the response as text first
        
        if (!responseText || responseText.trim() === '') {
            console.warn(`[${new Date().toISOString()}] Frontend-Route: Backend API returned an empty or whitespace-only response.`);
            controller.enqueue(encoder.encode(`data: []\n\n`)); // Send empty array if response is truly empty
            return;
        }

        let events: Event[] = [];
        try {
            events = JSON.parse(responseText); // Manually parse the text
        } catch (jsonError: any) {
            console.error(`[${new Date().toISOString()}] Frontend-Route: Failed to parse JSON from backend API:`, jsonError.message);
            console.error(`[${new Date().toISOString()}] Frontend-Route: Malformed JSON received (first 500 chars):`, responseText.substring(0, 500));
            // Log the full responseText if it's not too large for debugging
            if (responseText.length < 5000) { // Limit logging very large responses
                console.error(`[${new Date().toISOString()}] Frontend-Route: Full malformed JSON:`, responseText);
            }
            controller.enqueue(encoder.encode(`data: []\n\n`)); // Send empty array on parse error
            return;
        }
        // --- END: Added Robustness for JSON Parsing ---

        console.log(`[${new Date().toISOString()}] Frontend-Route: Successfully received and parsed ${events.length} events from backend.`);
        const chunk = JSON.stringify(events);
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));

      } catch (error: any) {
        // Catch any errors during fetch or initial checks
        console.error(`[${new Date().toISOString()}] Frontend-Route: Catch-all error during fetch or processing:`, error.message);
        controller.enqueue(encoder.encode(`data: []\n\n`));
      } finally {
        controller.close(); // Ensure the stream is always closed
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream', // Important for Server-Sent Events
      'Cache-Control': 'no-cache', // Prevent caching of SSE streams
      'Connection': 'keep-alive',
    },
  });
}

// 'force-dynamic' ensures this route is always run on demand and fetches fresh data
export const dynamic = 'force-dynamic';