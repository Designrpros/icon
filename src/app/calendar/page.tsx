'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import type { Event } from '@/lib/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import EventCard from '@/components/EventCard';

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

const CalendarWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto 2rem auto;
  padding: 1.5rem;
  background-color: #2C2A4A;
  border-radius: 0.5rem;
  border: 1px solid #4F4C7A;

  /* Custom styles to theme the calendar */
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

  /* --- NEWLY ADDED STYLE FOR NAVIGATION BUTTONS --- */
  .react-calendar__navigation button:disabled {
    background: none;
    color: #4F4C7A; /* Use the same muted color */
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

// --- DATE PARSING HELPER (unchanged) ---
const norwegianMonths: { [key: string]: number } = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mai': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11 };
function parseCustomDate(dateString: string | null): Date | null {
    if (!dateString) return null;
    const parts = dateString.toLowerCase().split(' ');
    if (parts.length < 3) return null;
    const day = parseInt(parts[1], 10);
    const monthIndex = norwegianMonths[parts[2].replace('.', '')];
    if (isNaN(day) || monthIndex === undefined) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    let eventYear = today.getFullYear();
    const preliminaryEventDate = new Date(eventYear, monthIndex, day);
    if (preliminaryEventDate < today) {
        eventYear++;
    }
    return new Date(eventYear, monthIndex, day);
}

// --- CALENDAR PAGE COMPONENT ---
export default function CalendarPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ===============================================================
  // === THIS IS THE ONLY LINE THAT CHANGES ===
  // We now initialize the selected date to today, instead of null.
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  // ===============================================================

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
    // ... streaming logic is unchanged ...
    const fetchStreamingEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/scrape');
        if (!response.body) throw new Error("Response body is null");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '));
          for (const line of lines) {
            const jsonString = line.replace('data: ', '');
            try {
              const newEvents: Event[] = JSON.parse(jsonString);
              setAllEvents(prevEvents => [...prevEvents, ...newEvents]);
            } catch (e) { console.error("Failed to parse JSON chunk:", jsonString, e); }
          }
        }
      } catch (error) {
        console.error("Failed to fetch streaming events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStreamingEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    // This logic now defaults to filtering by today's date because of the initial state.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allEvents
      .map(event => ({ ...event, parsedDate: parseCustomDate(event.date) }))
      .filter(event => {
        if (!event.parsedDate) return false;
        
        // If selectedDate is null (user clicked "Show All"), show all future events.
        if (!selectedDate) return event.parsedDate >= today;

        // Otherwise, show events for the specific selected date.
        return event.parsedDate.toDateString() === selectedDate.toDateString();
      })
      .sort((a, b) => {
        if (!a.parsedDate || !b.parsedDate) return 0;
        return a.parsedDate.getTime() - b.parsedDate.getTime();
      });
  }, [allEvents, selectedDate]);
  
  const handleDateChange = (date: Date) => {
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null); // Clicking the same date again clears the filter
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

      {/* This button is now visible on page load */}
      {selectedDate && (
        <FilterControls>
          <ClearButton onClick={() => setSelectedDate(null)}>Show All Upcoming Events</ClearButton>
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
            ? `No events found for ${selectedDate.toLocaleDateString('en-GB')}.`
            : 'No upcoming events found.'
          }
        </LoadingText>
      )}
    </Wrapper>
  );
}