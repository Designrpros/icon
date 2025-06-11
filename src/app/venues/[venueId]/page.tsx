// src/app/venues/[venueId]/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import styled from 'styled-components';
import type { Event, Country, Scene } from '@/lib/types';
import EventCard from '@/components/EventCard';

// --- STYLED COMPONENTS (No changes) ---
const Wrapper = styled.div`
  min-height: 100vh;
  padding: 8rem 2rem 4rem 2rem;
  background-color: #1A1A3D;
  color: #FFFFFF;
`;
const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  margin-bottom: 3rem;
`;
const VenueTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;
const VenueAddress = styled.p`
  font-size: 1.1rem;
  color: #A9A7C7;
  margin-top: 0;
`;
const EventsGrid = styled.main`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;
const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #A9A7C7;
`;
const ErrorText = styled(LoadingText)`
  color: #FF8C42;
  font-weight: 700;
`;

// --- UTILITY FUNCTIONS ---
function slugify(text: string): string {
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

function parseCustomDate(dateString: string | null): Date | null {
    if (!dateString) return null;
    const norwegianMonths: { [key: string]: number } = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mai': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11, 'januar': 0, 'februar': 1, 'mars': 2, 'april': 3, 'juni': 5, 'juli': 6, 'august': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11 };
    const cleanDateString = dateString.toLowerCase().trim();
    const ymdParts = cleanDateString.split('.');
    if (ymdParts.length === 3 && ymdParts[0].length === 2 && ymdParts[1].length === 2 && ymdParts[2].length === 4) {
        return new Date(parseInt(ymdParts[2]), parseInt(ymdParts[1]) - 1, parseInt(ymdParts[0]));
    }
    const parts = cleanDateString.replace('.', '').split(' ');
    const day = parseInt(parts[0], 10) || parseInt(parts[1], 10);
    const month = parts.find(p => norwegianMonths[p] !== undefined);
    if (!isNaN(day) && month) {
        const today = new Date(); let eventYear = today.getFullYear();
        const eventDate = new Date(eventYear, norwegianMonths[month], day);
        if (eventDate < today) eventYear++;
        return new Date(eventYear, norwegianMonths[month], day);
    }
    return null;
}

// --- VENUE DETAIL PAGE COMPONENT ---
export default function VenueDetailPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const venueId = typeof params.venueId === 'string' ? params.venueId : '';

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!API_BASE_URL) {
      setError("Configuration Error: Backend API URL is not set.");
      setIsLoading(false);
      return;
    }
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [eventsRes, venuesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/events`),
          fetch(`${API_BASE_URL}/api/venues`),
        ]);
        if (!eventsRes.ok) throw new Error('Failed to fetch events');
        if (!venuesRes.ok) throw new Error('Failed to fetch venues');
        
        setAllEvents(await eventsRes.json());
        setCountries(await venuesRes.json());
      } catch (err: unknown) { // Changed 'any' to 'unknown'
        // Type-check the error before using it
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
      } 
      finally { setIsLoading(false); }
    };
    fetchAllData();
  }, []);

  const activeVenue = useMemo<Scene | null>(() => {
    if (!venueId || countries.length === 0) return null;
    for (const country of countries) {
      for (const city of country.cities) {
        const foundScene = city.scenes.find(scene => slugify(scene.name) === venueId);
        if (foundScene) return foundScene;
      }
    }
    return null;
  }, [countries, venueId]);

  // --- THIS IS THE FIX ---
  const filteredEvents = useMemo(() => {
    if (!activeVenue) return [];
    const venueNames = [activeVenue.name.toLowerCase(), ...(activeVenue.aliases?.map(a => a.toLowerCase()) || [])];
    
    return allEvents
      .filter(event => venueNames.includes(event.venue.toLowerCase()))
      // Add the .map() here to create the 'parsedDate' property
      .map(event => ({
          ...event,
          parsedDate: parseCustomDate(event.date)
      }))
      .sort((a, b) => {
          if (!a.parsedDate || !b.parsedDate) return 0;
          return a.parsedDate.getTime() - b.parsedDate.getTime();
      });
  }, [allEvents, activeVenue]);
  
  if (isLoading) return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  if (error) return <Wrapper><ErrorText>Error: {error}</ErrorText></Wrapper>;
  if (!activeVenue) return <Wrapper><ErrorText>Venue not found.</ErrorText></Wrapper>;

  return (
    <Wrapper>
      <Header>
        <VenueTitle>{activeVenue.name}</VenueTitle>
        <VenueAddress>{activeVenue.address}</VenueAddress>
      </Header>
      
      <EventsGrid>
        {filteredEvents.map(event => (
          // Now the 'event' object has the required 'parsedDate' and can be passed to the card
          <EventCard key={event.id} event={event} />
        ))}
      </EventsGrid>

      {!isLoading && filteredEvents.length === 0 && (
        <LoadingText>No upcoming events found for this venue.</LoadingText>
      )}
    </Wrapper>
  );
}