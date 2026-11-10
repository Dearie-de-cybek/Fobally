"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { JOURNEYS, type Category, type Values } from "@/lib/config";

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(/\s+/); let line = ""; let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      lines++;
      if (lines >= maxLines) { ctx.fillText(line.replace(/[,.;:]?$/, "") + "…", x, y); return; }
      ctx.fillText(line, x, y); y += lh; line = words[i];
    } else line = test;
  }
  ctx.fillText(line, x, y);
}

function drawCard(c: HTMLCanvasElement, quote: string, state: string) {
  const ctx = c.getContext("2d")!; const W = 1080, H = 1350; c.width = W; c.height = H;
  ctx.fillStyle = "#26295a"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(240,230,210,.14)"; ctx.fillStyle = "rgba(240,230,210,.2)"; ctx.lineWidth = 3;
  for (let y = 22; y < H; y += 60) for (let x = 22; x < W; x += 60) { ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#e9b43c"; ctx.beginPath(); ctx.arc(830, 300, 210, 0, 7); ctx.fill();
  ctx.fillStyle = "#b0482a"; ctx.fillRect(0, 960, W, 390);
  ctx.fillStyle = "#f2e9d6"; ctx.fillRect(70, 520, 940, 560);
  ctx.fillStyle = "#26252a"; ctx.font = "700 40px Georgia, serif"; ctx.fillText("MY ASPIRED NIGERIA · 2027–2031", 110, 590);
  ctx.font = "italic 52px Georgia, serif"; ctx.fillText("“", 110, 680);
  ctx.font = "italic 50px Georgia, serif"; wrap(ctx, quote, 160, 680, 800, 66, 6);
  ctx.font = "500 30px monospace"; ctx.fillStyle = "#26252a";
  ctx.fillText(state ? `— A citizen of ${state}` : "— A Nigerian citizen", 110, 1030);
  ctx.fillStyle = "#f2e9d6"; ctx.font = "800 70px Georgia, serif"; ctx.fillText("THE PEOPLE’S CANVAS", 70, 1180);
  ctx.font = "500 28px monospace"; ctx.fillText("#PeoplesCanvas · Fobally Art Gallery", 70, 1230);
}

export function Confirmation({ category, values, reference }: { category: Category; values: Values; reference: string }) {
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [shareMsg, setShareMsg] = useState("");
  const j = JOURNEYS[category];
  const citizen = category === "citizen";
  const quote = String(values.aspChangeNational || values.aspChangeState || values.aspVisionNational || values.aspVisionState || "");
  const first = String(values.name ?? "").split(" ")[0];

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (citizen && canvas.current && quote) drawCard(canvas.current, quote, String(values.stateResidence ?? "")); }, [citizen, quote, values.stateResidence]);

  const blob = () => new Promise<Blob | null>((r) => canvas.current?.toBlob(r, "image/png"));
  async function download() {
    const b = await blob(); if (!b) return;
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `my-aspired-nigeria-${reference}.png`; a.click(); URL.revokeObjectURL(a.href);
  }
  async function share() {
    const b = await blob(); if (!b) return;
    const file = new File([b], "my-aspired-nigeria.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: "My Aspired Nigeria", text: "I documented the Nigeria I aspire to see. #PeoplesCanvas" }); return; } catch { return; } }
    await download(); setShareMsg("Image saved — share it from your gallery.");
  }

  const next = [
    "Keep your reference. Quote it in any correspondence with the gallery.",
    "The gallery team reviews every registration.",
    "Dates, venue and next steps are not yet announced. We will write when they are confirmed.",
    category === "artist" ? "Artwork acceptance is subject to gallery review. You will be told the outcome." : "Your personal details are never shown publicly.",
  ];

  const pop = (d: number) => reduce ? {} : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: .7, delay: d, ease: [0.2, 0.7, 0.1, 1] as const } };

  return (
    <section className="done" aria-labelledby="done-h">
      <svg aria-hidden viewBox="0 0 400 400" style={{ position: "absolute", right: "-6rem", top: "8rem", width: "min(60vw,36rem)", opacity: .9 }}>
        <circle cx="200" cy="200" r="190" fill="oklch(0.78 0.14 82)" /><circle cx="200" cy="200" r="120" fill="none" stroke="oklch(0.21 0.02 60)" strokeWidth="6" /><circle cx="200" cy="200" r="46" fill="oklch(0.29 0.085 265)" />
      </svg>
      <motion.p className="label" {...pop(0)} style={{ marginBottom: "1rem" }}>Registration received · {j.label}</motion.p>
      <motion.h1 id="done-h" className="display" {...pop(0.1)} tabIndex={-1}>Your voice is now part of the <span className="italic">canvas.</span></motion.h1>
      <motion.p className="serif italic" {...pop(0.25)} style={{ fontSize: "clamp(1.3rem,2.4vw,2rem)", marginTop: "1.5rem", maxWidth: "30ch" }}>
        Thank you{first ? `, ${first}` : ""}, for documenting the Nigeria you aspire to see.
      </motion.p>

      <div className="done-grid">
        <motion.div {...pop(0.4)}>
          <div className="receipt" role="group" aria-label="Your registration">
            <span className="stamp">Received</span>
            <p className="label" style={{ margin: 0 }}>Registration reference</p>
            <p className="ref" style={{ margin: ".4rem 0 0" }}>{reference}</p>
            <dl>
              <div><dt>Category</dt><dd>{j.label}</dd></div>
              <div><dt>Status</dt><dd>Awaiting gallery review</dd></div>
              <div><dt>Public display</dt><dd>{values.consentPublic === "yes" ? "Consent given" : "Not consented — kept private"}</dd></div>
            </dl>
          </div>
          <ul className="next-list">
            {next.map((n, i) => <li key={i}><span className="label" aria-hidden>0{i + 1}</span><span>{n}</span></li>)}
          </ul>
          <p style={{ marginTop: "1.6rem", maxWidth: "34rem", fontSize: ".95rem", opacity: .9 }}>
            <b>Note:</b> this build runs without a server, so no confirmation email is sent yet and nothing leaves your browser. The reference above is generated locally.
          </p>
          <div className="card-actions"><Link className="btn" href="/">Back to the exhibition</Link></div>
        </motion.div>

        {citizen && quote && (
          <motion.div className="card-wrap" {...pop(0.55)}>
            <canvas ref={canvas} role="img" aria-label="Your shareable aspiration card" />
            <div className="card-actions">
              <button className="btn" onClick={share}>Share my card</button>
              <button className="btn ghost" onClick={download}>Download PNG</button>
            </div>
            {shareMsg && <p role="status" style={{ marginTop: ".6rem" }}>{shareMsg}</p>}
            <p className="label" style={{ marginTop: ".8rem", opacity: .85 }}>Shows only your quote and state — never your name.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
