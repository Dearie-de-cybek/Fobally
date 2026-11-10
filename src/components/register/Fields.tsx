"use client";
import type { Field, Values } from "@/lib/config";

type Props = { f: Field; v: unknown; err?: string; set: (name: string, val: unknown) => void; consent?: boolean };

export function FieldView({ f, v, err, set, consent }: Props) {
  const id = `f-${f.name}`;
  const eid = `${id}-e`, hid = `${id}-h`;
  const desc = [err ? eid : "", f.hint ? hid : ""].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": !!err, "aria-describedby": desc, "aria-required": f.required } as const;
  const str = typeof v === "string" ? v : "";
  const arr = Array.isArray(v) ? (v as string[]) : [];

  // Consent step: single-option radios become checkboxes
  if (consent && f.options?.length === 1) {
    const val = f.options[0];
    return (
      <div className="field">
        <label className={`consent${err ? " bad" : ""}`} htmlFor={id}>
          <input {...common} type="checkbox" checked={str === val} onChange={(e) => set(f.name, e.target.checked ? val : "")} />
          <span>{f.label}{f.required && <span className="req"> *</span>}</span>
        </label>
        {err && <p className="msg" id={eid} role="alert">{err}</p>}
      </div>
    );
  }

  const label = (
    <label htmlFor={id}>{f.label}{f.required && <span className="req"> *</span>}</label>
  );
  const group = (children: React.ReactNode) => (
    <fieldset className={`field${err ? " bad" : ""}`} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }} aria-describedby={desc}>
      <legend className="lab" style={{ padding: 0, fontFamily: "var(--f-mono)", fontSize: ".74rem", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".5rem" }}>{f.label}{f.required && <span className="req"> *</span>}</legend>
      {children}
      {f.hint && <p className="hint" id={hid}>{f.hint}</p>}
      {err && <p className="msg" id={eid} role="alert">{err}</p>}
    </fieldset>
  );

  if (f.type === "multi") {
    return group(
      <div className="opts">
        {f.options!.map((o) => (
          <label className="opt" key={o}>
            <input type="checkbox" checked={arr.includes(o)} onChange={(e) => set(f.name, e.target.checked ? [...arr, o] : arr.filter((x) => x !== o))} />
            <span>{o}</span>
          </label>
        ))}
      </div>,
    );
  }
  if (f.type === "radio") {
    return group(
      <div className="opts col">
        {f.options!.map((o) => (
          <label className="opt" key={o}>
            <input type="radio" name={f.name} checked={str === o} onChange={() => set(f.name, o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>,
    );
  }

  return (
    <div className={`field${err ? " bad" : ""}`}>
      {label}
      {f.type === "select" ? (
        <select {...common} className="sel" value={str} onChange={(e) => set(f.name, e.target.value)}>
          <option value="">Select…</option>
          {f.options!.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : f.type === "textarea" ? (
        <>
          <textarea {...common} className="ta" value={str} maxLength={f.max} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
          {f.max && <p className="hint" style={{ textAlign: "right" }}>{str.length} / {f.max}</p>}
        </>
      ) : (
        <input {...common} className="in" type={f.type === "tel" ? "tel" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"} value={str} maxLength={f.max} placeholder={f.placeholder}
          autoComplete={f.name === "email" ? "email" : f.name === "phone" ? "tel" : f.name === "name" ? "name" : "off"} inputMode={f.type === "tel" ? "tel" : undefined}
          onChange={(e) => set(f.name, e.target.value)} />
      )}
      {f.hint && f.type !== "textarea" && <p className="hint" id={hid}>{f.hint}</p>}
      {err && <p className="msg" id={eid} role="alert">{err}</p>}
    </div>
  );
}

export function visibleFields(fields: Field[], values: Values) {
  return fields.filter((f) => !f.showIf || f.showIf(values));
}
