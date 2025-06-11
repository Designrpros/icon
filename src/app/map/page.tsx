'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import type { Event, Country, Scene } from '@/lib/types';
import type { VenueOnMap } from '@/components/Map';

// --- STYLED COMPONENTS ---
const Wrapper = styled.div`
  min-height: 100vh;
  padding-top: 8rem;
  background-color: #1A1A3D;
  background-image: radial-gradient(ellipse at 50% -20%, rgba(255, 140, 66, 0.1), transparent 70%);
  color: #FFFFFF;
`;

const Header = styled.header`
  padding: 0 2rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  span {
    color: #FF8C42;
  }
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

// --- DYNAMIC MAP IMPORT ---
const EventMap = dynamic(() => import('@/components/Map').then((mod) => mod.EventMap), {
  loading: () => <LoadingText>Loading map...</LoadingText>,
  ssr: false
});

// Default map view centered on Norway
const NORWAY_INITIAL_VIEW_STATE = {
  longitude: 15.4,
  latitude: 65.5,
  zoom: 3.8
};

export default function MapPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!API_BASE_URL) {
      setError("Configuration Error: NEXT_PUBLIC_BACKEND_API_URL is not set.");
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [eventsResponse, venuesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/events`),
          fetch(`${API_BASE_URL}/api/venues`)
        ]);

        if (!eventsResponse.ok) throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
        if (!venuesResponse.ok) throw new Error(`Failed to fetch venues: ${venuesResponse.statusText}`);

        const events: Event[] = await eventsResponse.json();
        const venueData: Country[] = await venuesResponse.json();

        setAllEvents(events);
        setCountries(venueData);
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const sceneLookup = useMemo(() => {
    const lookup = new Map<string, Scene>();
    countries.forEach(country => country.cities.forEach(city => city.scenes.forEach(scene => {
      lookup.set(scene.name.toLowerCase(), scene);
      scene.aliases?.forEach(alias => lookup.set(alias.toLowerCase(), scene));
    })));
    return lookup;
  }, [countries]);

  const venuesForMap = useMemo<VenueOnMap[]>(() => {
    const venuesMap = new Map<string, VenueOnMap>();
    allEvents.forEach(event => {
      const venueNameKey = event.venue.toLowerCase();
      const scene = sceneLookup.get(venueNameKey);
      
      if (scene && scene.coords[0] !== 0 && scene.coords[1] !== 0) {
        if (!venuesMap.has(scene.name)) {
          venuesMap.set(scene.name, { name: scene.name, coords: scene.coords, events: [] });
        }
        venuesMap.get(scene.name)?.events.push(event);
      }
    });
    return Array.from(venuesMap.values());
  }, [allEvents, sceneLookup]);

  return (
    <Wrapper>
      <Header>
        <PageTitle>Event <span>Map</span></PageTitle>
        <p>Click on a marker to see upcoming events at that venue.</p>
      </Header>
      <main style={{ padding: '0 2rem' }}>
        {isLoading && <LoadingText>Loading event data...</LoadingText>}
        {error && <ErrorText>{error}</ErrorText>}
        {!isLoading && !error && (
            <EventMap 
                venues={venuesForMap} 
                initialViewState={NORWAY_INITIAL_VIEW_STATE}
            />
        )}
      </main>
    </Wrapper>
  );
}