// app/api/scrape/route.ts (for your Vercel frontend deployment)
// 'use server'; // Keep this line removed as per previous fix, unless you know you need it.

import type { Event } from '@/lib/types'; 

// IMPORTANT: This URL MUST point to your self-hosted backend API.
// It uses the BACKEND_API_URL environment variable you set in Vercel and .env.local.
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://51.175.105.40:3001'; 

export async function GET() {
  try {
    console.log(`[${new Date().toISOString()}] Frontend-Route: Attempting to fetch from backend API: ${BACKEND_API_URL}/api/events`);
    
    const response = await fetch(`${BACKEND_API_URL}/api/events`, {
      // 'no-store' bypasses Next.js's automatic fetch caching for this request
      // and ensures it always goes to your backend.
      cache: 'no-store', 
      // If you want to revalidate every hour, use this instead of cache: 'no-store'
      // next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      // Log more details if the response status is not OK
      const errorText = await response.text(); 
      console.error(`[${new Date().toISOString()}] Frontend-Route: Backend API responded with non-OK status: ${response.status} ${response.statusText}`);
      console.error(`[${new Date().toISOString()}] Frontend-Route: Backend API error body received: ${errorText.substring(0, 500)}... (truncated)`);
      
      // Return a non-OK JSON response from Vercel's route handler if backend failed
      return new Response(JSON.stringify({ error: `Backend API failed: ${response.status} ${response.statusText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const responseText = await response.text(); // Read the response as text first
    
    if (!responseText || responseText.trim() === '') {
        console.warn(`[${new Date().toISOString()}] Frontend-Route: Backend API returned an empty or whitespace-only response.`);
        // Return an empty JSON array if response is truly empty
        return new Response('[]', {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let events: Event[] = [];
    try {
        events = JSON.parse(responseText); // Manually parse the text
    } catch (jsonError: unknown) {
        let errorMessage = "Unknown JSON parsing error on Vercel server";
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
        
        // Return an error JSON response
        return new Response(JSON.stringify({ error: "Failed to parse backend data" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    console.log(`[${new Date().toISOString()}] Frontend-Route: Successfully received and parsed ${events.length} events from backend.`);
    
    // --- THIS IS THE KEY CHANGE ---
    // Return a standard JSON Response object directly, not an SSE stream.
    return new Response(JSON.stringify(events), {
      status: 200, // HTTP OK
      headers: {
        'Content-Type': 'application/json', // Crucial header for browser to understand it's JSON
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300' // Example caching strategy for this response
      },
    });

  } catch (error: unknown) {
    // Catch any unexpected errors during fetch or initial processing
    let errorMessage = "Unknown error during fetch or processing in Vercel Route Handler";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
    }
    
    console.error(`[${new Date().toISOString()}] Frontend-Route: Catch-all error during fetch or processing:`, errorMessage);
    
    // Return a generic 500 error response
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 'force-dynamic' can still be used if you want to bypass Next.js data cache completely for this route
// If you use 'cache: no-store' above, 'force-dynamic' is often redundant but doesn't hurt.
export const dynamic = 'force-dynamic';