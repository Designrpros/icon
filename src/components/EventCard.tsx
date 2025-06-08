'use client';

import styled, { css } from 'styled-components';
import Link from 'next/link';
import type { Event } from '@/lib/types';

// --- STYLED COMPONENTS for the Card ---
// We move all card-related styles into this file.
const CardWrapper = styled.div`
  background-color: #2C2A4A;
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  }
`;

const CardImageHeader = styled.div<{ $imageUrl?: string }>`
  position: relative;
  height: 180px;
  background-image: url(${(props) => props.$imageUrl || 'https://placehold.co/600x400/2C2A4A/FF8C42?text=ICON'});
  background-size: cover;
  background-position: center;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(44, 42, 74, 1) 0%, rgba(44, 42, 74, 0) 50%);
  }
`;

const TicketStatusBadge = styled.div<{ $status?: Event['ticketStatus'] }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  z-index: 2;

  ${({ $status }) => {
    switch ($status) {
      case 'Sold Out': case 'Cancelled': return css` background-color: #D32F2F; color: white; `;
      case 'Few Tickets': return css` background-color: #FF8C42; color: #1A1A3D; `;
      case 'Available': return css` background-color: #4CAF50; color: white; `;
      default: return css` background-color: #4F4C7A; color: #A9A7C7; `;
    }
  }}
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const CardMeta = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 600;
    color: #A9A7C7;
    margin-bottom: 1rem;
`;

const CardVenue = styled.span``;
const CardDate = styled.span``;

const CardLink = styled(Link)`
  color: #FF8C42;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
  align-self: flex-start;
  margin-top: auto;
  padding-top: 1rem;

  &:hover {
    color: #ffb17a;
    text-decoration: underline;
  }
`;


// --- The Reusable Component ---
interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <CardWrapper>
      <CardImageHeader $imageUrl={event.imageUrl}>
        <TicketStatusBadge $status={event.ticketStatus}>
          {event.ticketStatus}
        </TicketStatusBadge>
      </CardImageHeader>
      <CardContent>
        <CardMeta>
          <CardVenue>{event.venue}</CardVenue>
          <CardDate>{event.date}</CardDate>
        </CardMeta>
        <CardTitle>{event.title}</CardTitle>
        <CardLink href={event.url} target="_blank" rel="noopener noreferrer">
          Learn More &rarr;
        </CardLink>
      </CardContent>
    </CardWrapper>
  );
}