"use client";

import React, { useState, useEffect } from "react";
import { X } from 'lucide-react';
import PublicChatPopup from './PublicChatPopup';

const MINIMIZED_KEY = 'publicChatMinimized';
const BUBBLE_CLOSED_KEY = 'publicChatBubbleClosed';

const BUTTON_SIZE = 64;
const ARC_RADIUS = BUTTON_SIZE / 2 + 8; // 8px gap for visibility
const SVG_SIZE = ARC_RADIUS * 2 + 16; // extra padding
const CENTER = SVG_SIZE / 2;
const ARC_START_X = CENTER - ARC_RADIUS;
const ARC_START_Y = CENTER;

interface PublicChatBubbleProps {
  mascot?: string;
  onMinimizedChange?: (minimized: boolean) => void;
}

export default function PublicChatBubble({ mascot = "/apclover.jpg", onMinimizedChange }: PublicChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isBubbleClosed, setIsBubbleClosed] = useState(false);

  // Don't load closed state from localStorage on mount - always show bubble on page load
  useEffect(() => {
    // Bubble always starts visible on page load
    setIsMinimized(false);
    setIsBubbleClosed(false);
    if (onMinimizedChange) {
      onMinimizedChange(false);
    }
  }, [onMinimizedChange]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setIsBubbleClosed(false);
    try {
      localStorage.setItem(MINIMIZED_KEY, 'false');
      localStorage.setItem(BUBBLE_CLOSED_KEY, 'false');
    } catch (e) {
      console.error('Failed to save chat state:', e);
    }
    if (onMinimizedChange) {
      onMinimizedChange(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // When closed from popup, minimize to bubble
    setIsMinimized(false);
    setIsBubbleClosed(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
    setIsMinimized(true);
    try {
      localStorage.setItem(MINIMIZED_KEY, 'true');
    } catch (e) {
      console.error('Failed to save chat state:', e);
    }
    if (onMinimizedChange) {
      onMinimizedChange(true);
    }
  };

  const handleBubbleClose = () => {
    // Close the bubble temporarily (move to navbar) - will reappear on page reload
    setIsBubbleClosed(true);
    setIsMinimized(false);
    setIsOpen(false);
    // Don't save to localStorage so bubble reappears on page reload
    if (onMinimizedChange) {
      onMinimizedChange(true);
    }
  };

  // Don't render bubble if it's closed (will appear in navbar instead)
  if (isBubbleClosed || isMinimized) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Bubble with Curved Text */}
      {!isOpen && (
        <div 
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 flex flex-col items-center"
          style={{ width: SVG_SIZE, height: SVG_SIZE + BUTTON_SIZE / 2 }}
        >
          <div className="relative group" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
            {/* Close button - positioned at top right of the SVG area */}
            <button
              onClick={handleBubbleClose}
              className="absolute -top-1 -right-1 z-20 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90"
              title="Close chat (move to navbar)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* SVG for the curved text above the button */}
            <svg
              width={SVG_SIZE}
              height={SVG_SIZE}
              className="absolute top-0 left-0 z-10 pointer-events-none"
              style={{ transform: 'rotate(-40deg)' }}
            >
              <defs>
                <path
                  id="curved-path-public"
                  d={`M ${ARC_START_X} ${ARC_START_Y} a ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${ARC_RADIUS * 2} 0`}
                  fill="transparent"
                />
              </defs>
              <text fill="#1c332f" fontSize="11" fontWeight="bold" className="select-none">
                <textPath href="#curved-path-public" startOffset="50%" textAnchor="middle">
                  Ask AP's Clover
                </textPath>
              </text>
            </svg>

            {/* Main Button - centered */}
            <button
              onClick={handleOpen}
              className="absolute bg-primary-900 hover:bg-primary-800 transition-all duration-300 ease-out transform hover:scale-105 shadow-lg hover:shadow-2xl rounded-full overflow-hidden active:scale-95"
              style={{ 
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                top: SVG_SIZE / 2 - BUTTON_SIZE / 2,
                left: SVG_SIZE / 2 - BUTTON_SIZE / 2
              }}
              aria-label="Open chat with AP's Clover"
            >
              <img
                src={mascot}
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
        </div>
      )}

      {/* Chat Popup */}
      <PublicChatPopup 
        isOpen={isOpen}
        onClose={handleClose}
        onMinimize={handleMinimize}
        mascot={mascot}
      />
    </>
  );
}
