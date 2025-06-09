'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import type { Event } from '@/lib/types';
import type { VenueOnMap } from '@/components/Map';
// Correct import path for venues.ts, assuming it's in lib/scenes/venues.ts
import { findSceneByName } from '@/lib/scenes/venues'; 

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

const EventMap = dynamic(() => import('@/components/Map').then((mod) => mod.EventMap), {
  loading: () => <LoadingText>Loading map...</LoadingText>,
  ssr: false
});

export default function MapPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- UPDATED useEffect for simple JSON fetch ---
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/scrape');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events: Event[] = await response.json();
        setAllEvents(events);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []); // Empty dependency array means this runs once on mount

  const venuesForMap = useMemo<VenueOnMap[]>(() => {
    const venuesMap: Map<string, VenueOnMap> = new Map();
    allEvents.forEach(event => {
      const scene = findSceneByName(event.venue);
      if (scene) {
        if (!venuesMap.has(scene.name)) {
          venuesMap.set(scene.name, { name: scene.name, coords: scene.coords, events: [] });
        }
        venuesMap.get(scene.name)?.events.push(event);
      }
    });
    return Array.from(venuesMap.values());
  }, [allEvents]);

  return (
    <Wrapper>
      <Header>
        <PageTitle>Event <span>Map</span></PageTitle>
        <p>Click on a marker to see upcoming events at that venue.</p>
      </Header>
      <main style={{ padding: '0 2rem' }}>
        {isLoading && venuesForMap.length === 0 
          ? <LoadingText>Loading event data...</LoadingText>
          : <EventMap venues={venuesForMap} />
        }
      </main>
    </Wrapper>
  );
}