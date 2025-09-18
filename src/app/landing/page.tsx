/**
 * TindaGo Landing Page - Pixel Perfect Figma Implementation
 * Matches Figma design: node-id=281:2 (Admin frame)
 * Dimensions: 1440px × 2631px
 */

'use client';

import React from 'react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: '100vw',
        maxWidth: '1440px',
        minHeight: '2631px',
        backgroundColor: '#f3f5f9',
        margin: '0 auto'
      }}
    >
      {/* Navigation Bar - Exact Figma positioning */}
      <div
        className="absolute"
        style={{
          left: '0px',
          top: '0px',
          width: '1440px',
          height: '100px'
        }}
      >
        {/* Logo - Original Figma positioning */}
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
            src="/images/landing/281-30.png"
            alt="TindaGo Logo"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Log in Button - With blue hover */}
        <div
          className="absolute rounded-[30px] flex items-center justify-center cursor-pointer hover:bg-[#0077be] transition-all duration-200 group"
          style={{
            left: '1090px',
            top: '27px',
            width: '150px',
            height: '50px',
            padding: '10px',
            border: '1px solid #e5e7eb'
          }}
        >
          <span
            className="group-hover:text-white transition-colors duration-200"
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '24.6px',
              color: '#1e1e1e',
              textAlign: 'center'
            }}
          >
            Log in
          </span>
        </div>

        {/* Sign up Button - Exact Figma coordinates */}
        <div
          className="absolute rounded-[30px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            left: '1250px',
            top: '27px',
            width: '150px',
            height: '50px',
            backgroundColor: '#0077be',
            padding: '10px',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
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
            Sign up
          </span>
        </div>
      </div>

      {/* Hero Section - Exact coordinates from Figma */}
      <div
        className="absolute"
        style={{
          left: '25px',
          top: '85px',
          width: '1298px',
          height: '649px'
        }}
      >
        {/* Left Side Image - Shopping illustration */}
        <div
          className="absolute"
          style={{
            left: '0px',
            top: '180px',
            width: '531px',
            height: '469px'
          }}
        >
          <Image
            src="/images/landing/281-36.png"
            alt="Shopping illustration"
            width={531}
            height={469}
            className="w-full h-full object-cover rounded-[20px]"
          />
        </div>

        {/* Right Side Image - Basket illustration */}
        <div
          className="absolute"
          style={{
            left: '708px',
            top: '0px',
            width: '590px',
            height: '423px'
          }}
        >
          <Image
            src="/images/landing/281-37.png"
            alt="Basket illustration"
            width={590}
            height={423}
            className="w-full h-full object-cover rounded-[20px]"
          />
        </div>

        {/* Decorative Baskets - Behind hero text */}
        <div
          className="absolute"
          style={{
            left: '250px',
            top: '150px',
            width: '100px',
            height: '100px',
            opacity: 0.1,
            zIndex: 1
          }}
        >
          <Image
            src="/images/landing/281-36.png"
            alt="Decorative basket"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

        <div
          className="absolute"
          style={{
            left: '950px',
            top: '200px',
            width: '120px',
            height: '120px',
            opacity: 0.15,
            zIndex: 1
          }}
        >
          <Image
            src="/images/landing/281-37.png"
            alt="Decorative basket"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Main Hero Text - Exact Figma positioning */}
        <div
          className="absolute"
          style={{
            left: '315px',
            top: '217px',
            width: '760px',
            height: '236px',
            zIndex: 10
          }}
        >
          <h1
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 600,
              fontSize: '96px',
              lineHeight: '118.08px',
              color: '#000000',
              textAlign: 'center',
              margin: 0
            }}
          >
            Bili kahit saan,<br />
            kuha kahit kailan!
          </h1>
        </div>

        {/* Subheading - Exact Figma positioning */}
        <div
          className="absolute"
          style={{
            left: '484px',
            top: '555px',
            width: '422px',
            height: '50px'
          }}
        >
          <p
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '24.6px',
              color: '#1e1e1e',
              textAlign: 'center',
              margin: 0
            }}
          >
            Delve into your neighborhood&apos;s shopping needs<br />
            with comprehensive insights in one app
          </p>
        </div>

        {/* App Store Buttons - Exact Figma positioning */}
        <div className="absolute" style={{ left: '515px', top: '635px' }}>
          {/* Apple Store Button */}
          <div
            className="absolute rounded-[20px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              left: '0px',
              top: '0px',
              width: '170px',
              height: '50px',
              backgroundColor: '#000000',
              padding: '8px 12px'
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-shrink-0">
                <Image
                  src="/images/landing/281-43.png"
                  alt="Apple icon"
                  width={24}
                  height={24}
                  className="object-contain brightness-0 invert"
                />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 400,
                    fontSize: '9px',
                    lineHeight: '11px',
                    color: '#ffffff',
                    marginBottom: '1px'
                  }}
                >
                  Download on the
                </div>
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#ffffff'
                  }}
                >
                  App Store
                </div>
              </div>
            </div>
          </div>

          {/* Google Play Button */}
          <div
            className="absolute rounded-[20px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              left: '190px',
              top: '0px',
              width: '170px',
              height: '50px',
              backgroundColor: '#000000',
              padding: '8px 12px'
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-shrink-0">
                <Image
                  src="/images/landing/281-51.png"
                  alt="Google Play icon"
                  width={24}
                  height={24}
                  className="object-contain brightness-0 invert"
                />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 400,
                    fontSize: '9px',
                    lineHeight: '11px',
                    color: '#ffffff',
                    marginBottom: '1px'
                  }}
                >
                  GET IT ON
                </div>
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#ffffff'
                  }}
                >
                  Google Play
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Second Section - Shopping & delivery made simple */}
      <div
        className="absolute"
        style={{
          left: '0px',
          top: '870px',
          width: '1440px',
          height: '600px',
          backgroundColor: '#f3f5f9'
        }}
      >
        {/* Section Title - Exact Figma positioning */}
        <div
          className="absolute"
          style={{
            left: '40px',
            top: '80px',
            width: '423px',
            height: '118px'
          }}
        >
          <h2
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '48px',
              lineHeight: '59.04px',
              color: '#1e1e1e',
              textAlign: 'left',
              margin: 0
            }}
          >
            Shopping & delivery<br />
            made simple.
          </h2>
        </div>

        {/* Section Description - Aligned */}
        <div
          className="absolute"
          style={{
            left: '40px',
            top: '250px',
            width: '594px',
            height: '75px'
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
            Take control of your daily essentials with a convenient platform that<br />
            lets you browse, order, track, manage, and receive all<br />
            your sari-sari needs in one app, effortlessly.
          </p>
        </div>

        {/* Learn More Button - Aligned below text */}
        <div
          className="absolute rounded-[30px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            left: '40px',
            top: '370px',
            width: '150px',
            height: '50px',
            backgroundColor: '#0077be',
            padding: '10px',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
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
            Learn more
          </span>
        </div>

        {/* Right Side Image - Exact Figma positioning */}
        <div
          className="absolute"
          style={{
            left: '598px',
            top: '-57px',
            width: '955px',
            height: '716px'
          }}
        >
          <Image
            src="/images/landing/281-28.png"
            alt="App preview"
            width={955}
            height={716}
            className="w-full h-full object-cover rounded-[20px]"
          />
        </div>
      </div>

      {/* Third Section - Download our app */}
      <div
        className="absolute"
        style={{
          left: '0px',
          top: '1570px',
          width: '1440px',
          height: '600px'
        }}
      >
        {/* Background Gradient - Exact Figma positioning */}
        <div
          className="absolute rounded-[30px]"
          style={{
            left: '40px',
            top: '50px',
            width: '1360px',
            height: '500px',
            background: 'linear-gradient(to right, #071939 0%, #14469f 100%)',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25), 2px 2px 0px rgba(0, 0, 0, 0.25)'
          }}
        />

        {/* Left Side Illustration - Exact Figma positioning */}
        <div
          className="absolute"
          style={{
            left: '-52px',
            top: '-63px',
            width: '945px',
            height: '613px'
          }}
        >
          <Image
            src="/images/landing/281-5.png"
            alt="Download illustration"
            width={945}
            height={613}
            className="w-full h-full object-cover rounded-[20px]"
          />
        </div>

        {/* Download Text - Exact Figma positioning */}
        <div
          className="absolute"
          style={{
            left: '874px',
            top: '82px',
            width: '403px',
            height: '237px'
          }}
        >
          <h2
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '64px',
              lineHeight: '78.72px',
              color: '#ffffff',
              textAlign: 'left',
              margin: 0
            }}
          >
            Download our<br />
            app and enjoy<br />
            using it
          </h2>
        </div>

        {/* App Store Buttons - Exact Figma positioning */}
        <div className="absolute" style={{ left: '874px', top: '361px' }}>
          {/* Apple Store Button */}
          <div
            className="absolute rounded-[20px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              left: '0px',
              top: '0px',
              width: '170px',
              height: '50px',
              backgroundColor: '#000000',
              padding: '8px 12px'
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-shrink-0">
                <Image
                  src="/images/landing/281-43.png"
                  alt="Apple icon"
                  width={24}
                  height={24}
                  className="object-contain brightness-0 invert"
                />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 400,
                    fontSize: '9px',
                    lineHeight: '11px',
                    color: '#ffffff',
                    marginBottom: '1px'
                  }}
                >
                  Download on the
                </div>
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#ffffff'
                  }}
                >
                  App Store
                </div>
              </div>
            </div>
          </div>

          {/* Google Play Button */}
          <div
            className="absolute rounded-[20px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              left: '190px',
              top: '0px',
              width: '170px',
              height: '50px',
              backgroundColor: '#000000',
              padding: '8px 12px'
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-shrink-0">
                <Image
                  src="/images/landing/281-51.png"
                  alt="Google Play icon"
                  width={24}
                  height={24}
                  className="object-contain brightness-0 invert"
                />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 400,
                    fontSize: '9px',
                    lineHeight: '11px',
                    color: '#ffffff',
                    marginBottom: '1px'
                  }}
                >
                  GET IT ON
                </div>
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#ffffff'
                  }}
                >
                  Google Play
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Terms Links - Exact Figma positioning */}
        <div className="absolute" style={{ left: '874px', top: '517px' }}>
          <span
            className="cursor-pointer hover:underline"
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '17.22px',
              color: '#ffffff',
              marginRight: '40px'
            }}
          >
            Privacy
          </span>
          <span
            className="cursor-pointer hover:underline"
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '17.22px',
              color: '#ffffff'
            }}
          >
            Terms
          </span>
        </div>
      </div>

      {/* Footer - Exact Figma positioning */}
      <div
        className="absolute rounded-[20px]"
        style={{
          left: '-9px',
          top: '2251px',
          width: '1457px',
          height: '380px',
          backgroundColor: '#ffffff',
          boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25), 2px 2px 0px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Footer Logo - Exact Figma positioning */}
        <div
          className="absolute"
          style={{
            left: '70px',
            top: '-120px',
            width: '500px',
            height: '500px'
          }}
        >
          <Image
            src="/images/landing/281-53.png"
            alt="TindaGo Footer Logo"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Footer Content - Exact Figma positioning */}
        <div className="absolute" style={{ left: '860px', top: '65px' }}>
          {/* Navigation Section */}
          <div>
            <h3
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '20px',
                lineHeight: '24.6px',
                color: '#1e1e1e',
                margin: '0 0 20px 0'
              }}
            >
              Navigation
            </h3>
            <div
              className="cursor-pointer hover:underline"
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '17.22px',
                color: '#1e1e1e'
              }}
            >
              Learn more
            </div>
          </div>

          {/* Connect Section - Exact Figma positioning */}
          <div style={{ position: 'absolute', left: '164px', top: '0px' }}>
            <h3
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '20px',
                lineHeight: '24.6px',
                color: '#1e1e1e',
                margin: '0 0 20px 0'
              }}
            >
              Connect
            </h3>
            <div className="space-y-4">
              <div
                className="cursor-pointer hover:underline transition-colors duration-200 hover:text-blue-600"
                style={{
                  fontFamily: 'Clash Grotesk Variable, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '17.22px',
                  color: '#1e1e1e',
                  marginBottom: '8px'
                }}
              >
                X (Twitter)
              </div>
              <div
                className="cursor-pointer hover:underline transition-colors duration-200 hover:text-blue-600"
                style={{
                  fontFamily: 'Clash Grotesk Variable, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '17.22px',
                  color: '#1e1e1e',
                  marginBottom: '8px'
                }}
              >
                Instagram
              </div>
              <div
                className="cursor-pointer hover:underline transition-colors duration-200 hover:text-blue-600"
                style={{
                  fontFamily: 'Clash Grotesk Variable, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '17.22px',
                  color: '#1e1e1e'
                }}
              >
                Facebook
              </div>
            </div>
          </div>

          {/* Contacts Section - Exact Figma positioning */}
          <div style={{ position: 'absolute', left: '328px', top: '0px' }}>
            <h3
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '20px',
                lineHeight: '24.6px',
                color: '#1e1e1e',
                margin: '0 0 20px 0'
              }}
            >
              Contacts
            </h3>
            <div
              className="cursor-pointer hover:underline"
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '17.22px',
                color: '#1e1e1e'
              }}
            >
              Contact us
            </div>
          </div>
        </div>

        {/* Bottom Footer - Exact Figma positioning */}
        <div
          className="absolute flex justify-between items-center"
          style={{
            left: '40px',
            bottom: '20px',
            right: '40px'
          }}
        >
          <div
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '17.22px',
              color: '#1e1e1e'
            }}
          >
            TindaGo. All Rights Reserved 2025.
          </div>
          <div className="flex gap-6">
            <span
              className="cursor-pointer hover:underline"
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '17.22px',
                color: '#1e1e1e'
              }}
            >
              Terms of services
            </span>
            <span
              className="cursor-pointer hover:underline"
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '17.22px',
                color: '#1e1e1e'
              }}
            >
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}