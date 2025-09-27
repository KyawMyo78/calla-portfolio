"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const BUTTON_SIZE = 64;
const ARC_RADIUS = BUTTON_SIZE / 2 + 8; // 8px gap for visibility
const SVG_SIZE = ARC_RADIUS * 2 + 16; // extra padding
const CENTER = SVG_SIZE / 2;
const ARC_START_X = CENTER - ARC_RADIUS;
const ARC_START_Y = CENTER;

export default function FloatingAIButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show the floating button on the chat page itself
  if (pathname === '/admin/chat') {
    return null;
  }

  const handleClick = () => {
    router.push('/admin/chat');
  };

  return (
    <div 
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-center"
      style={{ width: SVG_SIZE, height: SVG_SIZE + BUTTON_SIZE / 2 }}
    >
      {/* SVG for the curved text above the button */}
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        className="absolute top-0 left-0 z-10 pointer-events-none"
        style={{ transform: 'rotate(-40deg)' }}
      >
        <defs>
          <path
            id="curved-path"
            d={`M ${ARC_START_X} ${ARC_START_Y} a ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${ARC_RADIUS * 2} 0`}
            fill="transparent"
          />
        </defs>
        <text fill="#1c332f" fontSize="11" fontWeight="bold" className="select-none">
          <textPath href="#curved-path" startOffset="50%" textAnchor="middle">
            Ask AP's Clover
          </textPath>
        </text>
      </svg>

      {/* Main Button - centered at bottom of SVG */}
      <button
        onClick={handleClick}
        className="absolute bg-primary-900 hover:bg-primary-800 transition-all duration-300 ease-out transform hover:scale-105 shadow-lg hover:shadow-2xl rounded-full overflow-hidden active:scale-95"
        style={{ 
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          top: SVG_SIZE / 2 - BUTTON_SIZE / 2,
          left: SVG_SIZE / 2 - BUTTON_SIZE / 2
        }}
        aria-label="Open AI Chat with AP's Clover"
      >
        <img
          src="/apclover.jpg"
          alt="AP's Clover"
          className="object-cover"
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE + 2,
            marginTop: -1,
            marginLeft: 0
          }}
        />
      </button>
    </div>
  );
}