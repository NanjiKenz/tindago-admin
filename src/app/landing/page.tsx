/**
 * TindaGo Landing Page - Pixel Perfect Figma Implementation
 * Matches Figma design: node-id=585:1608
 * Dimensions: 1440px × 1024px
 *
 * Design Features:
 * - Linear gradient background: #ebf4f5 to #b5c6e0
 * - Hero section with exact Figma coordinates
 * - Navigation bar with logo and CTA button
 * - App store download buttons
 * - Decorative basket illustrations
 * - Main showcase image
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div
      className="relative overflow-hidden min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #ebf4f5 30%, #b5c6e0 100%)'
      }}
    >
      {/* Inner container with max-width for content */}
      <div
        className="relative mx-auto"
        style={{
          maxWidth: '1440px',
          minHeight: '1024px'
        }}
      >
      {/* Navigation Bar - Exact Figma positioning: 1440x100px at (0, 0) */}
      <nav
        className="absolute"
        style={{
          left: '0px',
          top: '0px',
          width: '1440px',
          height: '100px',
          zIndex: 20
        }}
      >
        {/* TindaGo Logo - Exact positioning: 500x500px at (-91, -165) relative to nav */}
        <div
          className="absolute"
          style={{
            left: '-91px',
            top: '-165px',
            width: '500px',
            height: '500px'
          }}
        >
          <Image
            src="/images/shared/logos/tindago-logo.png"
            alt="TindaGo Logo"
            width={500}
            height={500}
            className="object-contain"
            priority
          />
        </div>

        {/* Log In Button - Exact positioning: 150x50px at (1250, 27) */}
        <Link
          href="/auth/login"
          className="absolute rounded-[30px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-sm"
          style={{
            left: '1250px',
            top: '27px',
            width: '150px',
            height: '50px',
            backgroundColor: '#0077be',
            padding: '10px',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0066a3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0077be';
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '24.6px',
              color: '#ffffff',
              textAlign: 'center'
            }}
          >
            Log in
          </span>
        </Link>
      </nav>

      {/* Hero Section - Main Content Group: 1777x937px at (0, 43) relative to viewport */}
      <div
        className="absolute"
        style={{
          left: '0px',
          top: '43px',
          width: '1440px',
          height: '937px'
        }}
      >
        {/* Left Decorative Basket - Exact positioning: 268x192px at (0, 342) */}
        <div
          className="absolute"
          style={{
            left: '0px',
            top: '342px',
            width: '268px',
            height: '192px',
            opacity: 0.9,
            zIndex: 1
          }}
        >
          <Image
            src="/images/landing/features/281-36.png"
            alt="Pink shopping basket"
            width={268}
            height={192}
            className="object-contain"
          />
        </div>

        {/* Right Decorative Basket - Exact positioning: 277x245px at (335, 164) */}
        <div
          className="absolute"
          style={{
            left: '335px',
            top: '164px',
            width: '277px',
            height: '245px',
            opacity: 0.9,
            zIndex: 1
          }}
        >
          <Image
            src="/images/landing/features/281-37.png"
            alt="Shopping bag illustration"
            width={277}
            height={245}
            className="object-contain"
          />
        </div>

        {/* Main Hero Heading - Moved right: 649x186px at (80, 277) */}
        <div
          className="absolute"
          style={{
            left: '80px',
            top: '277px',
            width: '649px',
            height: '186px',
            zIndex: 10
          }}
        >
          <h1
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 600,
              fontSize: '64px',
              lineHeight: '78.72px',
              color: '#000000',
              textAlign: 'left',
              margin: 0
            }}
          >
            Bili kahit saan<br />
            kuha kahit kailan!
          </h1>
        </div>

        {/* Subheading Text - Moved right: 422x50px at (80, 473) */}
        <div
          className="absolute"
          style={{
            left: '80px',
            top: '473px',
            width: '422px',
            height: '50px',
            zIndex: 10
          }}
        >
          <p
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '24.6px',
              color: '#1e1e1e',
              textAlign: 'left',
              margin: 0
            }}
          >
            Delve into your neighborhood&apos;s shopping needs<br />
            with comprehensive insights in one app
          </p>
        </div>

        {/* Main Hero Image - Exact from Figma node 702:203: 1250x937px at (441, 0) */}
        <div
          className="absolute"
          style={{
            left: '441px',
            top: '0px',
            width: '1250px',
            height: '937px',
            zIndex: 5
          }}
        >
          <Image
            src="/images/landing/features/702-203.png"
            alt="TindaGo app showcase - 341shots_so phone mockup"
            width={1250}
            height={937}
            className="object-contain"
            priority
          />
        </div>

        {/* App Store Buttons Container - Moved right to (80, 563) */}
        <div
          className="absolute"
          style={{
            left: '80px',
            top: '563px',
            zIndex: 10
          }}
        >
          {/* Apple App Store Button - 170x50px */}
          <div
            className="absolute rounded-[20px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-sm border-2 border-black bg-white"
            style={{
              left: '0px',
              top: '0px',
              width: '170px',
              height: '50px',
              padding: '8px 12px'
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-shrink-0">
                <Image
                  src="/images/landing/features/281-43.png"
                  alt="Apple icon"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 500,
                    fontSize: '10px',
                    lineHeight: '12.3px',
                    color: '#000000'
                  }}
                >
                  Download on the
                </div>
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#000000'
                  }}
                >
                  App Store
                </div>
              </div>
            </div>
          </div>

          {/* Google Play Button - 170x50px at (190, 0) */}
          <div
            className="absolute rounded-[20px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-sm border-2 border-black bg-white"
            style={{
              left: '190px',
              top: '0px',
              width: '170px',
              height: '50px',
              padding: '8px 12px'
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-shrink-0">
                <Image
                  src="/images/landing/features/281-51.png"
                  alt="Google Play icon"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 500,
                    fontSize: '10px',
                    lineHeight: '12.3px',
                    color: '#000000'
                  }}
                >
                  GET IT ON
                </div>
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#000000'
                  }}
                >
                  Google Play
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Mobile View - Hidden on desktop, shown on mobile */}
      <div className="lg:hidden flex flex-col items-center justify-center px-6 py-12 min-h-screen">
        {/* Mobile Logo */}
        <div className="mb-8 w-64 h-64">
          <Image
            src="/images/shared/logos/tindago-logo.png"
            alt="TindaGo Logo"
            width={256}
            height={256}
            className="object-contain"
          />
        </div>

        {/* Mobile Heading */}
        <h1
          className="mb-6 text-center"
          style={{
            fontFamily: 'Clash Grotesk Variable, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(32px, 8vw, 48px)',
            lineHeight: '1.2',
            color: '#000000'
          }}
        >
          Bili kahit saan<br />
          kuha kahit kailan!
        </h1>

        {/* Mobile Subheading */}
        <p
          className="mb-8 text-center max-w-md"
          style={{
            fontFamily: 'Clash Grotesk Variable, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '1.5',
            color: '#1e1e1e'
          }}
        >
          Delve into your neighborhood&apos;s shopping needs with comprehensive insights in one app
        </p>

        {/* Mobile App Store Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <div className="rounded-[20px] flex items-center justify-center border-2 border-black bg-white p-3">
            <div className="flex items-center gap-3">
              <Image
                src="/images/landing/features/281-43.png"
                alt="Apple icon"
                width={24}
                height={24}
                className="object-contain"
              />
              <div className="flex flex-col">
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 500,
                    fontSize: '9px',
                    color: '#000000'
                  }}
                >
                  Download on the
                </span>
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#000000'
                  }}
                >
                  App Store
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] flex items-center justify-center border-2 border-black bg-white p-3">
            <div className="flex items-center gap-3">
              <Image
                src="/images/landing/features/281-51.png"
                alt="Google Play icon"
                width={24}
                height={24}
                className="object-contain"
              />
              <div className="flex flex-col">
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 500,
                    fontSize: '9px',
                    color: '#000000'
                  }}
                >
                  GET IT ON
                </span>
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#000000'
                  }}
                >
                  Google Play
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Login Button */}
        <Link
          href="/auth/login"
          className="mt-8 rounded-[30px] flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-sm"
          style={{
            width: '200px',
            height: '50px',
            backgroundColor: '#0077be',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0066a3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0077be';
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '18px',
              color: '#ffffff'
            }}
          >
            Log in
          </span>
        </Link>
      </div>
      {/* Close inner container */}
      </div>
    {/* Close outer gradient container */}
    </div>
  );
}
