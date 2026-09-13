'use client';

import { useId, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import './sonic-core.css';

type Coordinate = readonly [number, number];

// Original, deliberately simplified geographic contours. Geographic positions
// provide visual context only; the lab nodes below do not claim physical locations.
const continents: Coordinate[][] = [
  [
    [-168, 66],
    [-152, 71],
    [-138, 69],
    [-128, 71],
    [-110, 73],
    [-94, 74],
    [-82, 69],
    [-66, 62],
    [-60, 53],
    [-53, 49],
    [-60, 45],
    [-67, 44],
    [-71, 41],
    [-75, 36],
    [-81, 25],
    [-83, 29],
    [-90, 29],
    [-97, 26],
    [-97, 21],
    [-88, 16],
    [-84, 11],
    [-79, 9],
    [-83, 8],
    [-88, 13],
    [-95, 16],
    [-105, 21],
    [-111, 29],
    [-116, 32],
    [-123, 42],
    [-130, 51],
    [-141, 60],
    [-152, 59],
    [-164, 55],
    [-168, 66],
  ],
  [
    [-81, 12],
    [-74, 11],
    [-69, 10],
    [-63, 10],
    [-60, 7],
    [-51, 4],
    [-48, -1],
    [-35, -6],
    [-38, -14],
    [-40, -21],
    [-48, -28],
    [-53, -34],
    [-59, -40],
    [-65, -55],
    [-70, -53],
    [-75, -44],
    [-74, -33],
    [-70, -18],
    [-77, -9],
    [-81, -4],
    [-78, 2],
    [-81, 12],
  ],
  [
    [-52, 60],
    [-43, 60],
    [-38, 66],
    [-22, 71],
    [-20, 77],
    [-31, 83],
    [-49, 83],
    [-60, 77],
    [-58, 69],
    [-52, 60],
  ],
  [
    [-17, 37],
    [-6, 36],
    [2, 37],
    [10, 37],
    [12, 33],
    [20, 32],
    [25, 32],
    [32, 31],
    [35, 23],
    [43, 12],
    [51, 12],
    [48, 5],
    [42, -1],
    [40, -11],
    [35, -20],
    [33, -27],
    [26, -34],
    [18, -35],
    [13, -27],
    [12, -17],
    [9, -5],
    [5, 4],
    [-4, 5],
    [-9, 5],
    [-16, 12],
    [-17, 21],
    [-13, 27],
    [-10, 30],
    [-17, 37],
  ],
  [
    [-10, 36],
    [-9, 43],
    [-2, 44],
    [-5, 48],
    [2, 51],
    [7, 54],
    [9, 58],
    [5, 59],
    [5, 63],
    [15, 69],
    [26, 71],
    [31, 70],
    [29, 61],
    [38, 65],
    [43, 68],
    [55, 70],
    [70, 73],
    [86, 73],
    [100, 77],
    [130, 71],
    [160, 69],
    [179, 65],
    [163, 59],
    [151, 59],
    [142, 50],
    [132, 43],
    [125, 40],
    [122, 31],
    [120, 24],
    [109, 20],
    [106, 10],
    [100, 4],
    [98, 15],
    [91, 22],
    [87, 21],
    [80, 8],
    [74, 15],
    [70, 22],
    [61, 26],
    [56, 26],
    [52, 16],
    [44, 13],
    [39, 21],
    [35, 30],
    [35, 36],
    [27, 41],
    [26, 38],
    [22, 37],
    [20, 40],
    [16, 41],
    [16, 38],
    [12, 43],
    [7, 44],
    [3, 42],
    [0, 39],
    [-10, 36],
  ],
  [
    [-8, 50],
    [-5, 50],
    [1, 52],
    [-2, 55],
    [-3, 58],
    [-6, 59],
    [-6, 55],
    [-8, 50],
  ],
  [
    [-10, 51],
    [-6, 52],
    [-6, 55],
    [-9, 55],
    [-10, 51],
  ],
  [
    [-24, 64],
    [-17, 63],
    [-13, 65],
    [-17, 67],
    [-23, 66],
    [-24, 64],
  ],
  [
    [49, -12],
    [51, -16],
    [47, -25],
    [44, -25],
    [44, -19],
    [49, -12],
  ],
  [
    [113, -22],
    [114, -34],
    [130, -33],
    [138, -37],
    [149, -38],
    [154, -27],
    [146, -16],
    [142, -11],
    [135, -13],
    [129, -15],
    [122, -17],
    [113, -22],
  ],
];

const radians = Math.PI / 180;
function project([longitude, latitude]: Coordinate) {
  const lon = (longitude + 20) * radians;
  const lat = latitude * radians;
  const tilt = 13 * radians;
  return {
    x: 450 + 186 * Math.cos(lat) * Math.sin(lon),
    y:
      285 -
      186 *
        (Math.cos(tilt) * Math.sin(lat) -
          Math.sin(tilt) * Math.cos(lat) * Math.cos(lon)),
    visible:
      Math.sin(tilt) * Math.sin(lat) +
        Math.cos(tilt) * Math.cos(lat) * Math.cos(lon) >
      0,
  };
}
function line(points: Coordinate[]) {
  let previousVisible = false;
  return points
    .map((coordinate) => {
      const point = project(coordinate);
      const segment = point.visible
        ? `${previousVisible ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`
        : '';
      previousVisible = point.visible;
      return segment;
    })
    .join(' ');
}
function onLand([x, y]: Coordinate) {
  return continents.some((polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
        inside = !inside;
    }
    return inside;
  });
}
const grid: string[] = [];
for (let latitude = -60; latitude <= 75; latitude += 15) {
  grid.push(
    line(Array.from({ length: 181 }, (_, i) => [-180 + i * 2, latitude])),
  );
}
for (let longitude = -180; longitude < 180; longitude += 20) {
  grid.push(
    line(Array.from({ length: 91 }, (_, i) => [longitude, -90 + i * 2])),
  );
}
const landMesh: string[] = [];
const landDots: { x: number; y: number }[] = [];
for (let latitude = -55; latitude <= 82; latitude += 3) {
  for (let longitude = -180; longitude <= 180; longitude += 3) {
    const coordinate: Coordinate = [longitude, latitude];
    const point = project(coordinate);
    if (!point.visible || !onLand(coordinate)) continue;
    landDots.push(point);
    for (const neighbor of [
      [longitude + 3, latitude],
      [longitude, latitude + 3],
      [longitude + 3, latitude + 3],
    ] as Coordinate[]) {
      if (onLand(neighbor) && project(neighbor).visible)
        landMesh.push(line([coordinate, neighbor]));
    }
  }
}

const systems = [
  {
    id: 'windows',
    label: 'WINDOWS',
    detail: 'Administrative workstation',
    status: 'PREPARATION',
    description:
      'Start here. Windows hosts PowerShell and OpenSSH; your private SSH key stays on this workstation.',
    lesson: 'windows-tools-v2',
    x: 17,
    y: 24,
    point: [300, 176],
  },
  {
    id: 'azure',
    label: 'AZURE',
    detail: 'Lab VNet / subnet',
    status: 'PREPARATION',
    description:
      'The lab VNet contains both RHEL hosts. Separate public administration addresses from the private manager-to-endpoint path.',
    lesson: 'network-plan-v2',
    x: 11,
    y: 45,
    point: [264, 285],
  },
  {
    id: 'ssh',
    label: 'SSH',
    detail: 'Restricted administration',
    status: 'PREPARATION',
    description:
      'Windows connects to each RHEL host over TCP 22 using rexuser and verified SSH keys. Restrict the source to your workstation’s public IP.',
    lesson: 'first-ssh-v2',
    x: 17,
    y: 66,
    point: [300, 394],
  },
  {
    id: 'rhel',
    label: 'RHEL 9',
    detail: 'Manager + endpoint hosts',
    status: 'PREPARATION',
    description:
      'Build two distinct systems: rhel9-manager-01 and rhel9-lab-01. Verify the identity, storage, and access of each host.',
    lesson: 'paired-access-v3',
    x: 83,
    y: 24,
    point: [600, 176],
  },
  {
    id: 'wazuh',
    lesson: 'wazuh-release-v4',
    label: 'WAZUH',
    detail: 'Central manager / dashboard',
    status: 'AVAILABLE',
    description:
      'The central manager, indexer, and dashboard belong on rhel9-manager-01. Central installation and verification lessons are available.',
    x: 89,
    y: 45,
    point: [636, 285],
  },
  {
    id: 'agent',
    lesson: 'wazuh-agent-v4',
    label: 'SECURITY AGENT',
    detail: 'RHEL endpoint → manager',
    status: 'PLANNED',
    description:
      'The endpoint agent will communicate with the central manager over the lab’s private network. Enrollment and check-in are taught in the deployment lessons.',
    x: 83,
    y: 66,
    point: [600, 394],
  },
  {
    id: 'compliance',
    label: 'COMPLIANCE',
    detail: 'Hardening / evidence',
    status: 'LATER',
    description:
      'STIG hardening, assessment evidence, and reusable baselines follow the main deployment scenario. No compliance score is being reported.',
    x: 50,
    y: 92,
    point: [450, 471],
  },
];

export function SonicCore({
  onOpenLesson,
  onOpenRoadmap,
}: {
  onOpenLesson: (id: string) => void;
  onOpenRoadmap: () => void;
}) {
  const [selected, setSelected] = useState('azure');
  const [paused, setPaused] = useState(false);
  const uid = useId().replaceAll(':', '');
  const system = systems.find((item) => item.id === selected)!;
  return (
    <section
      className={`sonic-core ${paused ? 'core-paused' : ''}`}
      aria-label="SONIC Infrastructure Awareness"
    >
      <header className="core-header">
        <div>
          <span>SONIC CORE</span>
          <h2>Infrastructure awareness</h2>
        </div>
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          aria-label={
            paused ? 'Resume globe animation' : 'Pause globe animation'
          }
          aria-pressed={paused}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
          <span>{paused ? 'Resume' : 'Pause'}</span>
        </button>
      </header>
      <div className="core-map">
        <svg
          viewBox="0 0 900 590"
          className="core-globe"
          aria-label="Holographic globe linking Windows, Azure, RHEL, Wazuh, SSH, security agent, and compliance. Conceptual topology, not geographic deployment locations."
        >
          <title>SONIC infrastructure globe</title>
          <defs>
            <radialGradient id={`${uid}-sphere`} cx="38%" cy="30%" r="72%">
              <stop offset="0" stopColor="#303136" stopOpacity=".7" />
              <stop offset=".7" stopColor="#08090b" stopOpacity=".94" />
              <stop offset="1" stopColor="#27292d" stopOpacity=".7" />
            </radialGradient>
            <radialGradient id={`${uid}-halo`}>
              <stop offset=".6" stopColor="#c94450" stopOpacity="0" />
              <stop offset=".8" stopColor="#c94450" stopOpacity=".075" />
              <stop offset="1" stopColor="#c94450" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uid}-scan`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ef4c5c" stopOpacity="0" />
              <stop offset="1" stopColor="#ef4c5c" stopOpacity=".12" />
            </linearGradient>
            <clipPath id={`${uid}-clip`}>
              <circle cx="450" cy="285" r="185" />
            </clipPath>
          </defs>
          <circle cx="450" cy="285" r="259" fill={`url(#${uid}-halo)`} />
          <g className="core-hud" fill="none">
            <circle
              cx="450"
              cy="285"
              r="240"
              stroke="#686b72"
              strokeWidth=".6"
              strokeDasharray="3 11"
            />
            <circle
              cx="450"
              cy="285"
              r="228"
              stroke="#393c42"
              strokeWidth=".6"
            />
            <circle
              cx="450"
              cy="285"
              r="222"
              stroke="#92959b"
              strokeWidth="2"
              strokeDasharray="165 35 8 25 110 220"
              className="core-ring"
            />
            <circle
              cx="450"
              cy="285"
              r="211"
              stroke="#27292d"
              strokeWidth="7"
            />
            <circle
              cx="450"
              cy="285"
              r="211"
              stroke="#c74955"
              strokeWidth="3"
              strokeDasharray="72 260 130 190"
              opacity=".75"
            />
            <circle
              cx="450"
              cy="285"
              r="200"
              stroke="#5d6068"
              strokeWidth=".5"
            />
            <circle
              className="core-tactical-ring"
              cx="450"
              cy="285"
              r="222"
              stroke="#ff5869"
              strokeWidth="2"
              strokeDasharray="42 570 24 759"
              transform="rotate(-57 450 285)"
            />
            <ellipse
              cx="450"
              cy="285"
              rx="263"
              ry="79"
              transform="rotate(-26 450 285)"
              stroke="#9b9fa6"
              strokeWidth=".65"
              strokeDasharray="190 28"
              opacity=".6"
            />
          </g>
          <circle
            cx="450"
            cy="285"
            r="186"
            fill={`url(#${uid}-sphere)`}
            stroke="#c4c8ce"
            strokeWidth="1.2"
          />
          <g clipPath={`url(#${uid}-clip)`}>
            <path
              d={grid.join(' ')}
              fill="none"
              stroke="#b7bbc2"
              strokeWidth=".55"
              opacity=".5"
            />
            <path
              d={landMesh.join(' ')}
              fill="none"
              stroke="#d6edf7"
              strokeWidth=".55"
              opacity=".34"
            />
            <path
              d={continents.map(line).join(' ')}
              fill="none"
              stroke="#f0f8ff"
              strokeWidth=".8"
              opacity=".78"
            />
            <g fill="#e1f4ff" opacity=".65">
              {landDots.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x.toFixed(2)}
                  cy={point.y.toFixed(2)}
                  r=".65"
                />
              ))}
            </g>
            <g
              className="core-network-paths"
              fill="none"
              stroke="#50d8fa"
              strokeWidth=".7"
            >
              <path d="M336 218 Q399 117 479 187 Q557 203 566 301 Q511 287 485 399 Q391 356 336 218 M336 218 Q434 245 566 301 M479 187 Q432 268 485 399" />
              <path
                className="core-tactical-route"
                d="M336 218 Q399 117 479 187 Q557 203 566 301"
              />
            </g>
            <g fill="#91eeff" className="core-points">
              {[
                [336, 218],
                [479, 187],
                [566, 301],
                [485, 399],
              ].map(([x, y]) => (
                <g key={x}>
                  <circle cx={x} cy={y} r="3" />
                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    fill="none"
                    stroke="#35d9ff"
                    strokeWidth=".6"
                  />
                </g>
              ))}
            </g>
            <g className="core-scan">
              <rect
                x="264"
                y="130"
                width="372"
                height="62"
                fill={`url(#${uid}-scan)`}
              />
              <path
                d="M264 192H636"
                stroke="#ed6370"
                strokeWidth=".6"
                opacity=".45"
              />
            </g>
            <rect x="264" y="253" width="372" height="67" fill="#090a0ce0" />
          </g>
          <text x="450" y="284" className="core-wordmark" textAnchor="middle">
            SONIC
          </text>
          <text x="450" y="307" className="core-submark" textAnchor="middle">
            INFRASTRUCTURE AWARENESS
          </text>
          <g className="core-leaders" fill="none">
            {systems.map((item) => {
              const x = item.x * 9;
              const y = item.y * 5.9;
              const [px, py] = item.point;
              return (
                <path
                  key={item.id}
                  className={selected === item.id ? 'selected' : ''}
                  d={`M${px} ${py} L${(px + x) / 2} ${py} L${x} ${y}`}
                />
              );
            })}
          </g>
          <g fill="#53d8fb">
            <circle cx="450" cy="57" r="2.5" />
            <circle cx="228" cy="285" r="2" />
            <circle cx="672" cy="285" r="2" />
          </g>
          <text x="450" y="24" className="core-coordinates" textAnchor="middle">
            WORKSTATION → NETWORK → SYSTEMS
          </text>
        </svg>
        <div
          className="core-system-nodes"
          aria-label="Explore connected lab systems"
        >
          {systems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`core-system core-system--${item.id}`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={() => setSelected(item.id)}
              aria-pressed={selected === item.id}
              aria-controls={`${uid}-detail`}
              aria-label={`${item.label} ${item.detail}`}
            >
              <span
                className={`core-node-light ${item.status !== 'LATER' ? '' : 'core-node-light--planned'}`}
              />
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="core-selection" id={`${uid}-detail`}>
        <div aria-live="polite">
          <span className="core-selection-label">
            {system.label} <span>/ {system.status}</span>
          </span>
          <p>{system.description}</p>
        </div>
        <button
          type="button"
          onClick={() =>
            system.lesson ? onOpenLesson(system.lesson) : onOpenRoadmap()
          }
        >
          {system.lesson ? 'Open lesson' : 'View roadmap'}
          <ArrowRight size={14} />
        </button>
      </div>
      <footer className="core-legend">
        <span>
          <i /> Preparation
        </span>
        <span>
          <i /> Later deep dives
        </span>
        <span>CONCEPTUAL LAB MAP · NO LIVE TELEMETRY</span>
      </footer>
    </section>
  );
}
