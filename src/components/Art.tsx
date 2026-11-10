// Original, abstract compositions built in SVG. They are placeholders for commissioned artwork:
// swap any <HeroArt/> / <Specimen/> for an <img> of a real, consented work when available.
import type { Category } from "@/lib/config";

const C = {
  paper: "oklch(0.945 0.025 85)", ink: "oklch(0.21 0.02 60)", indigo: "oklch(0.29 0.085 265)",
  indigo2: "oklch(0.42 0.1 262)", laterite: "oklch(0.55 0.155 40)", ochre: "oklch(0.78 0.14 82)", leaf: "oklch(0.42 0.1 155)",
};

/** Resist-dyed-cloth inspired ring-and-dot repeat (adire-style abstraction, not a copy of any traditional motif). */
function Adire({ id, fg = C.paper }: { id: string; fg?: string }) {
  return (
    <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
      <circle cx="22" cy="22" r="14" fill="none" stroke={fg} strokeWidth="2.5" opacity=".75" />
      <circle cx="22" cy="22" r="5" fill={fg} opacity=".85" />
      <circle cx="0" cy="0" r="3" fill={fg} opacity=".6" /><circle cx="44" cy="0" r="3" fill={fg} opacity=".6" />
      <circle cx="0" cy="44" r="3" fill={fg} opacity=".6" /><circle cx="44" cy="44" r="3" fill={fg} opacity=".6" />
    </pattern>
  );
}
function Torn({ id, s = 7 }: { id: string; s?: number }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" />
      <feDisplacementMap in="SourceGraphic" scale={s} />
    </filter>
  );
}

type CreditT = { artist?: string; title?: string; year?: string; source?: string };
const creditLine = (c?: CreditT) =>
  c && (c.artist || c.title) ? [c.artist, c.title, c.year].filter(Boolean).join(", ") : "";

export function HeroArt({ label = true, photo }: { label?: boolean; photo?: { src: string; credit?: CreditT } | null }) {
  if (photo) {
    return (
      <figure style={{ margin: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt={creditLine(photo.credit) || "Artwork from the exhibition"} className="photo" style={{ aspectRatio: "500/640", objectFit: "cover", width: "100%" }} />
        {label && creditLine(photo.credit) && <figcaption className="label" style={{ marginTop: ".6rem", opacity: .7 }}>{creditLine(photo.credit)}{photo.credit?.source && <><br />{photo.credit.source}</>}</figcaption>}
      </figure>
    );
  }
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox="0 0 500 640" role="img" aria-label="Abstract collage: an indigo patterned cloth, a rising ochre sun, a laterite slab and a green strip, crossed by a brush stroke">
        <defs><Adire id="ad1" /><Torn id="t1" /><Torn id="t2" s={12} /></defs>
        <g filter="url(#t1)">
          <rect x="30" y="30" width="360" height="520" fill={C.indigo} />
          <rect x="30" y="30" width="360" height="520" fill="url(#ad1)" />
        </g>
        <g filter="url(#t2)">
          <circle cx="330" cy="190" r="116" fill={C.ochre} />
          <polygon points="60,360 300,320 330,610 40,590" fill={C.laterite} />
          <rect x="400" y="90" width="48" height="470" fill={C.leaf} />
          <rect x="190" y="470" width="190" height="110" fill={C.paper} />
        </g>
        <g fill="none" strokeLinecap="round">
          <path d="M20 470 C 120 360, 200 540, 300 400 S 430 300, 480 210" stroke={C.ink} strokeWidth="16" />
          <path d="M26 462 C 124 356, 198 530, 298 392 S 428 296, 472 206" stroke={C.paper} strokeWidth="2" opacity=".7" />
        </g>
        <g fill={C.ink} opacity=".9">
          <rect x="204" y="486" width="110" height="7" /><rect x="204" y="504" width="150" height="4" /><rect x="204" y="516" width="132" height="4" /><rect x="204" y="528" width="90" height="4" />
        </g>
        <circle cx="330" cy="190" r="34" fill="none" stroke={C.ink} strokeWidth="3" />
        <circle cx="330" cy="190" r="10" fill={C.ink} />
      </svg>
      {label && <figcaption className="label" style={{ marginTop: ".6rem", opacity: .7 }}>Fig. 1 — Composition for the exhibition. Placeholder for commissioned work.</figcaption>}
    </figure>
  );
}

/** Small distinct composition per registration category. */
export function CatArt({ c, fg = "currentColor" }: { c: Category; fg?: string }) {
  const s = { fill: "none", stroke: fg, strokeWidth: 3, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 112 72" aria-hidden>
      {c === "citizen" && <g {...s}><circle cx="56" cy="36" r="10" /><circle cx="56" cy="36" r="22" /><circle cx="56" cy="36" r="34" /><path d="M4 36h12M96 36h12" /></g>}
      {c === "artist" && <g {...s}><path d="M6 56 C 30 6, 50 70, 74 22 S 100 18, 108 10" strokeWidth="9" /><circle cx="94" cy="54" r="8" fill={fg} stroke="none" /></g>}
      {c === "volunteer" && <g {...s}><path d="M10 60 L36 14 L62 60 Z" /><path d="M50 60 L76 14 L102 60 Z" /></g>}
      {c === "collaborator" && <g {...s}><circle cx="40" cy="36" r="24" /><circle cx="72" cy="36" r="24" /></g>}
      {c === "partner" && <g {...s}><rect x="10" y="36" width="26" height="28" /><rect x="43" y="22" width="26" height="42" /><rect x="76" y="8" width="26" height="56" /></g>}
    </svg>
  );
}

/** One abstract specimen per medium (large). */
export function Specimen({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 320 400" role="img" aria-label={`Abstract specimen: ${id}`} style={{ width: "100%", height: "100%" }}>
      <defs><Adire id="ad2" fg={C.ochre} /><Torn id="t3" /></defs>
      <rect width="320" height="400" fill={C.indigo2} />
      {id === "painting" && <g filter="url(#t3)"><rect x="30" y="40" width="260" height="320" fill={C.laterite} /><circle cx="190" cy="150" r="80" fill={C.ochre} /><rect x="30" y="250" width="260" height="110" fill={C.leaf} /></g>}
      {id === "mixed" && <g filter="url(#t3)"><rect x="20" y="30" width="190" height="230" fill="url(#ad2)" /><rect x="110" y="140" width="190" height="230" fill={C.paper} /><polygon points="40,360 160,230 200,360" fill={C.laterite} /><circle cx="250" cy="80" r="36" fill={C.ochre} /></g>}
      {id === "sculpture" && <g><ellipse cx="160" cy="350" rx="110" ry="16" fill={C.ink} opacity=".5" /><path d="M110 340 L130 130 Q160 40 190 130 L210 340 Z" fill={C.ochre} /><path d="M160 60 L190 130 L210 340 L160 340 Z" fill={C.laterite} opacity=".8" /></g>}
      {id === "ceramics" && <g><path d="M110 70 H210 C 200 110 250 150 240 250 C 235 330 200 350 160 350 C 120 350 85 330 80 250 C 70 150 120 110 110 70Z" fill={C.laterite} /><path d="M92 220 H228 M88 260 H232 M96 180 H224" stroke={C.paper} strokeWidth="5" fill="none" /></g>}
      {id === "drawing" && <g fill="none" stroke={C.paper} strokeLinecap="round">{Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${30 + i * 8} ${360 - i * 6} C ${90 + i * 9} ${60 + i * 10}, ${200 - i * 4} ${300 - i * 8}, ${290 - i * 3} ${50 + i * 14}`} strokeWidth={i % 4 === 0 ? 3 : 1.2} />)}</g>}
      {id === "print" && <g filter="url(#t3)"><rect x="40" y="50" width="240" height="300" fill={C.paper} /><rect x="60" y="70" width="200" height="260" fill={C.ink} /><circle cx="160" cy="170" r="60" fill={C.paper} /><path d="M70 320 L160 230 L250 320 Z" fill={C.paper} /></g>}
    </svg>
  );
}

/** Concentric "one nation / many states" mark for the scope section. */
export function ScopeMark({ fg }: { fg: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden style={{ width: "100%", maxWidth: 260 }}>
      <g fill="none" stroke={fg} strokeWidth="3">
        <circle cx="100" cy="100" r="92" /><circle cx="100" cy="100" r="64" /><circle cx="100" cy="100" r="36" />
      </g>
      <circle cx="100" cy="100" r="9" fill={fg} />
    </svg>
  );
}
export function StateMark({ fg }: { fg: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden style={{ width: "100%", maxWidth: 260 }}>
      <g fill="none" stroke={fg} strokeWidth="3">
        {Array.from({ length: 36 }, (_, i) => <rect key={i} x={12 + (i % 6) * 30} y={12 + Math.floor(i / 6) * 30} width="22" height="22" fill={i === 14 ? fg : "none"} />)}
      </g>
    </svg>
  );
}
