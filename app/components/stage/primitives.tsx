// Shapes in Reel pixels (viewBox 1080×1920), the same as the prototype devmert7/kurgu-kutuphanesi/kurgu.html.
import type { CaptionChunk } from "@/lib/content/types";
import type { Params } from "@/lib/motion/registry";
import { captionStyle } from "@/lib/motion/templates/caption";

export function GroundDefs({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="50%" cy="34%" r="75%">
      <stop offset="0" stopColor="#2a2826" />
      <stop offset=".7" stopColor="#141413" />
    </radialGradient>
  );
}

export function Ground({ id }: { id: string }) {
  return <rect width="1080" height="1920" fill={`url(#${id})`} />;
}

export function TakeDefs({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#4b3d39" />
      <stop offset="1" stopColor="#211b19" />
    </linearGradient>
  );
}

/** The take's room: warm interior with a window strip. */
export function TakeBg({ id }: { id: string }) {
  return (
    <>
      <rect width="1080" height="1920" fill={`url(#${id})`} />
      <rect x="0" y="760" width="1080" height="250" fill="#9fb2b6" opacity=".28" />
      <rect x="0" y="1010" width="1080" height="40" fill="#000" opacity=".12" />
    </>
  );
}

/** A flat presenter: shoulders, neck, head, cap (he records in a cap). */
export function Person() {
  return (
    <g>
      <rect x="150" y="1330" width="780" height="760" rx="330" fill="#2b2b2e" />
      <rect x="482" y="1180" width="116" height="180" rx="40" fill="#a87d5f" />
      <ellipse cx="540" cy="1085" rx="160" ry="185" fill="#B98C6B" />
      <path d="M378 1010 C 378 880, 702 880, 702 1010 Z" fill="#CDB79A" />
      <rect x="372" y="996" width="336" height="30" rx="15" fill="#bba584" />
    </g>
  );
}

/** The PANEL zone with a light glowing data card (dark interview look). */
export function PanelBox({ titleWidth, tileOpacity, opacity = 1, scale = 1 }: { titleWidth: number; tileOpacity: number[]; opacity?: number; scale?: number }) {
  return (
    <g opacity={opacity} transform={`translate(540 352) scale(${scale}) translate(-540 -352)`}>
      <rect x="40" y="60" width="1000" height="585" rx="36" fill="#161615" />
      <rect x="120" y="120" width="840" height="64" rx="14" fill="#2A2A2C" />
      <rect x="150" y="140" width={titleWidth} height="24" rx="12" fill="#ECEAE4" />
      <rect x="120" y="230" width="840" height="340" rx="28" fill="#EDEBE6" />
      {tileOpacity.map((o, i) => (
        <rect key={i} x={160 + i * 128} y="300" width="104" height="104" rx="18" fill={i === 3 ? "#D97757" : "#BDB9AF"} opacity={o} />
      ))}
      <rect x="160" y="450" width="520" height="22" rx="11" fill="#BDB9AF" />
      <rect x="160" y="490" width="360" height="22" rx="11" fill="#D3D0C7" />
    </g>
  );
}

// [width, colour] tokens per code line, VS Code dark colours (real screens use the code-editor look).
const CODE: [number, string][][] = [
  [[110, "#569CD6"], [150, "#9CDCFE"], [40, "#D4D4D4"], [220, "#DCDCAA"]],
  [[60, "#C586C0"], [180, "#9CDCFE"], [260, "#CE9178"]],
  [[130, "#569CD6"], [120, "#9CDCFE"], [40, "#D4D4D4"], [150, "#B5CEA8"]],
  [[90, "#C586C0"], [200, "#DCDCAA"], [40, "#D4D4D4"], [240, "#9CDCFE"], [90, "#D4D4D4"]],
  [[160, "#9CDCFE"], [40, "#D4D4D4"], [300, "#CE9178"]],
  [[70, "#C586C0"], [260, "#DCDCAA"], [120, "#9CDCFE"]],
  [[40, "#D4D4D4"]],
];
const ROWS = 8;

/** A dark editor window (968×560, window pixels) with code lines; `bandRow` gets the clay band. */
export function WindowWithCode({ bandRow, bandOpacity }: { bandRow: number; bandOpacity: number }) {
  return (
    <g>
      <rect x="0" y="0" width="968" height="560" rx="22" fill="#1E1E1E" stroke="#3a3a3c" strokeWidth="2" />
      <rect x="0" y="0" width="968" height="44" rx="22" fill="#2A2A2C" />
      <rect x="0" y="22" width="968" height="22" fill="#2A2A2C" />
      <circle cx="30" cy="22" r="8" fill="#FF5F57" />
      <circle cx="56" cy="22" r="8" fill="#FEBC2E" />
      <circle cx="82" cy="22" r="8" fill="#28C840" />
      <rect x="0" y="44" width="80" height="516" fill="#232325" />
      <g transform="translate(0 30)">
        {Array.from({ length: ROWS }, (_, i) => {
          let x = 150;
          return (
            <g key={i}>
              <rect x="104" y={74 + i * 58} width="16" height="16" rx="4" fill="#5a5a5a" />
              {CODE[i % CODE.length].map(([w, c], j) => {
                const r = <rect key={j} x={x} y={70 + i * 58} width={w} height="24" rx="8" fill={c} opacity={i === bandRow ? 1 : 0.55} />;
                x += w + 16;
                return r;
              })}
            </g>
          );
        })}
      </g>
      <rect x="96" y={82 + bandRow * 58} width="804" height="60" rx="10" fill="rgba(217,119,87,.22)" stroke="#D97757" strokeWidth="5" opacity={bandOpacity} />
    </g>
  );
}

export type DimLine =
  | { kind: "y"; y: number; label: string; at?: "left" | "below-right" | "above-right" }
  | { kind: "box"; x: number; y: number; w: number; h: number; label: string };

/** Measurement overlay ("Ölçüleri göster"): dashed sky lines with readable labels. */
export function Dims({ lines }: { lines: DimLine[] }) {
  const text = { fontFamily: "Mono, monospace", fontSize: 34, fill: "#9cc2e8", stroke: "#141413", strokeWidth: 10, paintOrder: "stroke", strokeLinejoin: "round" } as const;
  return (
    <g>
      {lines.map((l, i) => l.kind === "y" ? (
        <g key={i}>
          <line x1="0" x2="1080" y1={l.y} y2={l.y} stroke="#6A9BCC" strokeWidth="4" strokeDasharray="18 12" />
          {l.at === "below-right" || l.at === "above-right"
            ? <text {...text} x="1056" y={l.at === "below-right" ? l.y + 44 : l.y - 14} textAnchor="end">{l.label}</text>
            : <text {...text} x="24" y={l.y - 14}>{l.label}</text>}
        </g>
      ) : (
        <g key={i}>
          <rect x={l.x} y={l.y} width={l.w} height={l.h} fill="none" stroke="#6A9BCC" strokeWidth="4" strokeDasharray="18 12" />
          <text {...text} x={l.x + 16} y={l.y + l.h - 18}>{l.label}</text>
        </g>
      ))}
    </g>
  );
}

/** The burned-in caption pill (HTML over the SVG, sized in container units: 1080 Reel px = 100cqw). */
export function CaptionPill({ chunk, mode, p }: { chunk: CaptionChunk; mode: "bottom" | "band"; p: Params }) {
  const s = captionStyle(p);
  const cq = (px: number) => `${(px / 10.8).toFixed(3)}cqw`;
  return (
    <div
      data-caption
      className="absolute left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap bg-[rgba(20,20,19,.9)] text-white"
      style={{ fontFamily: s.fontFamily, fontWeight: s.fontWeight, fontSize: cq(s.size), lineHeight: 1, padding: `${cq(s.padY)} ${cq(s.padX)}`, borderRadius: "1.3cqw", ...(mode === "band" ? { top: "37.5%" } : { bottom: "17.19%" }) }}
    >
      {chunk.map((part, i) => typeof part === "string"
        ? <span key={i}>{part}</span>
        : <b key={i} className="bg-clay [font-weight:inherit]" style={{ borderRadius: ".74cqw", padding: "0 .93cqw", margin: "0 .2cqw" }}>{part.k}</b>)}
    </div>
  );
}
