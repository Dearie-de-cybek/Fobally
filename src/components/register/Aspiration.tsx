"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AREAS, type Values } from "@/lib/config";
import { FieldView } from "./Fields";
import { Backdrop } from "../Backdrop";

type Screen =
  | { kind: "dual"; q: string; hl: string; nat: string; sta: string; natReq?: boolean; prompt: [string, string] }
  | { kind: "areas"; q: string; hl: string }
  | { kind: "single"; q: string; hl: string; name: string; prompt: string };

const SCREENS: Screen[] = [
  { kind: "dual", q: "If you could change one thing about Nigeria, what would it be?", hl: "one thing", nat: "aspChangeNational", sta: "aspChangeState", natReq: true,
    prompt: ["Start with the thing you would fix first, and why it matters to you…", "Name your state, then the one thing you would change there…"] },
  { kind: "dual", q: "What should Nigeria look like between 2027 and 2031?", hl: "look like", nat: "aspVisionNational", sta: "aspVisionState", natReq: true,
    prompt: ["Describe a day in the country you want, four years from now…", "Describe a day in your state, four years from now…"] },
  { kind: "areas", q: "What areas of national development matter most to you?", hl: "matter most" },
  { kind: "single", q: "What would responsible leadership look like?", hl: "responsible leadership", name: "aspLeadership", prompt: "Describe what a leader does, says and refuses to do…" },
  { kind: "single", q: "What responsibility do citizens have in building the Nigeria they imagine?", hl: "citizens", name: "aspResponsibility", prompt: "What would you ask of yourself and of your neighbours?" },
  { kind: "single", q: "What message would you leave for the next generation?", hl: "message", name: "aspMessage", prompt: "Write it as a letter to someone not yet born…" },
];
export const ASP_COUNT = SCREENS.length;

function Headline({ q, hl }: { q: string; hl: string }) {
  const i = q.indexOf(hl);
  if (i < 0) return <>{q}</>;
  return <>{q.slice(0, i)}<em>{q.slice(i, i + hl.length)}</em>{q.slice(i + hl.length)}</>;
}

type Props = {
  index: number; values: Values; errors: Record<string, string>;
  set: (n: string, v: unknown) => void; onNext: () => void; onBack: () => void; onSave: () => void; saved: boolean;
  onJump: (i: number) => void;
};

const SHORT = ["The one change", "2027–2031", "Priorities", "Leadership", "Citizen duty", "Message"];
const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;

/** Per-question status for the tracker: NG/ST chips on the dual-scope questions. */
function statusOf(sc: Screen, text: (n: string) => string, values: Values) {
  if (sc.kind === "dual") {
    const ng = filled(text(sc.nat)), st = filled(text(sc.sta));
    return { done: ng || st, chips: [{ k: "NG", on: ng, title: "Answered for Nigeria" }, { k: "ST", on: st, title: "Answered for my state" }] };
  }
  if (sc.kind === "areas") {
    const n = Array.isArray(values.aspAreas) ? values.aspAreas.length : 0;
    return { done: n > 0 || filled(text("aspAreasNote")), chips: [] as { k: string; on: boolean; title: string }[] };
  }
  return { done: filled(text(sc.name)), chips: [] as { k: string; on: boolean; title: string }[] };
}

export function Aspiration({ index, values, errors, set, onNext, onBack, onSave, saved, onJump }: Props) {
  const reduce = useReducedMotion();
  const s = SCREENS[index];
  const [scope, setScope] = useState<"nat" | "sta">("nat");
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => { setScope("nat"); head.current?.focus(); }, [index]);

  const [maxReached, setMax] = useState(index);
  useEffect(() => { setMax((m) => Math.max(m, index)); }, [index]);
  const text = (n: string) => (typeof values[n] === "string" ? (values[n] as string) : "");
  const bodyKey = `${index}-${scope}`;
  const last = index === ASP_COUNT - 1;
  const optional = !(s.kind === "dual" && s.natReq);

  const area = (name: string, placeholder: string, req: boolean, max: number) => {
    const val = text(name);
    return (
      <>
        <label className="sr" htmlFor={`a-${name}`}>{placeholder}</label>
        <textarea id={`a-${name}`} className="asp-ta" value={val} maxLength={max} placeholder={placeholder} aria-required={req} aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `a-${name}-e` : undefined} onChange={(e) => set(name, e.target.value)} />
        <div className="asp-meta">
          <span>{req ? "Answer for Nigeria, your state, or both." : "Optional — skip if you like."}</span>
          <span aria-live="polite">{val.length} / {max}</span>
        </div>
        {errors[name] && <p className="msg" id={`a-${name}-e`} role="alert">{errors[name]}</p>}
      </>
    );
  };

  return (
    <div className="asp" role="dialog" aria-modal="false" aria-label="Document your Nigeria">
      <Backdrop tone="dark" fixed={false} />
      <div className="asp-top">
        <button className="linkbtn" onClick={onBack}>← Back</button>
        <div className="asp-dots" role="img" aria-label={`Question ${index + 1} of ${ASP_COUNT}`}>
          {SCREENS.map((_, i) => <i key={i} className={i <= index ? "on" : ""} />)}
        </div>
        <button className="linkbtn" onClick={onSave}>{saved ? "Draft saved ✓" : "Save draft"}</button>
      </div>

      <div className="asp-main">
      <div className="asp-body">
        <span className="asp-num" aria-hidden>{index + 1}</span>
        <p className="label" style={{ color: "var(--ochre)", marginBottom: ".8rem" }}>Question {index + 1} of {ASP_COUNT}</p>
        <>
          <motion.div key={index} initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.1, 1] }}>
            <h2 className="asp-q" ref={head} tabIndex={-1} style={{ outline: "none" }}><Headline q={s.q} hl={s.hl} /></h2>

            {s.kind === "dual" && (
              <>
                <div className="scopes" role="tablist" aria-label="Scope of your answer">
                  <button role="tab" aria-selected={scope === "nat"} onClick={() => setScope("nat")}>For Nigeria</button>
                  <button role="tab" aria-selected={scope === "sta"} onClick={() => setScope("sta")}>For my state</button>
                </div>
                <div role="tabpanel" key={bodyKey}>
                  {scope === "nat" ? area(s.nat, s.prompt[0], !!s.natReq, s.nat.includes("Vision") ? 3000 : 2000)
                    : area(s.sta, s.prompt[1], !!s.natReq, s.sta.includes("Vision") ? 3000 : 2000)}
                </div>
                {scope === "sta" && errors[s.nat] && <p className="msg" role="alert">{errors[s.nat]}</p>}
                <p className="asp-meta" style={{ marginTop: ".8rem" }}>
                  {text(s.nat) ? "✓ Nigeria answered." : "○ Nigeria — not yet."}{"  "}{text(s.sta) ? "✓ My state answered." : "○ My state — not yet."}
                </p>
              </>
            )}

            {s.kind === "areas" && (
              <>
                <FieldView f={{ name: "aspAreas", label: "Choose up to five", type: "multi", options: AREAS }} v={values.aspAreas} err={errors.aspAreas} set={set} />
                <div style={{ marginTop: "1.4rem" }}>{area("aspAreasNote", "Anything to add about these priorities?", false, 1500)}</div>
              </>
            )}

            {s.kind === "single" && area(s.name, s.prompt, false, s.name === "aspMessage" ? 1500 : 3000)}
          </motion.div>
        </>
      </div>

      <nav className="asp-track" aria-label="Your progress through the questions">
        <p className="label" style={{ margin: "0 0 .8rem", opacity: .7 }}>Your answers</p>
        <ol>
          {SCREENS.map((sc, i) => {
            const reachable = i <= maxReached;
            const status = statusOf(sc, text, values);
            return (
              <li key={i} className={i === index ? "cur" : ""}>
                <button onClick={() => reachable && onJump(i)} disabled={!reachable} aria-current={i === index ? "step" : undefined}
                  aria-label={`Question ${i + 1}: ${SHORT[i]}${status.done ? ", answered" : ""}`}>
                  <span className="tn">{i + 1}</span>
                  <span className="tt">{SHORT[i]}</span>
                  <span className="chips">
                    {status.chips.map((c) => <b key={c.k} className={c.on ? "on" : ""} title={c.title}>{c.k}</b>)}
                    {status.chips.length === 0 && <b className={status.done ? "on" : ""}>{status.done ? "✓" : "·"}</b>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="key label">NG = Nigeria · ST = my state</p>
      </nav>
      </div>

      <div className="asp-foot">
        <span className="label" style={{ opacity: .7 }}>Your words stay private unless you consent to public display.</span>
        <div style={{ display: "flex", gap: ".7rem", alignItems: "center" }}>
          {optional && <button className="linkbtn" onClick={onNext}>Skip</button>}
          <button className="btn" onClick={onNext}>{last ? "Finish" : "Next question"} <span className="arr">→</span></button>
        </div>
      </div>
    </div>
  );
}
