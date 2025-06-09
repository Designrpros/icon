// src/components/EventCard.tsx

'use client';

import type { Event } from '@/lib/types';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';

// This interface expects to receive the pre-parsed Date object from the parent page.
interface EventWithParsedDate extends Event {
  parsedDate: Date | null;
}

const Card = styled.a`
  background-color: #2C2A4A;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid #4F4C7A;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

// --- MODIFIED ImageWrapper ---
// Now uses a background-image with a placeholder fallback
const ImageWrapper = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 180px;
  background-color: #1A1A3D;
  background-image: url(${props => props.$imageUrl || 'https://placehold.co/600x400/2C2A4A/FF8C42?text=ICON'});
  background-size: cover;
  background-position: center;
`;

const Content = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  flex-grow: 1;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #A9A7C7;
  font-size: 0.9rem;

  svg {
    margin-right: 0.5rem;
    color: #FF8C42;
  }
`;

const StatusBadge = styled.div<{ $status?: Event['ticketStatus'] }>`
  margin-top: auto;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  text-align: center;
  align-self: flex-start;
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;

  background-color: ${({ $status }) => {
    switch ($status) {
      case 'Available': return '#006400';
      case 'Few Tickets': return '#FF8C42';
      case 'Sold Out': return '#8B0000';
      default: return '#4F4C7A';
    }
  }};
  color: #FFFFFF;
`;

// Helper to format the parsed date into a readable string
const formatDate = (date: Date | null): string => {
  if (!date) return 'Dato ikke fastsatt';
  // Using a shorter, cleaner format
  return date.toLocaleDateString('nb-NO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};


export default function EventCard({ event }: { event: EventWithParsedDate }) {
  const displayDate = formatDate(event.parsedDate);

  return (
    <Card href={event.url} target="_blank" rel="noopener noreferrer">
      {/* The ImageWrapper now handles the placeholder automatically */}
      <ImageWrapper $imageUrl={event.imageUrl} role="img" aria-label={event.title} />
      
      <Content>
        <Title>{event.title}</Title>
        <InfoRow>
          <FaCalendarAlt />
          <span>{displayDate}</span>
        </InfoRow>
        <InfoRow>
          <FaMapMarkerAlt />
          <span>{event.venue}, {event.city}</span>
        </InfoRow>
        <StatusBadge $status={event.ticketStatus}>
          <FaTicketAlt style={{ marginRight: '0.5rem' }}/>
          {event.ticketStatus || 'Info'}
        </StatusBadge>
      </Content>
    </Card>
  );
}