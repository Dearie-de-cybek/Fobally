// Shared (client + server) validation built from the journey config with zod.
import { z } from "zod";
import { JOURNEYS, UPLOAD_RULES, type Category, type Field, type Step, type Values } from "./config";

const PHONE = /^\+?[0-9][0-9\s\-().]{6,22}$/;

function fieldSchema(f: Field): z.ZodType {
  const req = !!f.required;
  const label = f.label.replace(/\s*\(.*?\)\s*/g, "").replace(/[…?]+$/, "").trim();

  if (f.type === "multi") {
    const base = z.array(z.string()).max(f.name === "aspAreas" ? 5 : 20, "Choose up to five.");
    const checked = f.options ? base.refine((a) => a.every((x) => f.options!.includes(x)), "Invalid choice.") : base;
    return req ? checked.min(1, "Choose at least one.") : checked.optional().default([]);
  }

  if (f.type === "upload") {
    const base = z.array(z.string().regex(/^[0-9a-f-]{36}$/, "Invalid upload.")).max(f.maxFiles ?? UPLOAD_RULES.maxFiles);
    return req ? base.min(1, "Add at least one photograph.") : base.optional().default([]);
  }

  let s: z.ZodString = z.string().trim();
  if (f.max) s = s.max(f.max, `Keep it under ${f.max} characters.`);

  if (f.type === "email") s = s.email("Enter a valid email address.");
  if (f.type === "tel") s = s.regex(PHONE, "Enter a valid phone number.");
  if (f.type === "url") s = s.refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(v), "Enter a full link starting with https://");

  if (f.options && (f.type === "select" || f.type === "radio")) {
    s = s.refine((v) => v === "" || f.options!.includes(v), "Pick one of the options.");
  }

  if (req) {
    if (f.options?.length === 1) return s.min(1, "Please tick this box to continue.");
    s = s.min(1, label.length > 40 || f.label.endsWith("?") ? "Please answer this one — a few honest sentences is enough." : `${label} is required.`);
    if (f.min) s = s.min(f.min, `Please write a little more (at least ${f.min} characters).`);
    return s;
  }
  if (f.min) return s.refine((v) => v === "" || v.length >= f.min!, `Please write a little more (at least ${f.min} characters).`).optional().default("");
  return s.optional().default("");
}

const cache = new Map<string, z.ZodType>();
function schemaFor(f: Field) {
  const key = `${f.name}|${f.type}|${f.required}|${f.min}|${f.max}|${f.options?.length ?? 0}`;
  let s = cache.get(key);
  if (!s) { s = fieldSchema(f); cache.set(key, s); }
  return s;
}

/** Validate one step. Returns errors keyed by field name; clean values for the step. */
export function validateStep(step: Step, values: Values) {
  const errors: Record<string, string> = {};
  const clean: Values = {};
  for (const f of step.fields) {
    if (f.showIf && !f.showIf(values)) continue;
    const raw = values[f.name];
    const res = schemaFor(f).safeParse(raw ?? (f.type === "multi" || f.type === "upload" ? [] : ""));
    if (res.success) clean[f.name] = res.data;
    else errors[f.name] = res.error.issues[0]?.message ?? "Invalid value.";
  }
  return { errors, clean };
}

/** Validate a whole journey (server). */
export function validateJourney(category: Category, values: Values) {
  const errors: Record<string, string> = {};
  const clean: Values = {};
  for (const step of JOURNEYS[category].steps) {
    const r = validateStep(step, values);
    Object.assign(errors, r.errors);
    Object.assign(clean, r.clean);
  }
  return { ok: Object.keys(errors).length === 0, errors, clean };
}
