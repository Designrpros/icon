// File: src/lib/types.ts

// This is the single source of truth for what an Event object looks like.
export interface Event {
  id: string;
  url: string;
  title: string;
  venue: string;
  date: string | null;
  imageUrl?: string;
  description?: string; // Short description from the main list
  ticketStatus?: 'Available' | 'Sold Out' | 'Few Tickets' | 'Free' | 'Cancelled' | 'Info'; // Status from the event page
  source: string;
  city: string;
  country: string;
}