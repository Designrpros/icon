'use client'; // This is a Client Component because it uses hooks for interaction

import { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import Link from 'next/link';

// Define the props for the styled component to accept the scrolled state
interface NavbarWrapperProps {
  $scrolled: boolean;
}

// All styled-components for the Navbar are self-contained here
const NavbarWrapper = styled.nav<NavbarWrapperProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  transition: background-color 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out, border-bottom 0.3s ease-in-out;

  /* Apply styles when scrolled */
  ${(props) =>
    props.$scrolled &&
    css`
      background-color: rgba(26, 26, 61, 0.7); /* Semi-transparent indigo */
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #4F4C7A;
    `}
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.75rem;
  font-weight: 800;
  color: #FFFFFF;
  text-decoration: none;
  span {
    color: #FF8C42;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #A9A7C7;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  &:hover {
    color: #FFFFFF;
  }
`;

const NavbarButton = styled(Link)`
  background-color: #FF8C42;
  color: #1A1A3D;
  font-weight: 700;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  text-decoration: none;
  transition: transform 0.2s ease-in-out, background-color 0.2s;
  &:hover {
    transform: scale(1.05);
    background-color: #ffb17a;
  }
`;

// The Navbar component itself
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <NavbarWrapper $scrolled={scrolled}>
      <Logo href="/">I<span>C</span>ON</Logo>
      <NavLinks>
        <NavLink href="/calendar">Calendar</NavLink>
        <NavLink href="/map">Map</NavLink>
        <NavbarButton href="/events">Find Events</NavbarButton>
      </NavLinks>
    </NavbarWrapper>
  );
}