"use client";
// Client-side image intake: type/size checks, live previews, per-file progress.
// Files are held in memory only (no server). Progress is a local read of the file.
import { useRef, useState } from "react";
import { UPLOAD_RULES } from "@/lib/config";

export type Photo = { id: string; name: string; size: number; url: string; progress: number; error?: string };

const MB = 1024 * 1024;
const okType = (f: File) => UPLOAD_RULES.mimes.includes(f.type);

export function Upload({ photos, setPhotos, err }: { photos: Photo[]; setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>; err?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [note, setNote] = useState("");

  function add(list: FileList | File[]) {
    setNote("");
    const files = Array.from(list);
    const room = UPLOAD_RULES.maxFiles - photos.filter((p) => !p.error).length;
    const problems: string[] = [];
    const accepted: File[] = [];
    for (const f of files) {
      if (!okType(f)) problems.push(`${f.name}: only JPG, PNG or WebP images.`);
      else if (f.size > UPLOAD_RULES.maxBytes) problems.push(`${f.name}: over ${UPLOAD_RULES.maxBytes / MB} MB.`);
      else if (accepted.length >= room) problems.push(`${f.name}: limit of ${UPLOAD_RULES.maxFiles} photographs reached.`);
      else accepted.push(f);
    }
    if (problems.length) setNote(problems.join(" "));
    for (const f of accepted) {
      const id = crypto.randomUUID();
      const p: Photo = { id, name: f.name, size: f.size, url: URL.createObjectURL(f), progress: 0 };
      setPhotos((cur) => [...cur, p]);
      const reader = new FileReader();
      reader.onprogress = (e) => e.lengthComputable && setPhotos((cur) => cur.map((x) => (x.id === id ? { ...x, progress: Math.round((e.loaded / e.total) * 100) } : x)));
      reader.onload = () => setPhotos((cur) => cur.map((x) => (x.id === id ? { ...x, progress: 100 } : x)));
      reader.onerror = () => setPhotos((cur) => cur.map((x) => (x.id === id ? { ...x, error: "Could not read this file." } : x)));
      reader.readAsArrayBuffer(f);
    }
  }
  function remove(p: Photo) {
    URL.revokeObjectURL(p.url);
    setPhotos((cur) => cur.filter((x) => x.id !== p.id));
  }

  return (
    <div className={`field${err ? " bad" : ""}`}>
      <ul className="rules label">
        <li>JPG · PNG · WebP</li><li>Max {UPLOAD_RULES.maxBytes / MB} MB each</li><li>Up to {UPLOAD_RULES.maxFiles} photos</li>
      </ul>
      <div
        className={`drop${over ? " over" : ""}`} role="button" tabIndex={0} aria-label="Add artwork photographs"
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
      >
        <b>Drop photographs here</b>
        <span>or click to choose files</span>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
      {note && <p className="msg" role="alert">{note}</p>}
      {err && <p className="msg" role="alert">{err}</p>}

      {photos.length > 0 && (
        <ul className="sheet" style={{ listStyle: "none", padding: 0 }}>
          {photos.map((p, i) => (
            <li key={p.id} className={`frame${p.error ? " ferr" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Preview ${i + 1}: ${p.name}`} />
              {p.progress < 100 && !p.error && <span className="prog" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${p.progress}%` }} /></span>}
              <span className="cap">{p.error ?? `${i === 0 ? "Main · " : ""}${p.name}`}</span>
              <button type="button" className="x" aria-label={`Remove ${p.name}`} onClick={() => remove(p)}>×</button>
            </li>
          ))}
        </ul>
      )}
      <p className="notice"><b>Please note:</b> submission does not guarantee inclusion. Artwork acceptance is subject to review by Fobally Art Gallery, and you will be told the outcome.</p>
    </div>
  );
}
