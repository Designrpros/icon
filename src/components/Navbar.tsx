'use client';

import { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import Link from 'next/link';

// --- PROPS INTERFACES ---
interface NavbarWrapperProps {
  $scrolled: boolean;
}

interface MobileMenuProps {
  $isOpen: boolean;
}

// --- STYLED COMPONENTS ---
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

  ${(props) =>
    props.$scrolled &&
    css`
      background-color: rgba(26, 26, 61, 0.7);
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
  z-index: 1001; /* Ensure logo is above the overlay */
  span {
    color: #FF8C42;
  }
`;

// --- MODIFIED: Hide desktop links on mobile ---
const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
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

// --- NEW: Burger menu icon ---
const BurgerWrapper = styled.button<MobileMenuProps>`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;

  @media (max-width: 768px) {
    display: flex;
  }

  div {
    width: 2rem;
    height: 0.25rem;
    background: #FFFFFF;
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;

    :first-child {
      transform: ${({ $isOpen }) => $isOpen ? 'rotate(45deg)' : 'rotate(0)'};
    }

    :nth-child(2) {
      opacity: ${({ $isOpen }) => $isOpen ? '0' : '1'};
      transform: ${({ $isOpen }) => $isOpen ? 'translateX(20px)' : 'translateX(0)'};
    }

    :nth-child(3) {
      transform: ${({ $isOpen }) => $isOpen ? 'rotate(-45deg)' : 'rotate(0)'};
    }
  }
`;

// --- NEW: Fullscreen mobile menu overlay ---
const MobileMenuOverlay = styled.div<MobileMenuProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  background: rgba(26, 26, 61, 0.98);
  backdrop-filter: blur(15px);
  height: 100vh;
  width: 100%;
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  transition: transform 0.3s ease-in-out;
  transform: ${({ $isOpen }) => $isOpen ? 'translateX(0)' : 'translateX(100%)'};
  z-index: 1000;

  /* Style links inside the mobile menu differently */
  ${NavLink} {
    font-size: 2rem;
    color: #FFFFFF;
  }
  ${NavbarButton} {
    font-size: 1.5rem;
  }
`;


// --- The Updated Navbar Component ---
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // State to manage mobile menu visibility
  const [isOpen, setIsOpen] = useState(false);

  // Effect to detect scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <NavbarWrapper $scrolled={scrolled}>
      <Logo href="/" onClick={closeMenu}>I<span>C</span>ON</Logo>

      {/* Desktop Links */}
      <NavLinks>
        <NavLink href="/calendar">Calendar</NavLink>
        <NavLink href="/map">Map</NavLink>
        <NavLink href="/events">Events</NavLink>
        <NavbarButton href="/venues">Venues</NavbarButton>
      </NavLinks>

      {/* Burger Icon (only visible on mobile) */}
      <BurgerWrapper $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <div />
        <div />
        <div />
      </BurgerWrapper>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay $isOpen={isOpen}>
        <NavLink href="/calendar" onClick={closeMenu}>Calendar</NavLink>
        <NavLink href="/map" onClick={closeMenu}>Map</NavLink>
        <NavLink href="/events" onClick={closeMenu}>Events</NavLink>
        <NavLink href="/venues" onClick={closeMenu}>Venues</NavLink>
      </MobileMenuOverlay>
    </NavbarWrapper>
  );
}