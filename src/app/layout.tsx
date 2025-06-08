import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import StyledComponentsRegistry from "@/lib/registry"; // <-- 1. Import the new registry

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Icon - Your Guide to Oslo",
  description: "Discover every concert, festival, and market happening in Oslo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StyledComponentsRegistry> {/* <-- 2. Wrap everything inside the body */}
          <Navbar />
          <main>{children}</main>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}