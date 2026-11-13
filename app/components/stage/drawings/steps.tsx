// Drawings for the step-number cards (templates/steps.ts), 2026-11-12. Inter, as in the Reel (not Apple's SF: its licence covers
// Apple-platform UI mock-ups, not our video); no Apple marks. Overlays stay out of the head area (creator, 2026-11-12).
import type { Params } from "@/lib/motion/registry";
import { keypadFrame, lockFrame, STEPS } from "@/lib/motion/templates/steps";
import { Ground, GroundDefs, TakeBg, TakeDefs, Person, WindowWithCode, Dims } from "../primitives";

type Props = { p: Params; t: number; uid: string; showDims: boolean };

const INTER = "@font-face{font-family:InterSteps;src:url(/fonts/Inter-latin.woff2) format('woff2');font-weight:100 900}"
  + "@font-face{font-family:InterSteps;src:url(/fonts/Inter-latin-ext.woff2) format('woff2');font-weight:100 900;unicode-range:U+0100-024F,U+1E00-1EFF}";
const FONT = "InterSteps, Inter, Helvetica, sans-serif";
const BURG = "#8E1F3F", CREAM = "#F3E9C6";
const HEAD = { kind: "box" as const, x: 360, y: 860, w: 360, h: 440, label: "kafa alanı · boş kalır" };

export function KeypadDrawing({ p, t, uid, showDims }: Props) {
  const f = keypadFrame(p, t);
  const face = f.placement === "face";
  const cy = face ? 700 : 85;          // panel: the band above the file tab (y 16–154); face: above the head
  const cardTop = 950;
  return (
    <>
      <defs>
        <style>{INTER}</style>
        <GroundDefs id={`g${uid}`} /><TakeDefs id={`tk${uid}`} />
        <clipPath id={`cc${uid}`}><rect x="40" y={cardTop} width="1000" height={1920 - cardTop + 60} rx="36" /></clipPath>
      </defs>
      {face ? (<><TakeBg id={`tk${uid}`} /><Person /></>) : (
        <>
          <Ground id={`g${uid}`} />
          <g transform="translate(56 232)"><WindowWithCode bandRow={3} bandOpacity={0} /></g>
          <g clipPath={`url(#cc${uid})`}><TakeBg id={`tk${uid}`} /><Person /></g>
        </>
      )}
      {f.keys.map((k, i) => {
        const cx = 356 + i * 184;
        const s = STEPS[i];
        const ink = k.fill > 0.5 ? "#141413" : "#fff";
        const circ = 2 * Math.PI * 74;
        return (
          <g key={i} opacity={k.opacity} transform={`translate(${cx} ${cy}) scale(${k.scale}) translate(${-cx} ${-cy})`}>
            <circle cx={cx} cy={cy} r="69" fill="#fff" fillOpacity="0.16" />
            <circle cx={cx} cy={cy} r="69" fill={CREAM} opacity={k.fill} />
            <circle cx={cx} cy={cy} r="74" fill="none" stroke={BURG} strokeWidth="7" strokeDasharray={`${circ * k.ring} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
            <text x={cx} y={cy + 10} textAnchor="middle" fontFamily={FONT} fontWeight="300" fontSize="66" fill={ink}>{s.n}</text>
            <text x={cx} y={cy + 46} textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="27" letterSpacing="4" fill={ink}>{s.verb}</text>
            {k.tick > 0 && <text x={cx + 52} y={cy - 40} textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="34" fill="#3fbf76" opacity={k.tick}>✓</text>}
          </g>
        );
      })}
      {showDims && <Dims lines={face
        ? [HEAD, { kind: "y", y: 630, label: "tuş bandı · kafanın üstünde" }]
        : [{ kind: "y", y: 168, label: "tuş bandı y 16–154 · dosya sekmesi ≥ 168", at: "below-right" }, { kind: "y", y: cardTop, label: `çekim kartı ${cardTop}` }]} />}
    </>
  );
}

export function LockDrawing({ p, t, uid, showDims }: Props) {
  const f = lockFrame(p, t);
  const fill = f.fill === "solid" ? BURG : `url(#lf${uid})`;
  const digit = (i: number, dy: number, op: number) => (
    <text key={`${i}-${dy}`} x="540" y={1060 + dy} textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="560" letterSpacing="-22"
      fill={fill} opacity={op}>{STEPS[i].n}</text>
  );
  return (
    <>
      <defs>
        <style>{INTER}</style>
        <TakeDefs id={`tk${uid}`} />
        {/* "Kareden renk": in the take the fill is the blurred frame tinted with the strongest background colour (his neon → deep red). */}
        <linearGradient id={`lf${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a1830" /><stop offset="1" stopColor="#3d0b14" />
        </linearGradient>
        <filter id={`lb${uid}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={f.blur} /></filter>
        <clipPath id={`lw${uid}`}><rect x="0" y="560" width="1080" height="560" /></clipPath>
      </defs>
      <TakeBg id={`tk${uid}`} />
      <text x="540" y="520" textAnchor="middle" fontFamily="Mono, monospace" fontSize="34" letterSpacing="7" fill="#fff" opacity={f.dateOpacity}>
        {STEPS[f.current].line}
      </text>
      <g clipPath={`url(#lw${uid})`} filter={`url(#lb${uid})`} opacity={f.numberOpacity}
        transform={`translate(540 ${840 + f.rise}) scale(${f.scale}) translate(-540 -840)`}>
        {f.previous >= 0 && digit(f.previous, -120 * f.roll, 1 - f.roll)}
        {digit(f.current, f.previous >= 0 ? 120 * (1 - f.roll) : 0, f.previous >= 0 ? f.roll : 1)}
      </g>
      <Person />
      {showDims && <Dims lines={[HEAD, { kind: "y", y: 1060, label: "rakam tabanı ≈ 1060 · kafa en çok %35 kapatır" }, { kind: "y", y: 540, label: "tarih satırı ≈ y 520 · kafanın üstünde", at: "below-right" }]} />}
    </>
  );
}
