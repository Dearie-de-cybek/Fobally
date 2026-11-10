// Slow, quiet animated background: drifting resist-dye rings, a breathing sun, and brush strokes that draw themselves.
// Pure SVG + CSS (no JS loop); disabled automatically by prefers-reduced-motion.
export function Backdrop({ tone = "light", fixed = true }: { tone?: "light" | "dark"; fixed?: boolean }) {
  const ring = tone === "dark" ? "oklch(0.945 0.025 85)" : "oklch(0.29 0.085 265)";
  const sun = "oklch(0.78 0.14 82)";
  const stroke = tone === "dark" ? "oklch(0.78 0.14 82)" : "oklch(0.55 0.155 40)";
  return (
    <div className={`backdrop ${tone}${fixed ? " fixed" : ""}`} aria-hidden>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`rg-${tone}`} width="64" height="64" patternUnits="userSpaceOnUse">
            <circle cx="32" cy="32" r="20" fill="none" stroke={ring} strokeWidth="3" />
            <circle cx="32" cy="32" r="6" fill={ring} />
          </pattern>
        </defs>
        <circle className="bd-sun" cx="1280" cy="250" r="190" fill={sun} />
        <g className="bd-drift-a"><circle cx="260" cy="640" r="300" fill={`url(#rg-${tone})`} /></g>
        <g className="bd-drift-b"><circle cx="1180" cy="760" r="220" fill={`url(#rg-${tone})`} /></g>
        <g className="bd-drift-c"><rect x="640" y="-80" width="300" height="300" fill={`url(#rg-${tone})`} transform="rotate(18 790 70)" /></g>
        <g fill="none" stroke={stroke} strokeLinecap="round">
          <path className="bd-stroke s1" pathLength="1" d="M-40 560 C 260 380, 440 760, 760 540 S 1240 300, 1660 460" strokeWidth="18" />
          <path className="bd-stroke s2" pathLength="1" d="M-40 190 C 320 40, 520 330, 900 160 S 1300 40, 1660 120" strokeWidth="10" />
        </g>
      </svg>
    </div>
  );
}
