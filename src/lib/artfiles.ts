// Real artwork slots. Drop consented images into /public/art/ named:
//   hero, painting, mixed, sculpture, ceramics, drawing, print   (.jpg .jpeg .png .webp)
// and optionally describe them in /public/art/credits.json:
//   { "hero": { "artist": "Name", "title": "Work title", "year": "2025" } }
// Any slot without a file falls back to the built-in abstract composition.
import fs from "node:fs";
import path from "node:path";

export type Credit = { artist?: string; title?: string; year?: string; source?: string; url?: string };
export type ArtSlot = { src: string; credit?: Credit } | null;
export type ArtMap = Record<string, ArtSlot>;

export const SLOTS = ["hero", "painting", "mixed", "sculpture", "ceramics", "drawing", "print", "national", "state"] as const;

export function loadArt(): ArtMap {
  const dir = path.join(process.cwd(), "public", "art");
  let credits: Record<string, Credit> = {};
  try { credits = JSON.parse(fs.readFileSync(path.join(dir, "credits.json"), "utf8")); } catch {}
  const map: ArtMap = {};
  for (const s of SLOTS) {
    const ext = ["jpg", "jpeg", "png", "webp"].find((e) => fs.existsSync(path.join(dir, `${s}.${e}`)));
    map[s] = ext ? { src: `/art/${s}.${ext}`, credit: credits[s] } : null;
  }
  return map;
}
