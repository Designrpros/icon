'use client';

import { useState } from 'react';
import ReactMapGL, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapboxEvent } from 'mapbox-gl';
import type { Event } from '@/lib/types';
import styled from 'styled-components';

export interface VenueOnMap {
  name: string;
  coords: [number, number];
  events: Event[];
}

// --- 1. UPDATE THE PROPS INTERFACE ---
// Add `initialViewState` here so the component knows to expect it.
interface MapProps {
  venues: VenueOnMap[];
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

const MarkerPin = styled.div`
  width: 32px;
  height: 32px;
  background-image: url('https://img.icons8.com/plasticine/100/marker.png');
  background-size: contain;
  cursor: pointer;
`;

const PopupCard = styled.div`
  color: #1A1A3D;
  h3 { margin: 0 0 0.5rem 0; color: #FF8C42; }
  p { margin: 0 0 0.5rem 0; font-size: 0.9rem; }
  ul { list-style: none; padding: 0; margin: 0; }
  li a { color: #1A1A3D; text-decoration: none; font-weight: 600; font-size: 0.85rem; &:hover { text-decoration: underline; } }
`;

// --- 2. UPDATE THE COMPONENT SIGNATURE ---
// Add `initialViewState` to the list of props being received.
export function EventMap({ venues, initialViewState }: MapProps) {
  const [popupInfo, setPopupInfo] = useState<VenueOnMap | null>(null);

  return (
    <ReactMapGL
      reuseMaps
      
      // --- 3. USE THE PROP ---
      // This now uses the prop passed down from MapPage, instead of being hardcoded to Oslo.
      initialViewState={initialViewState}
      
      style={{ width: '100%', height: '70vh', borderRadius: '0.5rem' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />

      {venues.map((venue) => (
        <Marker
          key={venue.name}
          longitude={venue.coords[0]}
          latitude={venue.coords[1]}
          anchor="bottom"
          onClick={(e: MapboxEvent<MouseEvent>) => {
            e.originalEvent?.stopPropagation();
            setPopupInfo(venue);
          }}
        >
          <MarkerPin />
        </Marker>
      ))}

      {popupInfo && (
        <Popup
          anchor="top"
          longitude={Number(popupInfo.coords[0])}
          latitude={Number(popupInfo.coords[1])}
          onClose={() => setPopupInfo(null)}
          closeOnClick={false}
        >
          <PopupCard>
            <h3>{popupInfo.name}</h3>
            <p>{popupInfo.events.length} upcoming event(s):</p>
            <ul>
              {popupInfo.events.slice(0, 5).map(event => (
                <li key={event.id}>
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    {event.title}
                  </a>
                </li>
              ))}
            </ul>
          </PopupCard>
        </Popup>
      )}
    </ReactMapGL>
  );
}