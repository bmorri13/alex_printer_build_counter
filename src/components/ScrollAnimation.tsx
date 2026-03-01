'use client';

import React from 'react';
import { useScrollFrames } from '../hooks/useScrollFrames';

const TOTAL_FRAMES = 76;

export function ScrollAnimation() {
  const { canvasRef, sectionRef, loadProgress, currentFrame } = useScrollFrames({
    framePath: '/frames/frame-',
    frameExtension: '.jpg',
    totalFrames: TOTAL_FRAMES,
    reverse: true,
  });

  const progress = currentFrame / (TOTAL_FRAMES - 1);

  // Overlay fade helpers
  const introOpacity =
    progress < 0.05 ? 0 :
    progress < 0.15 ? (progress - 0.05) / 0.1 :
    progress < 0.35 ? 1 :
    progress < 0.45 ? 1 - (progress - 0.35) / 0.1 : 0;

  const midOpacity =
    progress < 0.5 ? 0 :
    progress < 0.6 ? (progress - 0.5) / 0.1 :
    progress < 0.8 ? 1 :
    progress < 0.9 ? 1 - (progress - 0.8) / 0.1 : 0;

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '500vh',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />

        {/* Intro text overlay — bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            left: 'clamp(16px, 5vw, 80px)',
            right: 'clamp(16px, 5vw, 80px)',
            maxWidth: '380px',
            textAlign: 'left',
            opacity: introOpacity,
            transition: 'opacity 0.05s',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <p
            style={{
              color: '#fff',
              fontSize: 'clamp(1rem, 2.5vw, 2rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              textShadow: '0 2px 20px rgba(0,0,0,0.8)',
              lineHeight: 1.5,
            }}
          >
            In a world where Alex actually builds things...
          </p>
        </div>

        {/* Mid-animation overlay — top right */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: 'clamp(16px, 5vw, 80px)',
            right: 'clamp(16px, 5vw, 80px)',
            textAlign: 'right',
            opacity: midOpacity,
            transition: 'opacity 0.05s',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <p
            style={{
              color: '#fff',
              fontSize: 'clamp(1.1rem, 3vw, 2.5rem)',
              fontWeight: 700,
              textShadow: '0 2px 30px rgba(0,0,0,0.8)',
              letterSpacing: '0.05em',
            }}
          >
            Presenting: The Printer
          </p>
        </div>

        {/* Loading indicator */}
        {loadProgress < 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3,
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: 20,
                fontSize: 14,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Loading {Math.round(loadProgress * 100)}%
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
