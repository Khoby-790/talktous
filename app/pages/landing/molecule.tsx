import { type FC } from "react";
import { cn } from "~/lib/utils";

/**
 * Geometric molecule — channels and connected systems orbiting one inbox.
 * Flat white circles and thin connectors. Messages pulse in from each
 * channel to the inbox, and on to the agents — the one ember node, the people.
 */

type Node = { id: string; x: number; y: number; r: number; label?: string; solid?: boolean; human?: boolean };

const nodes: Node[] = [
  { id: "core", x: 260, y: 260, r: 34, label: "Inbox", solid: true },
  { id: "web", x: 120, y: 120, r: 16, label: "Web" },
  { id: "email", x: 410, y: 110, r: 16, label: "Email" },
  { id: "wa", x: 440, y: 330, r: 16, label: "WhatsApp" },
  { id: "api", x: 95, y: 360, r: 16, label: "API" },
  { id: "agents", x: 270, y: 455, r: 22, label: "Agents", human: true },
  { id: "crm", x: 470, y: 470, r: 9 },
  { id: "pay", x: 60, y: 230, r: 9 },
  { id: "ops", x: 280, y: 60, r: 9 },
  { id: "s1", x: 520, y: 220, r: 5 },
  { id: "s2", x: 160, y: 470, r: 5 },
];

const edges: [string, string][] = [
  ["core", "web"],
  ["core", "email"],
  ["core", "wa"],
  ["core", "api"],
  ["core", "agents"],
  ["web", "pay"],
  ["web", "ops"],
  ["email", "ops"],
  ["email", "s1"],
  ["wa", "s1"],
  ["wa", "crm"],
  ["agents", "crm"],
  ["agents", "s2"],
  ["api", "s2"],
  ["api", "pay"],
];

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

export const Molecule: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 560 540" className={cn("h-auto w-full", className)} role="img" aria-label="Channels and systems connected to one inbox">
    <g stroke="rgba(237,255,254,0.28)" strokeWidth={1}>
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={byId[a].x} y1={byId[a].y} x2={byId[b].x} y2={byId[b].y} />
      ))}
    </g>
    {/* Messages flowing: channels → inbox (aqua), inbox → agents (ember) */}
    <g className="molecule-pulse">
      {(["web", "email", "wa", "api"] as const).map((id, i) => (
        <circle key={id} r={3} fill="#cbfffc">
          <animateMotion
            dur="2.8s"
            begin={`${i * 0.7}s`}
            repeatCount="indefinite"
            path={`M${byId[id].x},${byId[id].y} L260,260`}
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
          />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.8s" begin={`${i * 0.7}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <circle r={3.5} fill="#ff7a1a">
        <animateMotion dur="1.4s" begin="1.4s" repeatCount="indefinite" path="M260,260 L270,455" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" begin="1.4s" repeatCount="indefinite" />
      </circle>
    </g>
    {/* Orbit ring around the core */}
    <circle cx={260} cy={260} r={92} fill="none" stroke="rgba(237,255,254,0.12)" strokeDasharray="2 6" />
    {nodes.map((n) => (
      <g key={n.id}>
        {n.human && <circle cx={n.x} cy={n.y} r={n.r + 10} fill="#ff7a1a" opacity={0.18} className="orb-glow" style={{ transformOrigin: `${n.x}px ${n.y}px` }} />}
        <circle
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={n.human ? "#ff7a1a" : n.solid ? "#edfffe" : "#012624"}
          stroke="#ffffff"
          strokeWidth={n.solid || n.human ? 0 : 1.25}
        />
        {n.label && (
          <text
            x={n.x}
            y={n.solid ? n.y + 4 : n.y + n.r + 18}
            textAnchor="middle"
            fill={n.solid ? "#012624" : n.human ? "#ffa25e" : "#bbc7c6"}
            fontSize={10}
            fontWeight={500}
            letterSpacing="0.15em"
            style={{ textTransform: "uppercase" }}
          >
            {n.label.toUpperCase()}
          </text>
        )}
      </g>
    ))}
  </svg>
);

export default Molecule;
