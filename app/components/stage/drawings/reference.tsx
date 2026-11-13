// Drawings for the @viashaan reference templates (2026-11-12). Each maps its frame (lib/motion/templates/reference.ts)
// onto shapes in Reel pixels. Our colours replace his: burgundy and cream on dark, not his gold, yellow and lime.
// Head rule (creator, 2026-11-12, overlays-avoid-head): nothing in front of the head area, the face (x 380–700, y 900–1270)
// plus 65 % above and ±20 % at the sides, so x 316–764, y 660–1270 here. Text behind the head is the one exception.
import type { Params } from "@/lib/motion/registry";
import {
  behindHeadFrame, wordStreamFrame, typeActsFrame, faceHudFrame, outlinePathFrame, PATH_WORDS, handCircleFrame,
  rawEditedFrame, clipHoldFrame, cmdExpandFrame, wipeCompareFrame, keywordCtaFrame, CTA_KEYWORD, setupStepsFrame, STEPS,
} from "@/lib/motion/templates/reference";
import { Ground, GroundDefs, TakeBg, TakeDefs, Person, WindowWithCode, Dims } from "../primitives";

type Props = { p: Params; t: number; uid: string; showDims: boolean };

const BURG = "#8E1F3F";      // the channel accent (fills under cream text)
const ACC = "#D2557C";       // burgundy lifted for strokes and words on dark grounds
const CREAM = "#F2EFE8";
const INK = "#141413";
const INTER = 'Inter, "Helvetica Neue", Arial, sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';
const ANTON = "Anton, Impact, sans-serif";
const MONO = "Mono, ui-monospace, Menlo, monospace";

/** A Gaussian blur filter; `undefined` when the blur is too small to matter, so sharp frames stay cheap. */
function Blur({ id, s }: { id: string; s: number }) {
  return s > 0.3 ? <filter id={id} x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation={s} /></filter> : null;
}
const blurRef = (id: string, s: number) => (s > 0.3 ? `url(#${id})` : undefined);

/** The presenter's shapes in one colour (a matte or a silhouette). */
function Figure({ fill, transform }: { fill: string; transform?: string }) {
  return (
    <g transform={transform} fill={fill}>
      <rect x="150" y="1330" width="780" height="760" rx="330" />
      <rect x="482" y="1180" width="116" height="180" rx="40" />
      <ellipse cx="540" cy="1085" rx="160" ry="185" />
      <path d="M378 1010 C 378 880, 702 880, 702 1010 Z" />
      <rect x="372" y="996" width="336" height="30" rx="15" />
    </g>
  );
}

/** Four corner marks around a box, `len` long. */
function Corners({ x, y, w, h, len, stroke, width = 8 }: { x: number; y: number; w: number; h: number; len: number; stroke: string; width?: number }) {
  const d = [
    `M${x} ${y + len} V${y} H${x + len}`, `M${x + w - len} ${y} H${x + w} V${y + len}`,
    `M${x} ${y + h - len} V${y + h} H${x + len}`, `M${x + w - len} ${y + h} H${x + w} V${y + h - len}`,
  ].join(" ");
  return <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="square" />;
}

function Chip({ x, y, text, fill, color = CREAM, size = 28 }: { x: number; y: number; text: string; fill: string; color?: string; size?: number }) {
  const w = text.length * size * 0.66 + 32;
  return (
    <g>
      <rect x={x} y={y} width={w} height={size + 22} rx="8" fill={fill} />
      <text x={x + 16} y={y + size + 4} fontFamily={MONO} fontSize={size} fontWeight="700" fill={color}>{text}</text>
    </g>
  );
}

// ── Yazı ────────────────────────────────────────────────────────────────────────────

const RIBBON_BACK = "M 150 -60 C 20 260, 40 640, 330 800 C 520 900, 860 860, 1140 700";
const RIBBON_FRONT = "M -60 1560 C 300 1470, 720 1430, 1140 1330";

export function BehindHeadDrawing({ p, t, uid, showDims }: Props) {
  const f = behindHeadFrame(p, t);
  const anton = p.wordFont === "anton";
  const frame = p.fill === "frame";     // our rule: the letters carry the frame's blurred picture, tinted and lifted
  const wordFill = frame ? `url(#fp${uid})` : BURG;
  return (
    <>
      <defs>
        <Blur id={`bs${uid}`} s={f.smallBlur} /><Blur id={`bb${uid}`} s={f.bigBlur} /><TakeDefs id={`tk${uid}`} />
        <filter id={`pb${uid}`} x="0" y="0" width="100%" height="100%"><feGaussianBlur stdDeviation="22" /></filter>
        <pattern id={`fp${uid}`} width="1080" height="1920" patternUnits="userSpaceOnUse">
          <g filter={`url(#pb${uid})`}><TakeBg id={`tk${uid}`} /></g>
          <rect width="1080" height="1920" fill="#9fb2b6" opacity=".38" /><rect width="1080" height="1920" fill="#fff" opacity=".3" />
        </pattern>
      </defs>
      {frame ? <TakeBg id={`tk${uid}`} /> : <rect width="1080" height="1920" fill={CREAM} />}
      {!frame && <path d={RIBBON_BACK} pathLength={1} fill="none" stroke={BURG} strokeWidth="40" strokeLinecap="round"
        strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, f.ribbon * 1.4)} opacity=".9" />}
      <text x="540" y="600" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="600" fontSize="66" fill={frame ? CREAM : INK}
        opacity={f.smallOpacity} filter={blurRef(`bs${uid}`, f.smallBlur)}>sözcük kafamın</text>
      <g transform={`translate(540 960) scale(${f.bigScale}) translate(-540 -960)`} opacity={f.bigOpacity} filter={blurRef(`bb${uid}`, f.bigBlur)}>
        {anton
          ? <text x="540" y="1010" textAnchor="middle" fontFamily={ANTON} fontSize="200" fill={wordFill}>ARKASINDA</text>
          : <text x="540" y="1000" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="700" fontSize="176" fill={wordFill} letterSpacing="-4">arkasında?</text>}
      </g>
      {frame ? <Person /> : <Figure fill="#111" />}
      {!frame && <path d={RIBBON_FRONT} pathLength={1} fill="none" stroke={BURG} strokeWidth="40" strokeLinecap="round"
        strokeDasharray="1 1" strokeDashoffset={1 - Math.max(0, Math.min(1, f.ribbon * 1.4 - 0.4))} opacity=".9" />}
      {showDims && <Dims lines={[
        { kind: "y", y: 900, label: "kafa üstü ≈ 900 · sözcük bunun üstünden başlar", at: "above-right" },
        { kind: "y", y: 1010, label: "büyük sözcüğün tabanı ≈ 1000", at: "below-right" },
      ]} />}
    </>
  );
}

export function WordStreamDrawing({ p, t, uid, showDims }: Props) {
  const words = wordStreamFrame(p, t);
  const draw = (behind: boolean) => words.map((w, i) => w.behind === behind && w.opacity > 0.01 && (
    <text key={i} x={w.x} y={w.y} textAnchor="middle" opacity={w.opacity} filter={blurRef(`ws${uid}-${i}`, w.blur)}
      fontFamily={w.italic ? SERIF : INTER} fontStyle={w.italic ? "italic" : "normal"} fontWeight={w.italic ? 600 : 700}
      fontSize={72 * w.scale} fill={CREAM} letterSpacing="-1">{w.word}</text>
  ));
  return (
    <>
      <defs><TakeDefs id={`tk${uid}`} />{words.map((w, i) => <Blur key={i} id={`ws${uid}-${i}`} s={w.blur} />)}</defs>
      <TakeBg id={`tk${uid}`} />
      {draw(true)}
      <Person />
      {draw(false)}
      {showDims && <Dims lines={[{ kind: "box", x: 160, y: 520, w: 760, h: 430, label: "yörünge · önü baş alanının üstünde, arkası kafanın arkasında" }]} />}
    </>
  );
}

const LOOK_LABEL = { glow: "Inter 600 + parıltı", caps: "Anton, büyük harf", italic: "Playfair Display Italic 900" } as const;

export function TypeActsDrawing({ p, t, uid, showDims }: Props) {
  const f = typeActsFrame(p, t);
  const y = 560 + f.rise;     // baseline and its font label stay above the head area (y 660)
  return (
    <>
      <defs>
        <TakeDefs id={`tk${uid}`} /><Blur id={`ta${uid}`} s={f.blur} />
        <filter id={`gl${uid}`} x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
      </defs>
      <TakeBg id={`tk${uid}`} />
      <Person />
      <g opacity={f.opacity} filter={blurRef(`ta${uid}`, f.blur)}>
        {f.look === "glow" && (
          <>
            <text x="540" y={y} textAnchor="middle" fontFamily={INTER} fontWeight="600" fontSize="128" fill={ACC} filter={`url(#gl${uid})`}>parlayan</text>
            <text x="540" y={y} textAnchor="middle" fontFamily={INTER} fontWeight="600" fontSize="128" fill="#FFF4F7">parlayan</text>
          </>
        )}
        {f.look === "caps" && (
          <text x="540" y={y} textAnchor="middle" fontFamily={ANTON} fontSize="200" fill="#fff" stroke="rgba(0,0,0,.35)" strokeWidth="10" paintOrder="stroke">BÜYÜK HARF</text>
        )}
        {f.look === "italic" && (
          <text x="540" y={y} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="900" fontSize="150" fill={CREAM}>kalın italik</text>
        )}
        <text x="540" y={y + 46} textAnchor="middle" fontFamily={MONO} fontSize="28" fill="#cfcac0">{LOOK_LABEL[f.look]}</text>
      </g>
      {showDims && <Dims lines={[{ kind: "y", y: 660, label: "baş alanı üstü · y 660 · sözcük bunun üstünde", at: "below-right" }]} />}
    </>
  );
}

// ── Vurgu ───────────────────────────────────────────────────────────────────────────

export function FaceHudDrawing({ p, t, uid, showDims }: Props) {
  const f = faceHudFrame(p, t);
  const cx = 540 + f.boxX, cy = 1000, w = 470 * f.boxScale, h = 640 * f.boxScale;   // around the head area, not on the face
  return (
    <>
      <defs><TakeDefs id={`tk${uid}`} /><Blur id={`tx${uid}`} s={f.tenX.blur} /></defs>
      <TakeBg id={`tk${uid}`} />
      <g transform={`translate(${f.sway} 0)`}><Person /></g>
      <g opacity={f.boxOpacity}>
        <Corners x={cx - w / 2} y={cy - h / 2} w={w} h={h} len={62} stroke={ACC} />
        <text x={cx - w / 2 - 14} y={cy - h / 2 + 26} textAnchor="end" fontFamily={MONO} fontSize="30" fontWeight="700" fill={CREAM}>{f.label}</text>
        <text x={cx - w / 2 - 14} y={cy - h / 2 + 64} textAnchor="end" fontFamily={MONO} fontSize="30" fill={CREAM}>{f.coords}</text>
      </g>
      <g opacity={f.tenX.opacity} filter={blurRef(`tx${uid}`, f.tenX.blur)}>
        <text x="780" y="560" textAnchor="middle" fontFamily={MONO} fontWeight="800" fontSize="150" fill={ACC}>10x</text>
        <text x="780" y="606" textAnchor="middle" fontFamily={MONO} fontSize="34" fill={CREAM}>saniyede</text>
      </g>
      {showDims && <Dims lines={[{ kind: "box", x: 316, y: 660, w: 448, h: 610, label: "baş alanı · köşeler dışında, yüzde işaret yok" }]} />}
    </>
  );
}

const OUTLINE = "M 134 1920 L 134 1660 C 134 1460, 300 1316, 470 1306 L 470 1270 C 380 1230, 360 1150, 364 1080 C 368 940, 450 884, 540 884 C 630 884, 712 940, 716 1080 C 720 1150, 700 1230, 610 1270 L 610 1306 C 780 1316, 946 1460, 946 1660 L 946 1920";
const TEXT_PATH = "M 92 1900 L 92 1560 C 92 1400, 250 1300, 262 1150 L 262 860 C 262 600, 370 540, 540 540 C 710 540, 818 600, 818 860 L 818 1150 C 830 1300, 988 1400, 988 1560 L 988 1900";

export function OutlinePathDrawing({ p, t, uid, showDims }: Props) {
  const f = outlinePathFrame(p, t);
  return (
    <>
      <defs><TakeDefs id={`tk${uid}`} /><path id={`tp${uid}`} d={TEXT_PATH} /></defs>
      <TakeBg id={`tk${uid}`} />
      <Person />
      <g opacity={f.opacity}>
        <path d={OUTLINE} fill="none" stroke={CREAM} strokeWidth="5" strokeDasharray="14 10" strokeDashoffset={f.ants} opacity={f.outline} />
        <text fontFamily={INTER} fontWeight="700" fontSize="44" fill={CREAM}>
          <textPath href={`#tp${uid}`} startOffset="10%">
            {PATH_WORDS.slice(0, f.words).map((w, i) => {
              const serif = i >= PATH_WORDS.length - 2;
              const newest = i === f.words - 1;
              return (
                <tspan key={i} fontFamily={serif ? SERIF : INTER} fontStyle={serif ? "italic" : "normal"} fontSize={serif ? 66 : 44}
                  fontWeight={serif ? 600 : 700} fillOpacity={newest ? f.newest.opacity : 1}>{`${w} `}</tspan>
              );
            })}
          </textPath>
        </text>
      </g>
      {showDims && <Dims lines={[{ kind: "box", x: 316, y: 660, w: 448, h: 610, label: "baş alanı · yazı dışından geçer" }]} />}
    </>
  );
}

/** A hand-drawn ellipse: one stroke a little past a full turn, wobbling, tilted −3°. */
function handEllipse(cx: number, cy: number, rx: number, ry: number): string {
  const pts: string[] = [];
  const turns = 1.12, steps = 72, tilt = (-3 * Math.PI) / 180;
  for (let i = 0; i <= steps; i++) {
    const a = -2.4 + (i / steps) * turns * 2 * Math.PI;
    const r = 1 + 0.035 * Math.sin(2 * a + 0.7) + 0.018 * Math.sin(5 * a) + 0.05 * (i / steps);
    const x = rx * r * Math.cos(a), y = ry * r * Math.sin(a);
    pts.push(`${(cx + x * Math.cos(tilt) - y * Math.sin(tilt)).toFixed(1)} ${(cy + x * Math.sin(tilt) + y * Math.cos(tilt)).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
}
const CIRCLE = handEllipse(566, 886, 410, 70);

export function HandCircleDrawing({ p, t, uid, showDims }: Props) {
  const f = handCircleFrame(p, t);
  return (
    <>
      <defs><GroundDefs id={`g${uid}`} /></defs>
      <Ground id={`g${uid}`} />
      <g transform="translate(56 600)"><WindowWithCode bandRow={3} bandOpacity={0} /></g>
      <Chip x={56} y={520} text="VURGU BİZİM" fill="#2A2A2C" size={24} />
      <path d={CIRCLE} pathLength={1} fill="none" stroke={ACC} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="1 1" strokeDashoffset={1 - f.draw} opacity={f.opacity} />
      {showDims && <Dims lines={[{ kind: "box", x: 156, y: 816, w: 820, h: 140, label: "sözü geçen satır · ≈ 0,25 sn'de çizilir" }]} />}
    </>
  );
}

// ── Yerleşim ────────────────────────────────────────────────────────────────────────

/** One tile: the same take, raw (flat, bright room) or edited (our dark room, one word). */
function Tile({ x, raw, sway, word, wordBlur, uid, k }: { x: number; raw: boolean; sway: number; word: string; wordBlur: number; uid: string; k: string }) {
  const s = 440 / 1080;
  return (
    <g>
      <clipPath id={`tc${uid}${k}`}><rect x={x} y="540" width="440" height="782" rx="18" /></clipPath>
      <g clipPath={`url(#tc${uid}${k})`}>
        <g transform={`translate(${x} 540) scale(${s})`}>
          {raw
            ? <><rect width="1080" height="1920" fill="#cfccc6" /><rect x="0" y="700" width="1080" height="330" fill="#eef2f3" /><rect x="640" y="1180" width="300" height="420" fill="#b9b4ab" /></>
            : <TakeBg id={`tk${uid}`} />}
          <g transform={`translate(${sway} 0)`}><Person /></g>
          {raw && <rect width="1080" height="1920" fill="#fff" opacity=".12" />}
          {!raw && <text x="540" y="600" textAnchor="middle" fontFamily={INTER} fontWeight="700" fontSize="120" fill={CREAM}
            filter={blurRef(`rw${uid}`, wordBlur * 2.4)}>{word}</text>}
        </g>
      </g>
    </g>
  );
}

export function RawEditedDrawing({ p, t, uid, showDims }: Props) {
  const f = rawEditedFrame(p, t);
  return (
    <>
      <defs>
        <TakeDefs id={`tk${uid}`} /><Blur id={`rw${uid}`} s={f.wordBlur * 2.4} />
        <radialGradient id={`rg${uid}`} cx="50%" cy="0%" r="90%"><stop offset="0" stopColor="#3a1d26" /><stop offset=".75" stopColor="#141413" /></radialGradient>
      </defs>
      <rect width="1080" height="1920" fill={`url(#rg${uid})`} />
      <text x="540" y="262" textAnchor="middle" fontFamily={MONO} fontSize="26" letterSpacing="8" fill="#a8a49b">12.11.26</text>
      <text x="540" y="340" textAnchor="middle" fontFamily={INTER} fontWeight="500" fontSize="50" letterSpacing="6" fill={CREAM}>CLAUDE VİDEOMU</text>
      <text x="540" y="402" textAnchor="middle" fontFamily={INTER} fontWeight="800" fontSize="50" letterSpacing="6" fill={CREAM}>NASIL KURGULUYOR</text>
      <text x="540" y="470" textAnchor="middle" fontFamily={INTER} fontSize="34" fill="#87867F">+</text>
      <Tile x={80} raw sway={f.sway} word="" wordBlur={0} uid={uid} k="a" />
      <Tile x={560} raw={f.revealed} sway={f.sway} word={f.word} wordBlur={f.wordBlur} uid={uid} k="b" />
      <Chip x={190} y={508} text="HAM" fill="#1E1E1E" size={24} />
      <Chip x={642} y={508} text="KURGULU" fill={BURG} size={24} />
      {showDims && <Dims lines={[{ kind: "box", x: 80, y: 540, w: 920, h: 782, label: "iki 9:16 kare · aynı an, eşzamanlı" }]} />}
    </>
  );
}

export function ClipHoldDrawing({ p, t, uid, showDims }: Props) {
  const f = clipHoldFrame(p, t);
  const tall = p.clip === "tall";
  const xray = f.clipPhase > 0.5;
  const box = tall ? { x: 40, y: 880, w: 380, h: 676 } : { x: 40, y: 1330, w: 620, h: 349 };   // chest, clear of the head area
  const rect = { x: box.x, y: box.y, width: box.w, height: box.h };
  const hookY = box.y - 90;
  return (
    <>
      <defs>
        <radialGradient id={`wr${uid}`} cx="70%" cy="20%" r="90%"><stop offset="0" stopColor="#4a3326" /><stop offset=".8" stopColor="#140f0d" /></radialGradient>
        <clipPath id={`cl${uid}`}><rect {...rect} /></clipPath>
      </defs>
      <rect width="1080" height="1920" fill={`url(#wr${uid})`} />
      <g transform="translate(120 0)">
        <rect x="150" y="1330" width="780" height="760" rx="330" fill="#b49a78" />
        <rect x="482" y="1180" width="116" height="180" rx="40" fill="#a87d5f" />
        <g transform={`translate(0 ${f.headDrop}) rotate(${f.headTilt} 540 1270)`}>
          <ellipse cx="540" cy="1085" rx="160" ry="185" fill="#B98C6B" />
          <path d="M378 1040 C 360 860, 720 860, 702 1040 C 640 960, 440 960, 378 1040 Z" fill="#1d1612" />
          <g opacity={f.eyes}>
            <ellipse cx="485" cy="1095" rx="15" ry="9" fill={INK} /><ellipse cx="595" cy="1095" rx="15" ry="9" fill={INK} />
            <path d="M505 1180 Q 548 1200 585 1172" fill="none" stroke="#6b4632" strokeWidth="7" strokeLinecap="round" />
          </g>
        </g>
        <rect x="470" y="1600" width="150" height="230" rx="22" fill="#0d0d0d" transform="rotate(-12 545 1715)" />
      </g>
      <g opacity={f.hookOpacity}>
        <text x={box.x} y={hookY} fontFamily={INTER} fontWeight="800" fontSize="54" fill={CREAM}>BUNU NASIL</text>
        <text x={box.x} y={hookY + 60} fontFamily={INTER} fontWeight="800" fontSize="54" fill={ACC}>YAPARSIN…</text>
        <rect {...rect} fill={xray ? "#e9e6df" : "#1b1b1d"} stroke={CREAM} strokeWidth="3" />
        <g clipPath={`url(#cl${uid})`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={box.x + 30} y={box.y + (tall ? 70 : 40) + i * (box.h / 6.4)} width={(box.w - 60) * (0.5 + ((i * 37) % 40) / 100)} height={box.h / 14}
              rx="6" fill={xray ? "#2a2a2c" : i === 2 ? ACC : "#5a5a5e"} />
          ))}
        </g>
        {tall && <Chip x={box.x + 14} y={box.y + 14} text="ORİJİNAL" fill="rgba(20,20,19,.85)" size={20} />}
        {tall && <text x={box.x} y={box.y + box.h + 40} fontFamily={MONO} fontSize="24" fill="#cfcac0">fikir: @kaynak · bizim hâlimiz</text>}
      </g>
      <g transform={`translate(0 ${f.sheetY})`}>
        <rect width="1080" height="1920" fill="#1b1b1d" />
        <text x="540" y="620" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="500" fontSize="68" fill={CREAM}>✻ İyi akşamlar, Mert</text>
        <rect x="60" y="1500" width="960" height="150" rx="30" fill="#262628" />
        <text x="100" y="1590" fontFamily={INTER} fontSize="38" fill="#87867F">Claude ile sohbet et</text>
      </g>
      {showDims && <Dims lines={[{ kind: "box", ...box, label: tall ? "9:16 klip · ORİJİNAL etiketi" : "16:9 efekt klibi, göğsün önünde" }]} />}
    </>
  );
}

// ── Ekran ───────────────────────────────────────────────────────────────────────────

/** The result: a light block city with a route drawing itself (his /map-route demo, in 1080×1920 units). */
function RouteCity({ route }: { route: number }) {
  const blocks = [];
  for (let r = 0; r < 12; r++) for (let c = 0; c < 6; c++)
    blocks.push(<rect key={`${r}-${c}`} x={40 + c * 175} y={40 + r * 160} width="140" height="120" rx="10" fill="#fbfaf8" stroke="#d6d3cc" strokeWidth="6" />);
  return (
    <g>
      <rect width="1080" height="1920" fill="#e9e7e2" />
      {blocks}
      <path d="M -40 1050 C 300 980, 700 1180, 1120 1080" stroke="#bcd3e4" strokeWidth="90" fill="none" />
      <path d="M 300 1880 L 300 1340 L 650 1340 L 650 820 L 820 820 L 820 300" pathLength={1} fill="none" stroke="#3B7BE8" strokeWidth="34"
        strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - route} />
      <circle cx="300" cy="1880" r="34" fill="#3B7BE8" stroke="#fff" strokeWidth="10" />
    </g>
  );
}

export function CmdExpandDrawing({ p, t, uid, showDims }: Props) {
  const f = cmdExpandFrame(p, t);
  const c = f.card;
  return (
    <>
      <defs>
        <clipPath id={`cc${uid}`}><rect x={c.x} y={c.y} width={c.w} height={c.h} rx={c.rx} /></clipPath>
        <pattern id={`dt${uid}`} width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3.2" fill="#3a3a3c" /></pattern>
      </defs>
      <rect width="1080" height="1920" fill="#1b1b1d" />
      <rect x="380" y="70" width="320" height="64" rx="32" fill="#262628" />
      <rect x="544" y="76" width="150" height="52" rx="26" fill="#3a3a3c" />
      <text x="462" y="113" textAnchor="middle" fontFamily={INTER} fontSize="28" fill="#87867F">Sohbet</text>
      <text x="619" y="113" textAnchor="middle" fontFamily={INTER} fontSize="28" fill={CREAM}>Kod</text>
      {f.sent && (
        <g>
          <rect x="690" y="220" width="330" height="70" rx="35" fill="rgba(210,85,124,.18)" />
          <text x="855" y="267" textAnchor="middle" fontFamily={MONO} fontSize="32" fill={ACC}>/harita-rota</text>
        </g>
      )}
      {f.loader && <text x="60" y="390" fontFamily={INTER} fontSize="34" fill="#a8a49b"><tspan fill={ACC}>✻ </tspan>harita-rota ile çiziliyor…</text>}
      <g clipPath={`url(#cc${uid})`} opacity={f.cardOpacity}>
        <g transform={`translate(${c.x} ${c.y}) scale(${c.w / 1080} ${c.h / 1920})`}><RouteCity route={f.route} /></g>
        <rect x={c.x} y={c.y} width={c.w} height={c.h} fill={`url(#dt${uid})`} opacity={f.dither} />
        <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="#1b1b1d" opacity={f.dither * 0.6} />
      </g>
      {c.w < 1000 && (
        <g>
          <rect x="40" y="1620" width="1000" height="200" rx="34" fill="#262628" />
          {!f.sent && <rect x="70" y="1645" width="170" height="74" rx="12" fill="#333336" />}
          {!f.sent && <text x="88" y="1690" fontFamily={INTER} fontSize="22" fill="#a8a49b">Rota · 4,2 km</text>}
          <text x="70" y="1785" fontFamily={MONO} fontSize="40" fill={CREAM}>{f.sent ? "" : f.typed}<tspan fill={ACC}>|</tspan></text>
        </g>
      )}
      {showDims && <Dims lines={[{ kind: "box", x: 300, y: 430, w: 480, h: 853, label: "sohbet içi kart · ≈ 0,15 sn'de tam ekrana" }]} />}
    </>
  );
}

// ── Geçiş ───────────────────────────────────────────────────────────────────────────

export function WipeCompareDrawing({ p, t, uid, showDims }: Props) {
  const f = wipeCompareFrame(p, t);
  return (
    <>
      <defs>
        <TakeDefs id={`tk${uid}`} />
        <filter id={`fl${uid}`} colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0.12" /><feComponentTransfer><feFuncR type="linear" slope=".85" intercept=".1" /><feFuncG type="linear" slope=".85" intercept=".1" /><feFuncB type="linear" slope=".85" intercept=".12" /></feComponentTransfer></filter>
        <filter id={`gr${uid}`} colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="1.18" intercept="-.04" /><feFuncG type="linear" slope="1.05" intercept="-.05" /><feFuncB type="linear" slope=".92" intercept="-.04" /></feComponentTransfer></filter>
        <clipPath id={`wc${uid}`}><rect x="0" y="0" width={Math.max(0, f.lineX)} height="1920" /></clipPath>
      </defs>
      <g filter={`url(#fl${uid})`}><TakeBg id={`tk${uid}`} /><Person /></g>
      <g clipPath={`url(#wc${uid})`} filter={`url(#gr${uid})`}><TakeBg id={`tk${uid}`} /><Person /></g>
      <rect x={f.lineX - 3} y="0" width="6" height="1920" fill="#fff" opacity={f.lineOpacity} />
      <rect x={f.lineX - 40} y="0" width="2" height="1920" fill="#fff" opacity={f.lineOpacity * 0.5} />
      {f.after ? <Chip x={40} y={70} text="SONRA" fill={BURG} /> : <Chip x={40} y={70} text="ÖNCE" fill="rgba(20,20,19,.85)" />}
      {showDims && <Dims lines={[{ kind: "y", y: 960, label: "perde soldan sağa · ≈ 0,4 sn", at: "above-right" }]} />}
    </>
  );
}

// ── Ekleme ──────────────────────────────────────────────────────────────────────────

export function KeywordCtaDrawing({ p, t, uid, showDims }: Props) {
  const f = keywordCtaFrame(p, t);
  if (p.style === "metal") {
    const arc = "yorum yaz".slice(0, f.curve);
    return (
      <>
        <defs>
          <TakeDefs id={`tk${uid}`} />
          <path id={`ar${uid}`} d="M 330 450 Q 540 350 750 450" />
          <linearGradient id={`mt${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F6D3DD" /><stop offset=".45" stopColor="#C9456B" /><stop offset=".55" stopColor="#6E1530" /><stop offset="1" stopColor="#B8395C" />
          </linearGradient>
          <linearGradient id={`sh${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset={Math.max(0, f.shine - 0.12)} stopColor="#fff" stopOpacity="0" /><stop offset={f.shine} stopColor="#fff" stopOpacity=".75" /><stop offset={Math.min(1, f.shine + 0.12)} stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <TakeBg id={`tk${uid}`} />
        <Person />
        <g opacity={f.opacity}>
          <text fontFamily={INTER} fontWeight="700" fontSize="56" fill={CREAM} textAnchor="middle"><textPath href={`#ar${uid}`} startOffset="50%">{arc}</textPath></text>
          {[...CTA_KEYWORD].map((ch, i) => (
            <g key={i} opacity={f.letters[i]} transform={`translate(0 ${(1 - f.letters[i]) * -120})`}>
              <text x={375 + i * 110} y="590" textAnchor="middle" fontFamily={ANTON} fontSize="190" fill={`url(#mt${uid})`} stroke="#3a0a18" strokeWidth="4" paintOrder="stroke">{ch}</text>
              <text x={375 + i * 110} y="590" textAnchor="middle" fontFamily={ANTON} fontSize="190" fill={`url(#sh${uid})`}>{ch}</text>
            </g>
          ))}
          <path d="M 860 470 C 930 510, 950 570, 920 630 M 920 630 l -34 -14 M 920 630 l 8 -36" fill="none" stroke={CREAM} strokeWidth="6" strokeLinecap="round" opacity={f.subOpacity} />
          <g opacity={f.subOpacity}>
            <text x="540" y="1380" textAnchor="middle" fontFamily={INTER} fontWeight="700" fontSize="42" fill={CREAM}>yaz, linki göndereyim:</text>
            <text x="540" y="1446" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="600" fontSize="62" fill={CREAM}>kurulum rehberi.</text>
          </g>
        </g>
        {showDims && <Dims lines={[{ kind: "y", y: 660, label: "baş alanı üstü · harfler bunun üstünde", at: "below-right" }]} />}
      </>
    );
  }
  const bw = 470 * f.brackets;
  return (
    <>
      <defs><GroundDefs id={`g${uid}`} /></defs>
      <Ground id={`g${uid}`} />
      <text x="540" y="560" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="500" fontSize="68" fill={CREAM}>✻ İyi akşamlar, Mert</text>
      <rect x="40" y="1120" width="1000" height="230" rx="34" fill="#262628" />
      <g transform={`translate(${(1 - f.chip) * 900} 0)`}>
        <rect x="76" y="1150" width="250" height="110" rx="14" fill="#333336" />
        <text x="96" y="1200" fontFamily={MONO} fontSize="26" fill={CREAM}>prompt.md</text>
        <text x="96" y="1238" fontFamily={MONO} fontSize="20" fill="#a8a49b">YAPIŞTIRILDI</text>
      </g>
      <text x="80" y="1320" fontFamily={INTER} fontSize="32" fill="#87867F">Claude ile sohbet et</text>
      <rect width="1080" height="1920" fill="#000" opacity={f.dim} />
      <g opacity={f.opacity * Math.min(1, f.dim / 0.35)}>
        <text x="540" y={820 + (1 - f.line1) * 60} textAnchor="middle" fontFamily={INTER} fontWeight="800" fontSize="92" fill={CREAM} opacity={f.line1}>YORUM YAZ</text>
        <text x="540" y={975 + (1 - f.line2) * 60} textAnchor="middle" fontFamily={INTER} fontWeight="900" fontSize="150" letterSpacing="4" fill={ACC} opacity={f.line2}>{CTA_KEYWORD}</text>
        <text x="540" y="1040" textAnchor="middle" fontFamily={MONO} fontSize="30" letterSpacing="6" fill={CREAM} opacity={f.line2}>LİNKİ GÖNDEREYİM</text>
        {f.brackets > 0.02 && <Corners x={540 - bw / 2} y={850} w={bw} h={150} len={36} stroke={ACC} width={7} />}
      </g>
      {showDims && <Dims lines={[{ kind: "box", x: 40, y: 1120, w: 1000, h: 230, label: "teslim edilen şey ekranda belirdiği an" }]} />}
    </>
  );
}

/** The phone's screen for each setup step (schematic UI, not a real capture). */
function StepScreen({ step }: { step: number }) {
  const row = (y: number, label: string, on?: boolean, hi?: boolean) => (
    <g key={label}>
      <rect x="340" y={y} width="400" height="80" rx="16" fill={hi ? "rgba(210,85,124,.2)" : "#262628"} stroke={hi ? ACC : "none"} strokeWidth="3" />
      <text x="364" y={y + 50} fontFamily={INTER} fontSize="28" fill={CREAM}>{label}</text>
      {on !== undefined && <><rect x="660" y={y + 24} width="60" height="34" rx="17" fill={on ? "#6B8F71" : "#3a3a3c"} /><circle cx={on ? 703 : 677} cy={y + 41} r="13" fill="#fff" /></>}
    </g>
  );
  if (step === 0) return <g><text x="540" y="560" textAnchor="middle" fontFamily={INTER} fontWeight="700" fontSize="32" fill={CREAM}>Bağlayıcılar</text>{row(600, "Bağlayıcı keşfi", true)}{row(700, "Bağlayıcılara göz at")}</g>;
  if (step === 1) return <g><text x="540" y="560" textAnchor="middle" fontFamily={INTER} fontWeight="700" fontSize="32" fill={CREAM}>Bağlayıcılar</text>{row(600, "Göz at")}{row(700, "Özel bağlayıcı ekle", undefined, true)}</g>;
  if (step === 2) return <g><text x="540" y="560" textAnchor="middle" fontFamily={INTER} fontWeight="700" fontSize="32" fill={CREAM}>Özel bağlayıcı</text>{row(600, "Ad: Örnek")}<rect x="340" y="700" width="400" height="80" rx="16" fill="#1b1b1d" stroke={ACC} strokeWidth="3" /><text x="364" y="750" fontFamily={MONO} fontSize="24" fill={CREAM}>mcp.ornek.dev/mcp</text></g>;
  return <g><text x="540" y="560" textAnchor="middle" fontFamily={INTER} fontWeight="700" fontSize="32" fill={CREAM}>Bağlayıcılar</text>{row(600, "Bağlayıcı keşfi", true)}{row(700, "Örnek ✓", true, true)}</g>;
}

export function SetupStepsDrawing({ p, t, showDims }: Props) {
  const f = setupStepsFrame(p, t);
  const last = f.step === f.count - 1;
  const label = last && f.count < STEPS.length ? STEPS[STEPS.length - 1] : STEPS[f.step];
  const screen = last ? 3 : f.step;
  return (
    <>
      <rect width="1080" height="1920" fill="#121214" />
      <g opacity={f.opacity}>
        <text x="540" y="250" textAnchor="middle" fontFamily={INTER} fontWeight="800" fontSize="78" fill={CREAM}>{f.cta ? `Yorum yaz “${CTA_KEYWORD}”` : "Nasıl kurulur"}</text>
        <rect x={f.cta ? 330 : 350} y="285" width={f.cta ? 420 : 380} height="58" rx="29" fill={BURG} />
        <text x="540" y="325" textAnchor="middle" fontFamily={INTER} fontWeight="700" fontSize="32" fill={CREAM}>{f.cta ? "kurulum linki için" : "1 dakikada kurulum"}</text>
        <g opacity={f.stepIn} transform={`translate(${(1 - f.stepIn) * 40} 0)`}>
          <circle cx="170" cy="412" r="26" fill={ACC} />
          <text x="170" y="423" textAnchor="middle" fontFamily={INTER} fontWeight="800" fontSize="30" fill={INK}>{f.step + 1}</text>
          <text x="214" y="424" fontFamily={INTER} fontWeight="700" fontSize="40" fill={CREAM}>{label}</text>
        </g>
        <rect x="300" y="470" width="480" height="980" rx="64" fill="#0c0c0d" stroke="#3a3a3c" strokeWidth="6" />
        <rect x="318" y="488" width="444" height="944" rx="48" fill="#1b1b1d" />
        <g opacity={f.stepIn}><StepScreen step={screen} /></g>
      </g>
      {showDims && <Dims lines={[{ kind: "box", x: 300, y: 470, w: 480, h: 980, label: "telefon · her adımda ekran değişir" }]} />}
    </>
  );
}
