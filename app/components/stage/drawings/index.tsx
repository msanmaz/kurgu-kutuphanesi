// The drawings: each maps its template's frame (lib/motion/templates) onto the primitives.
// The 2026-11-12 reference drawings live in ./reference.tsx.
import type { Params, TemplateId } from "@/lib/motion/registry";
import { panelFrame } from "@/lib/motion/templates/panel";
import { popoutFrame } from "@/lib/motion/templates/popout";
import { cardZoomFrame } from "@/lib/motion/templates/cardZoom";
import { fullZoomFrame } from "@/lib/motion/templates/fullZoom";
import { captionStyle, CAPTION_BOTTOM } from "@/lib/motion/templates/caption";
import { Ground, GroundDefs, TakeBg, TakeDefs, Person, PanelBox, WindowWithCode, Dims } from "../primitives";
import type { DimLine } from "../primitives";
import {
  BehindHeadDrawing, WordStreamDrawing, TypeActsDrawing, FaceHudDrawing, OutlinePathDrawing, HandCircleDrawing,
  RawEditedDrawing, ClipHoldDrawing, CmdExpandDrawing, WipeCompareDrawing, KeywordCtaDrawing, SetupStepsDrawing,
} from "./reference";
import { KeypadDrawing, LockDrawing } from "./steps";
import { HalftoneDrawing, WheelDrawing, QuoteDrawing, SessionDrawing, RisoDrawing } from "./jitter";

type Props = { p: Params; t: number; uid: string; showDims: boolean };

const captionLine = (mode: unknown): DimLine =>
  mode === "band" ? { kind: "y", y: 720, label: "altyazı bandı · y 720–823", at: "above-right" } : { kind: "y", y: 1590, label: "altyazı alt kenarı · 330 px", at: "below-right" };
const PANEL_DIM: DimLine = { kind: "box", x: 40, y: 60, w: 1000, h: 600, label: "PANEL x 40–1040 · y 60–660 · içerik ≤ 645" };

function PanelDrawing({ p, t, uid, showDims }: Props) {
  const f = panelFrame(p, t);
  return (
    <>
      <defs><TakeDefs id={`tk${uid}`} /></defs>
      <TakeBg id={`tk${uid}`} />
      <Person />
      <PanelBox titleWidth={f.titleWidth} tileOpacity={f.tileOpacity} opacity={f.panelOpacity} scale={f.panelScale} />
      {showDims && <Dims lines={[PANEL_DIM, captionLine("bottom")]} />}
    </>
  );
}

function PopoutDrawing({ p, t, uid, showDims }: Props) {
  const f = popoutFrame(p, t);
  return (
    <>
      <defs>
        <GroundDefs id={`g${uid}`} /><TakeDefs id={`tk${uid}`} />
        <clipPath id={`cc${uid}`}><rect x="40" y={f.cardTop} width="1000" height={1920 - f.cardTop + 60} rx="36" /></clipPath>
        <clipPath id={`ab${uid}`}><rect x="0" y="0" width="1080" height={f.cardTop + 24} /></clipPath>
      </defs>
      <Ground id={`g${uid}`} />
      <g clipPath={`url(#cc${uid})`}><TakeBg id={`tk${uid}`} /><Person /></g>
      <g clipPath={`url(#ab${uid})`}><Person /></g>
      <PanelBox titleWidth={f.titleWidth} tileOpacity={f.tileOpacity} opacity={f.panelOpacity} />
      {showDims && <Dims lines={[
        { kind: "y", y: f.cardTop, label: `kart üstü ${f.cardTop}` },
        { kind: "y", y: 900, label: "kafa üstü ≈ 900" },
        { kind: "box", x: 40, y: 60, w: 1000, h: 585, label: "PANEL · içerik y 60–645" },
        captionLine(p.captionMode),
      ]} />}
    </>
  );
}

function CardZoomDrawing({ p, t, uid, showDims }: Props) {
  const f = cardZoomFrame(p, t);
  const cam = `translate(${f.camTx} ${f.camTy}) scale(${f.camScale})`;
  return (
    <>
      <defs>
        <GroundDefs id={`g${uid}`} /><TakeDefs id={`tk${uid}`} />
        <clipPath id={`cc${uid}`}><rect x={f.card.x} y={f.card.y} width={f.card.w} height={f.card.h} rx={f.card.rx} /></clipPath>
        <clipPath id={`ab${uid}`}><rect x="0" y="0" width="1080" height={f.aboveH} /></clipPath>
      </defs>
      <Ground id={`g${uid}`} />
      <g clipPath={`url(#cc${uid})`}><g transform={cam}><TakeBg id={`tk${uid}`} /><Person /></g></g>
      <g clipPath={`url(#ab${uid})`}><g transform={cam}><Person /></g></g>
      <PanelBox titleWidth={380} tileOpacity={[1, 1, 1, 1, 1, 1]} opacity={f.panelOpacity} />
      {f.cutMarker && (
        <g>
          <rect x="380" y="840" width="320" height="64" rx="32" fill="#D97757" />
          <text x="540" y="884" fill="#fff" fontFamily="Mono, monospace" fontSize="34" textAnchor="middle">KESME</text>
        </g>
      )}
      {showDims && <Dims lines={[
        { kind: "y", y: Number(p.cardTop), label: `kart üstü ${p.cardTop}` },
        { kind: "box", x: 40, y: 60, w: 1000, h: 585, label: "PANEL · kart kenarı geçince" },
      ]} />}
    </>
  );
}

function FullZoomDrawing({ p, t, uid, showDims }: Props) {
  const f = fullZoomFrame(p, t);
  return (
    <>
      <defs>
        <GroundDefs id={`g${uid}`} />
        <clipPath id={`vw${uid}`}><rect x="40" y="190" width="1000" height="870" rx="26" /></clipPath>
      </defs>
      <Ground id={`g${uid}`} />
      <g clipPath={`url(#vw${uid})`}>
        <g transform={`translate(${f.winTx} ${f.winTy}) scale(${f.winScale})`}>
          <WindowWithCode bandRow={f.bandRow} bandOpacity={f.bandOpacity} />
        </g>
      </g>
      {showDims && <Dims lines={[{ kind: "box", x: 40, y: 190, w: 1000, h: 870, label: "FULL zoom kutusu" }, captionLine("bottom")]} />}
    </>
  );
}

function CaptionDrawing({ p, uid, showDims }: Props) {
  const cap = captionStyle(p);
  return (
    <>
      <defs><TakeDefs id={`tk${uid}`} /></defs>
      <TakeBg id={`tk${uid}`} />
      <Person />
      {showDims && <Dims lines={p.captionMode === "band"
        ? [{ kind: "y", y: 720, label: "bant · y 720", at: "above-right" }, { kind: "y", y: 823, label: "bant · y 823", at: "below-right" }]
        : [{ kind: "y", y: cap.top, label: `${cap.fontFamily.startsWith("Poppins") ? "Poppins" : "Helvetica Neue"} ${cap.fontWeight} · ${cap.size} px hap`, at: "above-right" }, { kind: "y", y: CAPTION_BOTTOM, label: "alt kenar 330 px", at: "below-right" }]} />}
    </>
  );
}

export const DRAWINGS: Record<TemplateId, (props: Props) => React.ReactNode> = {
  panel: PanelDrawing,
  popout: PopoutDrawing,
  cardZoom: CardZoomDrawing,
  fullZoom: FullZoomDrawing,
  caption: CaptionDrawing,
  behindHead: BehindHeadDrawing,
  wordStream: WordStreamDrawing,
  typeActs: TypeActsDrawing,
  faceHud: FaceHudDrawing,
  outlinePath: OutlinePathDrawing,
  handCircle: HandCircleDrawing,
  rawEdited: RawEditedDrawing,
  clipHold: ClipHoldDrawing,
  cmdExpand: CmdExpandDrawing,
  wipeCompare: WipeCompareDrawing,
  keywordCta: KeywordCtaDrawing,
  setupSteps: SetupStepsDrawing,
  stepKeypad: KeypadDrawing,
  stepLock: LockDrawing,
  halftoneStep: HalftoneDrawing,
  blurWheel: WheelDrawing,
  quoteCard: QuoteDrawing,
  sessionCta: SessionDrawing,
  risoPrint: RisoDrawing,
};
