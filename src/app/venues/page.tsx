'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import type { Country } from '@/lib/types';
import { slugify } from '@/lib/utils';

// --- STYLED COMPONENTS ---
const Wrapper = styled.div`
  min-height: 100vh;
  padding: 8rem 2rem 4rem 2rem;
  background-color: #1A1A3D;
  background-image: radial-gradient(ellipse at 50% -20%, rgba(255, 140, 66, 0.1), transparent 70%);
  color: #FFFFFF;
`;
const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  margin-bottom: 3rem;
`;
const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  span { color: #FF8C42; }
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
const CountrySection = styled.section`
  margin-bottom: 3rem;
`;
const CitySection = styled.div`
  margin-bottom: 2rem;
`;
const CityTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #FF8C42;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #4F4C7A;
`;
const VenuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;
const VenueCard = styled(Link)`
  background-color: #2C2A4A;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #4F4C7A;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease-in-out, border-color 0.2s ease-in-out;
  &:hover {
    transform: translateY(-2px);
    border-color: #FF8C42;
  }
`;
const VenueName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: #FFFFFF;
`;
const VenueInfo = styled.p`
  margin: 0;
  color: #A9A7C7;
  font-size: 0.9rem;
`;

// --- VENUES PAGE COMPONENT ---
export default function VenuesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch directly from the relative path. Next.js will proxy this request.
        const response = await fetch('/api/venues');
        if (!response.ok) throw new Error(`Failed to fetch venues: ${response.statusText}`);
        
        const data: Country[] = await response.json();
        setCountries(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <Wrapper>
      <Header>
        <PageTitle>All Known <span>Venues</span></PageTitle>
      </Header>
      <main>
        {isLoading && <LoadingText>Loading venues...</LoadingText>}
        {error && <ErrorText>Error: {error}</ErrorText>}
        {!isLoading && !error && countries.map(country => (
          <CountrySection key={country.name}>
            {country.cities.map(city => (
              <CitySection key={city.name}>
                <CityTitle>{city.name}</CityTitle>
                <VenuesGrid>
                  {city.scenes.map(scene => (
                    <VenueCard key={scene.name} href={`/venues/${slugify(scene.name)}`}>
                      <VenueName>{scene.name}</VenueName>
                      <VenueInfo>{scene.address}</VenueInfo>
                    </VenueCard>
                  ))}
                </VenuesGrid>
              </CitySection>
            ))}
          </CountrySection>
        ))}
      </main>
    </Wrapper>
  );
}