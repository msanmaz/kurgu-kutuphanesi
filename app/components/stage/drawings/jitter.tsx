// Drawings for the five Jitter-template edits (templates/jitter.ts), 2026-11-13. Basic drawings of each mechanic, as on every card;
// the real-take tests are linked from each card. Head rule (creator, 2026-11-12): nothing is drawn over the head area; words behind it
// are drawn before the presenter.
import type { Params } from "@/lib/motion/registry";
import {
  halftoneFrame, wheelFrame, quoteFrame, sessionFrame, risoFrame,
  HALFTONE_STEPS, SESSION_GRID_WORD,
} from "@/lib/motion/templates/jitter";
import { DIGITS, DIGIT_CELL } from "@/lib/motion/templates/halftoneDigits";
import { Ground, GroundDefs, TakeBg, TakeDefs, Person, Dims } from "../primitives";
import type { DimLine } from "../primitives";

type Props = { p: Params; t: number; uid: string; showDims: boolean };

const INTER = "@font-face{font-family:InterJ;src:url(/fonts/Inter-latin.woff2) format('woff2');font-weight:100 900}"
  + "@font-face{font-family:InterJ;src:url(/fonts/Inter-latin-ext.woff2) format('woff2');font-weight:100 900;unicode-range:U+0100-024F,U+1E00-1EFF}";
const SANS = "InterJ, Inter, Helvetica, sans-serif";
const MONO = "Mono, monospace";
const SERIF = "'Playfair Display', serif";
const BURG = "#8E1F3F", ROSE = "#D2557C", PAPER = "#F1EEE6";
const HEAD: DimLine = { kind: "box", x: 360, y: 860, w: 360, h: 440, label: "kafa alanı · üstüne yazı yok" };
/** Room and presenter: the same take every card uses. */
const Scene = ({ id }: { id: string }) => (<><TakeBg id={id} /><Person /></>);
/** Rough width of a Turkish line in Inter 800 (0.58 em a character), to fit long rows. */
const fit = (text: string, size: number, max: number) => Math.min(size, max / (text.length * 0.58));
/** Mix two #rrggbb colours (k 0 → a, 1 → b): the crossfade of the wheel's middle word. */
const mix = (a: string, b: string, k: number) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - k) + parseInt(b.slice(i, i + 2), 16) * k).toString(16).padStart(2, "0")).join("");

function DotGround({ uid }: { uid: string }) {
  return (
    <>
      <pattern id={`dp${uid}`} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="3.2" fill="#2a2827" /></pattern>
      <rect width="1080" height="1920" fill="#121211" />
      <rect width="1080" height="1920" fill={`url(#dp${uid})`} />
    </>
  );
}

/** Burgundy duotone: grayscale, then dark → near black and light → burgundy-rose. */
function DuoFilter({ id, blur = 0 }: { id: string; blur?: number }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0.05 0.80" /><feFuncG type="table" tableValues="0.03 0.18" /><feFuncB type="table" tableValues="0.04 0.33" />
      </feComponentTransfer>
      {blur > 0 && <feGaussianBlur stdDeviation={blur} />}
    </filter>
  );
}

// ── Yarım ton adım ───────────────────────────────────────────────────────────────

export function HalftoneDrawing({ p, t, uid, showDims }: Props) {
  const f = halftoneFrame(p, t);
  const poster = f.look === "poster";
  const cells = DIGITS[f.glyph] ?? [];
  const R = DIGIT_CELL * 0.43;
  const dots = (
    <g opacity={f.opacity} transform={poster ? undefined : "translate(540 120) scale(0.82) translate(-540 -120)"}>
      {cells.map(([x, y], i) => {
        const r = R * f.dot(y);
        return r > 0.3 ? <circle key={i} cx={x} cy={y} r={r} fill={poster ? `url(#hg${uid})` : BURG} /> : null;
      })}
    </g>
  );
  const name = HALFTONE_STEPS[f.step];
  const words = name.split(" ");
  const mid = Math.ceil(words.length / 2);
  return (
    <>
      <defs>
        <style>{INTER}</style>
        <TakeDefs id={`tk${uid}`} />
        <linearGradient id={`hg${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="0" y2="840">
          <stop offset="0" stopColor={ROSE} /><stop offset="1" stopColor={BURG} />
        </linearGradient>
      </defs>
      {poster ? <DotGround uid={uid} /> : <TakeBg id={`tk${uid}`} />}
      {dots}
      <Person />
      {poster ? (
        <g opacity={f.labelOpacity} fontFamily={SANS} fontWeight="800">
          <text x="56" y="112" fontSize="46" fill="#F4EFE6">ADIM {f.step + 1} / 3</text>
          <text x="56" y="640" fontSize="54" fill={ROSE}>{words.slice(0, mid).join(" ")}</text>
          <text x="56" y="700" fontSize="54" fill={ROSE}>{words.slice(mid).join(" ")}</text>
          <text x="1024" y="96" fontSize="30" fill="#b9b4aa" textAnchor="end">YAPAY ZEKALI</text>
          <text x="1024" y="132" fontSize="30" fill="#b9b4aa" textAnchor="end">YAZILIM MÜLAKATI</text>
        </g>
      ) : (
        <text x="540" y="96" textAnchor="middle" fontFamily={MONO} fontSize="34" letterSpacing="7" fill="#fff" opacity={f.labelOpacity}>
          ADIM {f.step + 1} · {name}
        </text>
      )}
      {f.rolling && <text x="1024" y="1880" textAnchor="end" fontFamily={MONO} fontSize="26" fill="#b9b4aa">sayaç · "Üç…"</text>}
      {showDims && <Dims lines={[HEAD, { kind: "box", x: 290, y: 120, w: 600, h: 720, label: "rakam · 24 px nokta ızgarası" }]} />}
    </>
  );
}

// ── Bulanık kelime çarkı ─────────────────────────────────────────────────────────

export function WheelDrawing({ p, t, uid, showDims }: Props) {
  const f = wheelFrame(p, t);
  const card = f.look === "card";
  const dd = !!f.title;
  const size = dd ? 76 : 130, row = dd ? 120 : 150, x0 = dd ? 190 : 200, cy = dd ? 545 : 520;
  const cardTop = 950;
  const wheel = (
    <g fontFamily={SANS} fontWeight="800" letterSpacing="-2">
      {f.rows.map((r, i) => {
        const label = (r.tick ? "✓ " : "") + r.word;
        const s = fit(label, size * r.scale, 1040 - x0);
        return (
          <g key={r.word} opacity={r.opacity} filter={r.blur > 0.2 ? `url(#wb${uid}-${i})` : undefined}
            transform={`translate(${x0 + 10 * Math.abs(r.dy)} ${cy + r.dy * row}) rotate(${r.tilt})`}>
            <text x="0" y={s * 0.36} fontSize={s} fill={mix("#a9a49b", "#ffffff", r.white)}>
              {r.tick && <tspan fill={ROSE}>✓ </tspan>}{r.word}
            </text>
          </g>
        );
      })}
      <text x={x0 - size * 1.15} y={cy + size * 0.36} fontSize={size} fill={ROSE}>→</text>
    </g>
  );
  return (
    <>
      <defs>
        <style>{INTER}</style>
        <GroundDefs id={`g${uid}`} /><TakeDefs id={`tk${uid}`} />
        {f.rows.map((r, i) => (
          <filter key={i} id={`wb${uid}-${i}`} x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation={r.blur} /></filter>
        ))}
        <clipPath id={`cc${uid}`}><rect x="40" y={cardTop} width="1000" height={1920 - cardTop + 60} rx="40" /></clipPath>
      </defs>
      {card ? (
        <>
          <Ground id={`g${uid}`} />
          {dd && (
            <g>
              <text x="60" y="140" fontFamily={MONO} fontSize="28" letterSpacing="6" fill="#b9b4aa">DOORDASH</text>
              <text x="60" y="240" fontFamily="Anton" fontSize="84" fill="#fff">{f.title}</text>
              <text x="60" y="930" fontFamily={MONO} fontSize="22" letterSpacing="3" fill="#b9b4aa">careers.doordash.com · 19 Mart 2026</text>
            </g>
          )}
          {wheel}
          <g clipPath={`url(#cc${uid})`}><Scene id={`tk${uid}`} /></g>
        </>
      ) : (
        <><DotGround uid={uid} />{wheel}<Person /></>
      )}
      {showDims && <Dims lines={card ? [{ kind: "y", y: cardTop, label: `çekim kartı ${cardTop}` }, { kind: "y", y: cy, label: "çarkın ortası · ok", at: "above-right" }]
        : [HEAD, { kind: "y", y: cy, label: "çarkın ortası · kafanın arkasında", at: "above-right" }]} />}
    </>
  );
}

// ── Alıntı kartı ─────────────────────────────────────────────────────────────────

/** Greedy line break with the rough Inter width. */
function lines(words: readonly string[], size: number, max: number) {
  const out: { w: string; i: number }[][] = [[]];
  let len = 0;
  words.forEach((w, i) => {
    const add = (w.length + (len ? 1 : 0)) * 0.55 * size;
    if (len && len + add > max) { out.push([]); len = 0; }
    out[out.length - 1].push({ w, i });
    len += (w.length + (len ? 1 : 0)) * 0.55 * size;
  });
  return out;
}

export function QuoteDrawing({ p, t, uid, showDims }: Props) {
  const f = quoteFrame(p, t);
  const big = f.words.length < 8;
  const size = big ? 96 : 58;
  const ls = lines(f.words, size, 860);
  const trLines = f.tr ? lines(f.tr.split(" "), 34, 880) : [];
  const textH = 92 + ls.length * size * 1.06 + (trLines.length ? 18 + trLines.length * 42 : 0);
  const cardH = textH + 110 * f.grow;                              // the layout animation: the card grows for the attribution
  const baseY = f.look === "duotone" ? 990 : f.look === "top" ? 150 : 210;
  const cy = baseY + f.cardOffset;
  const pull = f.pull, px = lerp0(0, 162, f.duo), py = lerp0(0, 52, f.duo);
  const scene = (filter?: string) => <g filter={filter}><Scene id={`tk${uid}`} /></g>;
  return (
    <>
      <defs>
        <style>{INTER}</style>
        <GroundDefs id={`g${uid}`} /><TakeDefs id={`tk${uid}`} />
        <DuoFilter id={`du${uid}`} /><DuoFilter id={`db${uid}`} blur={26} />
        <filter id={`gl${uid}`}><feGaussianBlur stdDeviation="30" /></filter>
        <clipPath id={`ph${uid}`}><rect x={px} y={py} width={1080 * pull} height={1920 * pull} rx={28 * f.duo} /></clipPath>
        <clipPath id={`qc${uid}`}><rect x="40" y={cy} width="1000" height={cardH} rx="40" /></clipPath>
        <clipPath id={`cc${uid}`}><rect x="40" y="950" width="1000" height="1030" rx="40" /></clipPath>
      </defs>
      {f.look === "card" ? (
        <><Ground id={`g${uid}`} /><g clipPath={`url(#cc${uid})`}><Scene id={`tk${uid}`} /></g></>
      ) : (
        <>
          {scene()}
          {f.duo > 0 && (
            <g opacity={f.duo}>
              <g transform="translate(540 960) scale(1.12) translate(-540 -960)">{scene(`url(#db${uid})`)}</g>
              <g clipPath={`url(#ph${uid})`}><g transform={`translate(${px} ${py}) scale(${pull})`}>{scene(`url(#du${uid})`)}</g></g>
            </g>
          )}
        </>
      )}
      <g opacity={f.cardOpacity}>
        <g clipPath={`url(#qc${uid})`}>
          <g filter={`url(#gl${uid})`}>{f.look === "card" ? <Ground id={`g${uid}`} /> : scene(f.duo > 0.5 ? `url(#du${uid})` : undefined)}</g>
          <rect x="40" y={cy} width="1000" height={cardH} fill="rgba(20,16,17,.36)" />
        </g>
        <rect x="40.5" y={cy + 0.5} width="999" height={cardH - 1} rx="40" fill="none" stroke="rgba(255,255,255,.16)" />
        <g fontFamily={SANS} fontWeight="800" fontSize={size} letterSpacing={-size * 0.025}>
          {ls.map((line, li) => (
            <text key={li} x="94" y={cy + 46 + size * 0.86 + li * size * 1.06} fill="#fff">
              {line.map(({ w, i }, k) => (
                <tspan key={i} fillOpacity={i < f.shown ? 1 : 0}>
                  {i === 0 && <tspan fill={ROSE}>“</tspan>}{w}{i === f.words.length - 1 && <tspan fill={ROSE}>”</tspan>}{k < line.length - 1 ? " " : ""}
                </tspan>
              ))}
            </text>
          ))}
        </g>
        {trLines.map((line, li) => (
          <text key={`tr${li}`} x="94" y={cy + 46 + ls.length * size * 1.06 + 50 + li * 42} fontFamily={SANS} fontWeight="600" fontSize="34" fill="#e9e3dc" opacity={f.trOpacity}>
            {line.map((x) => x.w).join(" ")}
          </text>
        ))}
        <g transform={`translate(94 ${cy + textH + 6})`} opacity={f.grow > 0.6 ? 1 : 0}>
          {f.avatar && f.avatarOn && (<><rect width="64" height="64" rx="12" fill="#6b6662" /><circle cx="32" cy="30" r="15" fill="#c9c2bb" /><rect x="14" y="48" width="36" height="16" rx="8" fill="#c9c2bb" /></>)}
          {f.who.map((line, i) => (
            <text key={i} x={f.avatar ? 84 : 0} y={26 + i * 32} fontFamily={MONO} fontSize="24" letterSpacing="3" fill="#e9e6dd">{line}</text>
          ))}
        </g>
      </g>
      {showDims && <Dims lines={f.look === "card" ? [{ kind: "y", y: 950, label: "çekim kartı 950" }] : [HEAD, { kind: "y", y: baseY, label: "cam kart üstü", at: "above-right" }]} />}
    </>
  );
}
const lerp0 = (a: number, b: number, k: number) => a + (b - a) * k;

// ── Seans tamam CTA ──────────────────────────────────────────────────────────────

function BubbleIcon({ x, y }: { x: number; y: number }) {
  const w = 190, h = 120;
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke="#fff" strokeWidth="4">
      {[0, 1, 2, 3].map((i) => <rect key={i} x={6 + i * 13} y={6 + i * 13} width={w - 12 - i * 26} height={h - 12 - i * 26} rx={(h - 12 - i * 26) / 2} />)}
      <path d={`M${w * 0.24} ${h - 8} L${w * 0.16} ${h + 30} L${w * 0.4} ${h - 8}`} strokeLinejoin="round" />
    </g>
  );
}

export function SessionDrawing({ p, t, uid, showDims }: Props) {
  const f = sessionFrame(p, t);
  const person = (dx: number, op: number, key: string) => (
    <g key={key} opacity={op} transform={`translate(${dx} 0)`}><Person /></g>
  );
  const points: [number, number, "up" | "down"][] = [[320, 840, "up"], [760, 840, "up"], [320, 1330, "down"], [760, 1330, "down"], [170, 520, "up"], [900, 600, "up"]];
  const duotone = (withPerson: boolean) => (
    <g filter={`url(#du${uid})`}>
      <TakeBg id={`tk${uid}`} />
      {withPerson && f.trail && [person(f.sway - 26, 0.22, "a"), person(f.sway - 13, 0.35, "b")]}
      {withPerson && person(f.sway, 1, "c")}
    </g>
  );
  return (
    <>
      <defs>
        <style>{INTER}</style>
        <TakeDefs id={`tk${uid}`} /><DuoFilter id={`du${uid}`} />
        <filter id={`gr${uid}`}><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncR type="linear" slope="0.7" /><feFuncG type="linear" slope="0.7" /><feFuncB type="linear" slope="0.7" /></feComponentTransfer></filter>
      </defs>
      <rect width="1080" height="1920" fill="#000" />
      {f.phase === "photo" && duotone(true)}
      {f.phase === "grid" && (
        <>
          {duotone(false)}
          <g fontFamily={SANS} fontWeight="900" fontSize="100" letterSpacing="-4" fill="#fff">
            {[-70, 500, 1070].flatMap((x) => [70, 940].map((y0) => f.gridRows.map((len, r) => (
              <text key={`${x}-${y0}-${r}`} x={x} y={y0 + r * 98}>{SESSION_GRID_WORD.slice(0, len)}</text>
            ))))}
          </g>
          <g filter={`url(#du${uid})`}><Person /></g>
        </>
      )}
      {f.phase === "track" && (
        <>
          <g filter={`url(#gr${uid})`}><Scene id={`tk${uid}`} /></g>
          <text x="540" y="260" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="112" fill="#fff">Yoruma</text>
          <text x="540" y="380" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="112" fill="#fff">MÜLAKAT yaz.</text>
          {points.map(([x, y, side], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="7" fill="#fff" />
              <text x={Math.max(12, x - 100)} y={side === "up" ? y - 22 : y + 40} fontFamily={MONO} fontSize="22" fill="#fff">x: {x} y: {y}</text>
            </g>
          ))}
          <circle cx="170" cy="520" r="150" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="900" cy="600" r="110" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeDasharray="6 6" />
        </>
      )}
      {f.phase === "poster" && (
        <>
          {duotone(true)}
          <text x="540" y="96" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="30" fill="#fff">@devmert7</text>
          <g fontFamily={SANS} fontWeight="800" fontSize="132" letterSpacing="-4">
            {f.words >= 1 && <text x="540" y="250" textAnchor="middle" fill="#fff">Yoruma</text>}
            {f.words >= 2 && (<>
              <rect x="90" y="285" width="620" height="150" rx="12" fill="#fff" />
              <text x="400" y="410" textAnchor="middle" fill={BURG}>MÜLAKAT</text>
              <text x="890" y="410" textAnchor="middle" fill="#fff">yaz.</text>
            </>)}
          </g>
          {f.sub && <text x="540" y="500" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="40" fill="#fff">DM&apos;den atayım.</text>}
          <g fontFamily={MONO} fontSize="31" fill="#fff" letterSpacing="1">
            {f.stats.map((s, i) => <text key={i} x="60" y={1740 + i * 44} xmlSpace="preserve">{s}</text>)}
          </g>
          <BubbleIcon x={830} y={1720} />
        </>
      )}
      {showDims && <Dims lines={[HEAD, { kind: "y", y: 1700, label: "istatistik bloğu · kafanın altında", at: "above-right" }]} />}
    </>
  );
}

// ── Riso baskı ───────────────────────────────────────────────────────────────────

function RisoFilter({ id, seed, ink, steps }: { id: string; seed: number; ink: [number, number, number]; steps: number[] }) {
  const table = (c: number) => steps.map((s) => (s === 0 ? ink[c] : [0.945, 0.933, 0.902][c]).toFixed(3)).join(" ");
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="0" result="g" />
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} result="n" />
      <feColorMatrix in="n" type="saturate" values="0" result="ng" />
      <feComposite in="g" in2="ng" operator="arithmetic" k1="0" k2="1.25" k3="0.55" k4="-0.3" result="d" />
      <feComponentTransfer in="d">
        <feFuncR type="discrete" tableValues={table(0)} /><feFuncG type="discrete" tableValues={table(1)} /><feFuncB type="discrete" tableValues={table(2)} />
      </feComponentTransfer>
    </filter>
  );
}

export function RisoDrawing({ p, t, uid, showDims }: Props) {
  const f = risoFrame(p, t);
  const kapak = f.headline === "kapak";
  const l1 = kapak ? "YAPAY ZEKALI" : "NEREDEN", l2 = kapak ? "MÜLAKAT" : "BAŞLASAM?";
  const wall = (<><rect width="1080" height="1920" fill="#dcd7cf" /><rect x="0" y="1010" width="1080" height="40" fill="#000" opacity=".25" /></>);
  return (
    <>
      <defs>
        <RisoFilter id={`ri${uid}`} seed={f.seed} ink={[0.09, 0.09, 0.09]} steps={[0, 0, 0, 1, 1]} />
        <RisoFilter id={`rr${uid}`} seed={f.seed + 31} ink={[0.7, 0.15, 0.31]} steps={[0, 0, 0, 1, 1]} />
      </defs>
      <rect width="1080" height="1920" fill={PAPER} />
      <g filter={`url(#ri${uid})`}>{wall}<g transform={`translate(${f.sway} 0)`}><Person /></g></g>
      <g fontFamily="Anton" fontSize={kapak ? 168 : 210} fill={kapak ? "#6f6c67" : BURG}>
        <text x="58" y={kapak ? 520 : 470}>{l1}</text>
        <text x="58" y="715">{l2}</text>
      </g>
      {f.shotB && (
        <g style={{ mixBlendMode: "multiply" }} filter={`url(#rr${uid})`}>
          <g transform="translate(540 1085) scale(1.7) translate(-760 -1100)"><rect x="-300" y="0" width="2000" height="2200" fill="#fff" /><Person /></g>
        </g>
      )}
      <text x="58" y="1850" fontFamily={SERIF} fontStyle="italic" fontSize="64" fill="#8d8a84">{kapak ? "3 adım" : "kafandaki ilk ses"}</text>
      {showDims && <Dims lines={[HEAD, { kind: "y", y: 760, label: "başlık · kafanın üstünde biter", at: "above-right" }]} />}
    </>
  );
}
