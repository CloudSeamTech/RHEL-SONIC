'use client';
import { useState } from 'react';
const routes = [
  { from: [185, 145], to: [460, 105], label: 'North America → Europe' },
  { from: [475, 115], to: [710, 160], label: 'Europe → Asia' },
  { from: [740, 185], to: [260, 285], label: 'Asia → South America' },
  { from: [490, 260], to: [780, 330], label: 'Africa → Australia' },
  { from: [265, 300], to: [480, 140], label: 'South America → Europe' },
];
export function CyberActivityMap() {
  const [paused, setPaused] = useState(false);
  return (
    <section
      className={`cyber-map ${paused ? 'is-paused' : ''}`}
      aria-label="Simulated global security activity"
    >
      <header>
        <div>
          <span className="eyebrow">
            SIMULATED ACTIVITY · FICTIONAL CONNECTIONS
          </span>
          <h2>Follow the signal. Check the evidence.</h2>
        </div>
        <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
          {paused ? 'Play animation' : 'Pause animation'}
        </button>
      </header>
      <svg
        viewBox="0 0 960 440"
        role="img"
        aria-labelledby="cyber-map-title cyber-map-description"
      >
        <title id="cyber-map-title">
          Illustrated world map with animated practice connections
        </title>
        <desc id="cyber-map-description">
          Stylized continent outlines and fictional connections between regions.
          This is an animation, not live threat intelligence or evidence about
          any country.
        </desc>
        <defs>
          <pattern
            id="map-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0H0V40"
              fill="none"
              stroke="currentColor"
              strokeWidth=".4"
            />
          </pattern>
        </defs>
        <rect width="960" height="440" fill="url(#map-grid)" opacity=".18" />
        <g
          className="world-outline"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        >
          <path d="M65 90 115 65 165 75 190 55 245 60 280 88 265 115 230 130 225 160 195 180 195 210 220 240 200 250 175 225 155 190 120 170 95 135Z" />
          <path d="M260 35 310 28 325 60 300 90 270 80Z M225 235 270 245 300 275 290 315 270 345 250 390 230 365 220 330 205 290Z" />
          <path d="M420 100 450 80 475 85 490 65 520 75 515 110 490 130 450 140 425 125Z M440 155 485 140 530 160 550 200 530 245 505 265 485 315 460 305 455 270 425 230 415 190Z" />
          <path d="M515 75 560 55 630 60 675 45 730 65 800 75 855 100 845 130 815 140 795 170 760 180 745 220 720 210 700 175 675 185 650 225 630 195 615 150 580 150 550 130 510 120Z M745 230 775 245 790 265 775 280 750 265Z M770 300 805 285 850 300 865 330 835 355 795 355 760 335Z M875 355 885 375 870 390Z" />
        </g>
        {routes.map((route, i) => {
          const d = `M${route.from.join(' ')} Q480 ${35 + i * 30} ${route.to.join(' ')}`;
          return (
            <g key={route.label}>
              <path
                id={`activity-route-${i}`}
                d={d}
                className="activity-route"
              />
              <circle
                cx={route.from[0]}
                cy={route.from[1]}
                r="4"
                className="activity-node"
              />
              <circle
                cx={route.to[0]}
                cy={route.to[1]}
                r="4"
                className="activity-node"
              />
              <circle r="4" className="activity-packet">
                <animateMotion
                  dur={`${4 + i}s`}
                  repeatCount="indefinite"
                  path={d}
                />
              </circle>
            </g>
          );
        })}
      </svg>
      <p>
        Practice visualization only. A connection from another region is not
        proof of an attack. In the labs, you’ll check the source, action and
        outcome before drawing a conclusion.
      </p>
    </section>
  );
}
