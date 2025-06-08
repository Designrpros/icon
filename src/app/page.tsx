'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

// --- STYLED COMPONENTS (No changes needed) ---
const Wrapper = styled.div`
  min-height: 100vh;
  background-color: #1A1A3D; /* Deep indigo background */
  background-image: radial-gradient(ellipse at 50% -50%, rgba(255, 140, 66, 0.15), transparent 70%);
  background-repeat: no-repeat;
`;

const HeroSection = styled.section`
  padding: 10rem 2rem 4rem 2rem; /* Adjusted padding from when Navbar was added */
  text-align: left;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #FFFFFF;
  display: block;
  @media (max-width: 1024px) {
    font-size: 3rem;
  }
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const TypewriterText = styled.span`
  display: inline-block;
  border-right: 3px solid #FF8C42; /* Orange accent cursor */
  @media (max-width: 768px) {
    border-right: 2px solid #FF8C42;
  }
  @media (max-width: 480px) {
    border-right: 1px solid #FF8C42;
  }
`;

const HighlightedText = styled.span`
  background-color: #FF8C42; /* Orange accent highlight */
  color: #1A1A3D;
  font-weight: 600;
  padding: 0 0.25rem;
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  color: #A9A7C7; /* Muted lavender for secondary text */
  max-width: 600px;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled.button`
  background-color: #FF8C42; /* Orange accent button */
  color: #1A1A3D; /* Dark text on button */
  font-weight: 700;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, background-color 0.2s;
  &:hover {
    transform: scale(1.05);
    background-color: #ffb17a;
  }
  @media (max-width: 768px) {
    padding: 0.5rem 1.5rem;
    font-size: 0.875rem;
  }
`;

const InfoSection = styled.section`
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  border-top: 1px solid #4F4C7A;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 1rem;
  span {
    color: #FF8C42;
  }
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionText = styled.p`
  font-size: 1.125rem;
  color: #A9A7C7;
  max-width: 800px;
  margin: 0 auto 3rem auto;
  line-height: 1.6;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HowItWorksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const StepCard = styled.div`
  background-color: #2C2A4A;
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: left;
`;

const StepNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #FF8C42;
  margin-bottom: 1rem;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: #A9A7C7;
  line-height: 1.5;
`;

const Footer = styled.footer`
  color: #A9A7C7;
  text-align: center;
  padding: 2rem;
  margin-top: 2rem;
  border-top: 1px solid #4F4C7A;
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// --- HOME PAGE COMPONENT (with updated text) ---
export default function Home() {
  const fullTitle = 'ICON: YOUR GUIDE TO LIVE EVENTS'; // <-- Updated Title
  const [displayedText, setDisplayedText] = useState('');
  // const [isTyping, setIsTyping] = useState(true); // Removed as it's not used

  useEffect(() => {
    let index = 0;
    const typingSpeed = 100;

    const type = () => {
      if (index < fullTitle.length) {
        setDisplayedText(fullTitle.substring(0, index + 1));
        index++;
        setTimeout(type, typingSpeed);
      } else {
        // setIsTyping(false); // Removed as isTyping is no longer needed
      }
    };

    type();

    return () => {
      setDisplayedText('');
      // setIsTyping(true); // Removed as isTyping is no longer needed
    };
  }, []);

  return (
    <Wrapper>
      {/* Hero Section */}
      <HeroSection>
        <HeroTitle className="font-heading">
          <TypewriterText className="typewriter">
            {displayedText}
          </TypewriterText>
        </HeroTitle>
        <HeroSubtitle className="font-sans">
          Tired of missing out? We scan every venue, promoter, and festival so you don&apos;t have to. 
          {' '}
          <HighlightedText>All events. One guide. Zero noise.</HighlightedText>
        </HeroSubtitle>
        <Link href="/events">
          <CTAButton>Find Events Now</CTAButton>
        </Link>
      </HeroSection>

      {/* Info Section */}
      <InfoSection id="about">
        <SectionTitle>Your City, <span>Curated.</span></SectionTitle>
        <SectionText>
          Icon is a smart event aggregator for cities across Norway and beyond. We automatically collect and organize thousands of event listings from hundreds of sources—from major arenas to local pubs—and present them in one clean, simple, and searchable feed. Stop hunting, start discovering.
        </SectionText>

        <SectionTitle>How It <span>Works.</span></SectionTitle>
        <HowItWorksGrid>
          <StepCard>
            <StepNumber>01</StepNumber>
            <StepTitle>We Scan</StepTitle>
            <StepDescription>
              Our automated scrapers work around the clock, visiting hundreds of websites, social media pages, and ticketing platforms to find every event happening in your city.
            </StepDescription>
          </StepCard>
          <StepCard>
            <StepNumber>02</StepNumber>
            <StepTitle>We Organize</StepTitle>
            <StepDescription>
              Our system cleans, categorizes, and removes duplicate listings. We enrich the data, so you get clear, consistent information every time.
            </StepDescription>
          </StepCard>
          <StepCard>
            <StepNumber>03</StepNumber>
            <StepTitle>You Discover</StepTitle>
            <StepDescription>
              You get one beautiful, fast, and complete guide to everything happening. Search by date, category, or venue and find your next great experience in seconds.
            </StepDescription>
          </StepCard>
        </HowItWorksGrid>
      </InfoSection>

      {/* Footer */}
      <Footer>
        <p className="font-sans">
          © {new Date().getFullYear()} Icon. All rights reserved.
        </p>
        <p className="font-sans">
          Your guide to what&apos;s happening in Oslo and beyond.
        </p>
      </Footer>
    </Wrapper>
  );
}