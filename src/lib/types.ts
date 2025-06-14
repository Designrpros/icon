// File: src/lib/types.ts

// --- Event Data Structure ---
export interface Event {
  id: string;
  url: string;
  title: string;
  venue: string;
  date: string | null;
  
  // --- IMPORTANT CHANGE HERE ---
  image_url?: string; // Changed from 'imageUrl' to 'image_url' to match backend JSON
  
  description?: string | null; // Changed to allow null based on backend curl output
  ticket_status?: 'Available' | 'Sold Out' | 'Few Tickets' | 'Free' | 'Cancelled' | 'Info' | string; // Using snake_case for consistency with backend, and 'string' for flexibility
  source: string;
  city: string;
  country: string;
  scraped_at?: string; // Added based on backend curl output (if you use it in frontend)
}

// --- NEW: Venue & Location Data Structures ---

// A single venue/scene with its details.
export interface Scene {
  name: string; // The official, display name of the venue
  address: string;
  coords: [number, number]; // [longitude, latitude]
  aliases?: string[]; // Other names the venue might be called in scrapes
}

// A city containing a list of scenes.
export interface City {
  name: string;
  scenes: Scene[];
}

// A country containing a list of cities.
export interface Country {
  name: string;
  cities: City[];
}


// --- Global Type Declarations (e.g., for VisitOslo scraper) ---
declare global {
  interface Window {
    INITIAL_DATA?: {
      model?: {
        eventResponse?: {
          events: Array<unknown>; // Using 'unknown' for safety; refine as needed based on exact data structure
          totalResults?: number;
          offset?: number;
          count?: number;
        };
      };
    };
  }
}