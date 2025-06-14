'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import type { Event } from '@/lib/types'; // This import will now correctly use 'image_url'
import EventCard from '@/components/EventCard'; // This component needs to use 'event.image_url'

// --- STYLED COMPONENTS (No changes) ---
const Wrapper = styled.div`
  min-height: 100vh;
  background-color: #1A1A3D;
  background-image: radial-gradient(ellipse at 50% -20%, rgba(255, 140, 66, 0.1), transparent 70%);
  background-repeat: no-repeat;
  color: #FFFFFF;
`;

const EventsHeader = styled.header`
  padding: 4rem 2rem 2rem 2rem;
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

const SearchInput = styled.input`
  width: 100%;
  max-width: 700px;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 2px solid #4F4C7A;
  background-color: #2C2A4A;
  color: #FFFFFF;
  font-size: 1rem;
  margin-bottom: 2rem;
  transition: border-color 0.2s;
  &::placeholder { color: #A9A7C7; }
  &:focus { outline: none; border-color: #FF8C42; }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

interface FilterButtonProps {
  $isActive: boolean;
}

const FilterButton = styled.button<FilterButtonProps>`
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid #4F4C7A;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  background-color: ${(props) => (props.$isActive ? '#FF8C42' : 'transparent')};
  color: ${(props) => (props.$isActive ? '#1A1A3D' : '#A9A7C7')};
  
  &:hover {
    color: #FFFFFF;
    border-color: #FF8C42;
  }
`;

const EventsGrid = styled.main`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 0 2rem 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #A9A7C7;
  grid-column: 1 / -1;
  margin-top: 2rem;
`;

// --- DATE PARSING HELPER ---
const norwegianMonths: { [key: string]: number } = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mai': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11,
    'januar': 0, 'februar': 1, 'mars': 2, 'april': 3, 'juni': 5, 'juli': 6, 'august': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
};

function parseCustomDate(dateString: string | null): Date | null {
    if (!dateString) return null;
    const cleanDateString = dateString.toLowerCase().trim();

    // --- FIX: Add handler for YYYY-MM-DD format ---
    const yyyyMmDdParts = cleanDateString.split('-');
    if (yyyyMmDdParts.length === 3 && yyyyMmDdParts[0].length === 4) {
        const year = parseInt(yyyyMmDdParts[0], 10);
        const monthIndex = parseInt(yyyyMmDdParts[1], 10) - 1;
        const day = parseInt(yyyyMmDdParts[2], 10);
        if (!isNaN(day) && !isNaN(monthIndex) && !isNaN(year)) {
            return new Date(year, monthIndex, day);
        }
    }

    const ymdParts = cleanDateString.split('.');
    if (ymdParts.length === 3 && ymdParts[0].length === 2 && ymdParts[1].length === 2 && ymdParts[2].length === 4) {
        const day = parseInt(ymdParts[0], 10);
        const monthIndex = parseInt(ymdParts[1], 10) - 1;
        const year = parseInt(ymdParts[2], 10);
        if (!isNaN(day) && !isNaN(monthIndex) && !isNaN(year)) {
            return new Date(year, monthIndex, day);
        }
    }
    
    const parts = cleanDateString.replace('.', '').split(' ');
    const potentialDay = parseInt(parts[0], 10) || parseInt(parts[1], 10);
    const potentialMonth = parts.find(p => norwegianMonths[p] !== undefined);

    if (!isNaN(potentialDay) && potentialMonth) {
        const day = potentialDay;
        const monthIndex = norwegianMonths[potentialMonth];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let eventYear = today.getFullYear();
        const preliminaryEventDate = new Date(eventYear, monthIndex, day);
        if (preliminaryEventDate < today) { eventYear++; }
        return new Date(eventYear, monthIndex, day);
    }
    
    return null;
}

// --- EVENTS PAGE COMPONENT ---
export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSource, setActiveSource] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Ensure this URL is accessible from your Vercel deployment if deployed
        const response = await fetch('/api/events'); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events: Event[] = await response.json(); // This will parse JSON into Event[]
        setAllEvents(events);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const sources = ['All', ...Array.from(new Set(allEvents.map(event => event.source)))];
  
  const processedEvents = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allEvents
      .map(event => ({
        ...event,
        parsedDate: parseCustomDate(event.date),
      }))
      .filter(event => {
        if (!event.parsedDate) return false;

        const matchesSource = activeSource === 'All' || event.source === activeSource;
        if (!matchesSource) return false;

        if (lowerCaseSearchTerm) {
          const searchableContent = [
            event.title, event.venue, event.date, event.description,
            event.ticket_status, // Use image_url from the backend
            event.source, event.city
          ].filter(Boolean).join(' ').toLowerCase();
          return searchableContent.includes(lowerCaseSearchTerm);
        }
        
        return true;
      })
      .sort((a, b) => {
        if (!a.parsedDate || !b.parsedDate) return 0;
        return a.parsedDate.getTime() - b.parsedDate.getTime();
      });
  }, [allEvents, activeSource, searchTerm]);

  const showLoadingMessage = isLoading && allEvents.length === 0;
  const showNoResultsMessage = !isLoading && processedEvents.length === 0;

  return (
    <Wrapper>
      <EventsHeader>
        <PageTitle>Find Your Next <span>Event</span></PageTitle>
        <SearchInput 
          type="text" 
          placeholder="Search by artist, venue, date, description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {allEvents.length > 0 && (
          <FilterContainer>
            {sources.map(source => (
              <FilterButton 
                key={source}
                $isActive={activeSource === source}
                onClick={() => setActiveSource(source)}
              >
                {source}
              </FilterButton>
            ))}
          </FilterContainer>
        )}
      </EventsHeader>

      <EventsGrid>
        {processedEvents.map((event) => (
          // The 'event' object passed here will now have 'image_url' populated
          // if your EventCard component uses it correctly.
          <EventCard key={event.id} event={event} />
        ))}
      </EventsGrid>

      {showLoadingMessage && <LoadingText>Loading event data...</LoadingText>}
      {showNoResultsMessage && <LoadingText>No events found for your search or filter.</LoadingText>}
    </Wrapper>
  );
}