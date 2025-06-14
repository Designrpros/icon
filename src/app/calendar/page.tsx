'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import type { Event } from '@/lib/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import EventCard from '@/components/EventCard';

// --- STYLED COMPONENTS (No changes) ---
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

const CalendarWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto 2rem auto;
  padding: 1.5rem;
  background-color: #2C2A4A;
  border-radius: 0.5rem;
  border: 1px solid #4F4C7A;

  .react-calendar {
    width: 100%;
    border: none;
    background: transparent;
    font-family: var(--font-geist-sans);
  }
  .react-calendar__navigation button {
    color: #FF8C42;
    font-size: 1.2rem;
    font-weight: 700;
    border-radius: 0.25rem;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #4F4C7A;
  }
  .react-calendar__month-view__weekdays__weekday {
    color: #A9A7C7;
    text-align: center;
    abbr { text-decoration: none; }
  }
  .react-calendar__tile {
    color: #FFFFFF;
    border-radius: 0.25rem;
    position: relative;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #4F4C7A;
  }
  .react-calendar__tile--now {
    background: rgba(255, 140, 66, 0.2);
    color: #FF8C42;
    font-weight: 700;
  }
  .react-calendar__tile--active {
    background: #FF8C42 !important;
    color: #1A1A3D;
  }
  .event-dot {
      height: 6px;
      width: 6px;
      background-color: #FF8C42;
      border-radius: 50%;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 8px;
  }
  .react-calendar__tile:disabled {
    background: none;
    color: #4F4C7A;
  }
  .react-calendar__navigation button:disabled {
    background: none;
    color: #4F4C7A;
  }
`;

const FilterControls = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ClearButton = styled.button`
  background-color: #FF8C42;
  color: #1A1A3D;
  font-weight: 700;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, background-color 0.2s;
  &:hover {
    transform: scale(1.05);
    background-color: #ffb17a;
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

// --- The multi-format date parser ---
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
        if (preliminaryEventDate < today) {
            eventYear++;
        }
        return new Date(eventYear, monthIndex, day);
    }
    
    return null;
}

// --- CALENDAR PAGE COMPONENT ---
export default function CalendarPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    allEvents.forEach(event => {
      const parsed = parseCustomDate(event.date);
      if (parsed) {
        dates.add(parsed.toDateString());
      }
    });
    return dates;
  }, [allEvents]);

  useEffect(() => {
    // --- FIX: Fetch from the correct /api/events endpoint ---
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/events');
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
  }, []);

  const filteredEvents = useMemo(() => {
    return allEvents
      .map(event => ({ ...event, parsedDate: parseCustomDate(event.date) }))
      .filter(event => {
        if (!event.parsedDate) return false;
        if (!selectedDate) return false; 
        return event.parsedDate.toDateString() === selectedDate.toDateString();
      })
      .sort((a, b) => {
        if (!a.parsedDate || !b.parsedDate) return 0;
        return a.parsedDate.getTime() - b.parsedDate.getTime();
      });
  }, [allEvents, selectedDate]);
  
  const handleDateChange = (date: Date) => {
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  }

  return (
    <Wrapper>
      <Header>
        <PageTitle>Event <span>Calendar</span></PageTitle>
      </Header>
      
      <CalendarWrapper>
        <Calendar
          onClickDay={handleDateChange}
          value={selectedDate}
          tileContent={({ date, view }) => 
            view === 'month' && eventDates.has(date.toDateString()) 
            ? <div className="event-dot" /> 
            : null
          }
          minDate={new Date()}
        />
      </CalendarWrapper>

      {selectedDate && (
        <FilterControls>
          <ClearButton onClick={() => setSelectedDate(null)}>Clear Selection</ClearButton>
        </FilterControls>
      )}

      {isLoading && filteredEvents.length === 0 && <LoadingText>Loading Events...</LoadingText>}

      <EventsGrid>
        {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
        ))}
      </EventsGrid>
      
      {!isLoading && filteredEvents.length === 0 && (
        <LoadingText>
          {selectedDate 
            ? `No events found for ${selectedDate.toLocaleDateString('nb-NO')}.`
            : 'Select a date to see events.'
          }
        </LoadingText>
      )}
    </Wrapper>
  );
}
