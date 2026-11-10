"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CATEGORIES, JOURNEYS, isCategory, type Category, type Values } from "@/lib/config";
import { validateStep } from "@/lib/validate";
import { clearDraft, loadDraft, saveDraft, submitRegistration } from "@/lib/client";
import { CatArt } from "../Art";
import { FieldView, visibleFields } from "./Fields";
import { ASP_COUNT, Aspiration } from "./Aspiration";
import { Upload, type Photo } from "./Upload";
import { Confirmation } from "./Confirmation";

const COLORS: Record<Category, string> = {
  citizen: "oklch(0.55 0.155 40)", artist: "oklch(0.29 0.085 265)", volunteer: "oklch(0.42 0.1 155)",
  collaborator: "oklch(0.45 0.12 300 / 1)", partner: "oklch(0.21 0.02 60)",
};
// aspiration sub-screen -> fields validated on that screen
const ASP_FIELDS = [["aspChangeNational", "aspChangeState"], ["aspVisionNational", "aspVisionState"], ["aspAreas", "aspAreasNote"], ["aspLeadership"], ["aspResponsibility"], ["aspMessage"]];

export function RegisterFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const asParam = params.get("as");

  const [category, setCategory] = useState<Category | null>(isCategory(asParam) ? asParam : null);
  const [step, setStep] = useState(0);
  const [sub, setSub] = useState(0); // aspiration sub-screen
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dir, setDir] = useState(1);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<{ msg: string; ref?: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [draftOffer, setDraftOffer] = useState<ReturnType<typeof loadDraft>>(null);
  const [result, setResult] = useState<{ ref: string; values: Values; category: Category } | null>(null);
  const title = useRef<HTMLHeadingElement>(null);

  const journey = category ? JOURNEYS[category] : null;
  const cur = journey?.steps[step];
  const total = journey?.steps.length ?? 1;

  // follow ?as= changes
  useEffect(() => { setCategory(isCategory(asParam) ? asParam : null); setStep(0); setSub(0); setValues({}); setErrors({}); setPhotos([]); }, [asParam]);
  // offer draft recovery when a journey opens
  useEffect(() => { setDraftOffer(category ? loadDraft(category) : null); }, [category]);

  // artwork ids mirror photos
  useEffect(() => {
    if (category !== "artist") return;
    setValues((v) => ({ ...v, images: photos.filter((p) => p.progress === 100 && !p.error).map((p) => p.id) }));
  }, [photos, category]);

  // autosave (non-PII only; see lib/client.ts)
  useEffect(() => {
    if (!category || result) return;
    const t = setTimeout(() => { if (Object.keys(values).length) { saveDraft(category, step, values); } }, 700);
    return () => clearTimeout(t);
  }, [category, step, values, result]);
  useEffect(() => { if (saved) { const t = setTimeout(() => setSaved(false), 2500); return () => clearTimeout(t); } }, [saved]);

  // block accidental tab-close mid-journey
  useEffect(() => {
    if (!category || result || !Object.keys(values).length) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [category, result, values]);

  const set = useCallback((name: string, val: unknown) => {
    setValues((v) => ({ ...v, [name]: val }));
    setErrors((e) => { if (!e[name]) return e; const { [name]: _, ...rest } = e; return rest; });
    setFormError(null);
  }, []);

  const pick = (c: Category) => { router.replace(`/register?as=${c}`, { scroll: false }); };

  function focusFirstError(errs: Record<string, string>) {
    const first = Object.keys(errs)[0];
    requestAnimationFrame(() => { (document.getElementById(`f-${first}`) ?? document.getElementById(`a-${first}`))?.focus({ preventScroll: false }); });
  }

  function validateCurrent(fieldNames?: string[]) {
    if (!cur) return true;
    const step_ = fieldNames ? { ...cur, fields: cur.fields.filter((f) => fieldNames.includes(f.name)) } : cur;
    const { errors: errs } = validateStep(step_, values);
    setErrors(errs);
    if (Object.keys(errs).length) { focusFirstError(errs); return false; }
    return true;
  }

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); setSub(0); setErrors({}); setFormError(null); };

  async function finish() {
    if (!category) return;
    setBusy(true); setFormError(null);
    const r = await submitRegistration(category, values);
    setBusy(false);
    if (r.ok) setResult({ ref: r.ref, values, category });
    else setFormError({ msg: r.error, ref: r.ref });
  }

  async function next() {
    if (!cur || !journey) return;
    if (cur.variant === "aspiration") {
      if (!validateCurrent(ASP_FIELDS[sub])) return;
      if (sub < 2) { // Q1/Q2: an answer for Nigeria OR the state is enough
        const [nat, sta] = ASP_FIELDS[sub];
        if (!String(values[nat] ?? "").trim() && !String(values[sta] ?? "").trim()) {
          setErrors({ [nat]: "Answer for Nigeria, for your state, or both — a few honest sentences is enough." });
          return;
        }
      }
      if (sub < ASP_COUNT - 1) { setSub(sub + 1); setErrors({}); return; }
      go(step + 1); return;
    }
    if (!validateCurrent()) return;
    if (step < total - 1) go(step + 1); else await finish();
  }
  function back() {
    if (cur?.variant === "aspiration" && sub > 0) { setSub(sub - 1); setErrors({}); return; }
    if (step > 0) go(step - 1); else router.replace("/register", { scroll: false });
  }
  function restore() {
    if (!draftOffer) return;
    setValues((v) => ({ ...draftOffer.values, ...v })); go(Math.min(draftOffer.step, total - 1)); setDraftOffer(null);
  }
  function discard() { clearDraft(); setDraftOffer(null); }

  // focus step title when it changes
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [step, category]);

  const progress = useMemo(() => {
    if (!journey) return 0;
    const inner = cur?.variant === "aspiration" ? sub / ASP_COUNT : 0;
    return ((step + inner) / total) * 100;
  }, [journey, cur, step, sub, total]);

  /* ---------- confirmation ---------- */
  if (result) return <Confirmation category={result.category} values={result.values} reference={result.ref} />;

  /* ---------- category picker ---------- */
  if (!category || !journey || !cur) {
    return (
      <section className="pick" aria-labelledby="pick-h">
        <p className="label" style={{ color: "var(--laterite)", marginBottom: "1rem" }}>Registration</p>
        <h1 id="pick-h" className="display">How would you like to be part of this <span className="italic" style={{ color: "var(--laterite)" }}>story?</span></h1>
        <div className="pick-list" role="list">
          {CATEGORIES.map((c, i) => (
            <div role="listitem" key={c}>
              <motion.button className="prow" style={{ ["--c" as string]: COLORS[c] }} onClick={() => pick(c)}
                initial={reduce ? false : { opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.2, 0.7, 0.1, 1] }}>
                <span className="num">0{i + 1}</span>
                <span><span className="nm">{JOURNEYS[c].label}</span><span className="bl">{JOURNEYS[c].blurb}</span></span>
                <CatArt c={c} />
              </motion.button>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const inAsp = cur.variant === "aspiration";
  const isLast = step === total - 1;
  const fields = visibleFields(cur.fields, values);

  return (
    <div className="reg">
      <aside className="rail" aria-label="Progress">
        <div>
          <p className="label x" style={{ opacity: .7, margin: "0 0 .5rem" }}>You are registering as</p>
          <div className="cat">{journey.label}</div>
        </div>
        <ol className="steps">
          {journey.steps.map((s, i) => <li key={s.id} className={i < step ? "done" : i === step ? "on" : ""} aria-current={i === step ? "step" : undefined}>{s.kicker}</li>)}
        </ol>
        <span className="label" style={{ marginLeft: "auto" }} aria-hidden>{step + 1}/{total}</span>
        <div className="rail-art" style={{ color: "var(--ochre)" }}><CatArt c={category} /></div>
      </aside>

      <div className="stage">
        <div className="pbar" role="progressbar" aria-label="Registration progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><i style={{ width: `${progress}%` }} /></div>

        {draftOffer && step === 0 && (
          <div className="banner ok" role="status">
            <b>Welcome back.</b> We found a saved draft of your answers (contact details are never saved in your browser).{" "}
            <button className="linkbtn" onClick={restore}>Continue draft</button>{" · "}<button className="linkbtn" onClick={discard}>Start fresh</button>
          </div>
        )}

        {/* enter-only transition: never blocks navigation if animation frames are throttled */}
        <>
          <motion.div key={step}
            initial={reduce ? false : { opacity: 0, x: 60 * dir }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.1, 1] }} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <p className="label kicker">{cur.kicker}</p>
            <h1 className="display step-title" ref={title} tabIndex={-1} style={{ outline: "none" }}>{cur.title}</h1>
            {cur.intro && <p className="step-intro">{cur.intro}</p>}

            {cur.variant === "upload" ? (
              <div className="fields" style={{ maxWidth: "46rem" }}>
                <Upload photos={photos} setPhotos={setPhotos} err={errors.images} />
              </div>
            ) : inAsp ? (
              <div className="fields">
                <p>You will move through six short questions, one per screen. Each of the first two lets you answer for <b>Nigeria</b> and for <b>your state</b>.</p>
                <div><button className="btn" onClick={() => setSub(0)}>Begin the questions <span className="arr">→</span></button></div>
              </div>
            ) : (
              <div className="fields">
                {fields.map((f) => <FieldView key={f.name} f={f} v={values[f.name]} err={errors[f.name]} set={set} consent={cur.variant === "consent"} />)}
                {cur.variant === "consent" && (
                  <p className="notice" style={{ margin: 0 }}>
                    Your name, email, phone and any medical or emergency details are only used by the gallery team and are never displayed publicly.
                    {category === "artist" && " Artwork is displayed publicly only if accepted and you consent above."}
                  </p>
                )}
              </div>
            )}

            {formError && (
              <div className="banner" role="alert" style={{ marginTop: "1.5rem" }}>
                {formError.msg}{formError.ref && <> Your existing reference: <b className="label" style={{ fontSize: ".85rem" }}>{formError.ref}</b></>}
              </div>
            )}

            <div className="nav-row">
              <button className="linkbtn" onClick={back}>← {step === 0 ? "Change category" : "Back"}</button>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <button className="linkbtn" onClick={() => { setSaved(saveDraft(category, step, values)); }}>{saved ? "Draft saved ✓" : "Save draft"}</button>
                {!inAsp && (
                  <button className="btn" onClick={next} disabled={busy} aria-busy={busy}>
                    {busy ? <><span className="spin" aria-hidden /> Sending</> : isLast ? <>Submit registration <span className="arr">→</span></> : <>Continue <span className="arr">→</span></>}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      </div>

      {inAsp && (
        <Aspiration index={sub} values={values} errors={errors} set={set} onNext={next} onBack={back} saved={saved} onJump={(i) => { setSub(i); setErrors({}); }} onSave={() => setSaved(saveDraft(category, step, values))} />
      )}
    </div>
  );
}
