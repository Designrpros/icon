// File: src/lib/types.ts

// --- Event Data Structure ---
export interface Event {
  id: string;
  url: string;
  title: string;
  venue: string;
  date: string | null;
  imageUrl?: string;
  description?: string;
  ticketStatus?: 'Available' | 'Sold Out' | 'Few Tickets' | 'Free' | 'Cancelled' | 'Info';
  source: string;
  city: string;
  country: string;
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
// This tells TypeScript that `window` might have an `INITIAL_DATA` property
declare global {
  interface Window {
    INITIAL_DATA?: {
      model?: {
        eventResponse?: {
          events: Array<any>; // This is the array of raw event objects from VisitOslo's data
          totalResults?: number;
          offset?: number;
          count?: number;
          // Add other properties if needed for pagination logic later
        };
      };
    };
  }
}