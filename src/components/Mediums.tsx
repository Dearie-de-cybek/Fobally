"use client";
import { useState } from "react";
import { MEDIUMS } from "@/lib/site";
import type { ArtMap } from "@/lib/artfiles";
import { Specimen } from "./Art";

export function Mediums({ art }: { art: ArtMap }) {
  const [on, setOn] = useState<string>(MEDIUMS[0].id);
  const photo = art[on];
  return (
    <div className="mediums">
      <ul className="mlist">
        {MEDIUMS.map((m, i) => (
          <li key={m.id}>
            <button className="mrow" aria-pressed={on === m.id} onMouseEnter={() => setOn(m.id)} onFocus={() => setOn(m.id)} onClick={() => setOn(m.id)}>
              <span className="label">0{i + 1}</span>
              <span className="nm">{m.name}</span>
              <span className="note">{m.note}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="specimen" aria-live="polite">
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={photo.credit?.title || on} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {photo.credit?.title && <span className="label" style={{ position: "absolute", left: ".9rem", right: ".9rem", bottom: ".9rem", background: "var(--ink)", padding: ".4rem .6rem", lineHeight: 1.4, textTransform: "none", letterSpacing: ".04em" }}>{[photo.credit.artist, photo.credit.title].filter(Boolean).join(", ")}<br /><span style={{ opacity: .65 }}>{photo.credit.source}</span></span>}
          </>
        ) : <Specimen id={on} />}
      </div>
    </div>
  );
}
