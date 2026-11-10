// Frontend-only persistence + submission adapter.
// There is NO backend in this project. `submitRegistration` is the single seam to replace
// with a real endpoint (fetch POST) when the gallery chooses a backend.
import { JOURNEYS, type Category, type Values } from "./config";

const DRAFT_KEY = "pc-draft-v1";
const SENT_KEY = "pc-submitted-v1";

/* ---------- drafts: PII fields are never written to browser storage ---------- */
type Draft = { category: Category; step: number; values: Values; savedAt: number };

function piiNames(category: Category) {
  return new Set(JOURNEYS[category].steps.flatMap((s) => s.fields.filter((f) => f.pii || f.type === "upload").map((f) => f.name)));
}
export function saveDraft(category: Category, step: number, values: Values) {
  try {
    const pii = piiNames(category);
    const safe = Object.fromEntries(Object.entries(values).filter(([k]) => !pii.has(k) && !k.startsWith("consent")));
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ category, step, values: safe, savedAt: Date.now() } satisfies Draft));
    return true;
  } catch { return false; }
}
export function loadDraft(category: Category): Draft | null {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null") as Draft | null;
    return d && d.category === category ? d : null;
  } catch { return null; }
}
export function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch {} }

/* ---------- duplicate guard (hash only, no email stored) ---------- */
async function hash(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
const readSent = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(SENT_KEY) || "{}"); } catch { return {}; } };

const PREFIX: Record<Category, string> = { citizen: "CZ", artist: "AR", volunteer: "VO", collaborator: "CO", partner: "PS" };
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeRef(c: Category) {
  const b = crypto.getRandomValues(new Uint8Array(6));
  return `PC26-${PREFIX[c]}-${Array.from(b, (x) => ALPHABET[x % ALPHABET.length]).join("")}`;
}

export type SubmitResult = { ok: true; ref: string } | { ok: false; duplicate?: boolean; ref?: string; error: string };

export async function submitRegistration(category: Category, values: Values): Promise<SubmitResult> {
  const key = `${category}:${await hash(String(values.email ?? "").trim().toLowerCase())}`;
  const sent = readSent();
  if (sent[key]) return { ok: false, duplicate: true, ref: sent[key], error: "This email has already registered in this category." };

  // TODO(backend): replace with `await fetch("/api/register", { method: "POST", body: JSON.stringify({ category, values }) })`.
  await new Promise((r) => setTimeout(r, 1400));

  const ref = makeRef(category);
  try { localStorage.setItem(SENT_KEY, JSON.stringify({ ...sent, [key]: ref })); } catch {}
  clearDraft();
  return { ok: true, ref };
}
