// app/api/scrape/route.ts (for your Vercel frontend deployment)
// 'use server'; // Keep this line if it's already there (it was removed previously for dynamic export fix)

import type { Event } from '@/lib/types'; 

// This URL MUST point to your self-hosted backend API.
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://51.175.105.40:3001'; 

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log(`[${new Date().toISOString()}] Frontend-Route: Attempting to fetch from backend API: ${BACKEND_API_URL}/api/events`);
        
        const response = await fetch(`${BACKEND_API_URL}/api/events`, {
          next: { revalidate: 3600 } 
        });

        if (!response.ok) {
          const errorBody = await response.text(); 
          console.error(`[${new Date().toISOString()}] Frontend-Route: Backend API responded with non-OK status: ${response.status} ${response.statusText}`);
          console.error(`[${new Date().toISOString()}] Frontend-Route: Backend API error body received: ${errorBody.substring(0, 500)}... (truncated)`);
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text(); 
        
        if (!responseText || responseText.trim() === '') {
            console.warn(`[${new Date().toISOString()}] Frontend-Route: Backend API returned an empty or whitespace-only response.`);
            controller.enqueue(encoder.encode(`data: []\n\n`));
            return;
        }

        let events: Event[] = [];
        try {
            events = JSON.parse(responseText); 
        } catch (jsonError: unknown) { // Changed 'any' to 'unknown'
            // Add type guards to safely access error properties
            let errorMessage = "Unknown JSON parsing error";
            if (jsonError instanceof Error) {
                errorMessage = jsonError.message;
            } else if (typeof jsonError === 'object' && jsonError !== null && 'message' in jsonError) {
                errorMessage = String((jsonError as { message: unknown }).message);
            }
            
            console.error(`[${new Date().toISOString()}] Frontend-Route: Failed to parse JSON from backend API:`, errorMessage);
            console.error(`[${new Date().toISOString()}] Frontend-Route: Malformed JSON received (first 500 chars):`, responseText.substring(0, 500));
            if (responseText.length < 5000) { 
                console.error(`[${new Date().toISOString()}] Frontend-Route: Full malformed JSON:`, responseText);
            }
            controller.enqueue(encoder.encode(`data: []\n\n`));
            return;
        }

        console.log(`[${new Date().toISOString()}] Frontend-Route: Successfully received and parsed ${events.length} events from backend.`);
        const chunk = JSON.stringify(events);
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));

      } catch (error: unknown) { // Changed 'any' to 'unknown'
        let errorMessage = "Unknown error during fetch or processing";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = String((error as { message: unknown }).message);
        }
        
        console.error(`[${new Date().toISOString()}] Frontend-Route: Catch-all error during fetch or processing:`, errorMessage);
        controller.enqueue(encoder.encode(`data: []\n\n`));
      } finally {
        controller.close();
      }
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

export const dynamic = 'force-dynamic';