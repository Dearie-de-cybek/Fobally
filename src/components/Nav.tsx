import Link from "next/link";

export function Nav() {
  return (
    <header className="nav">
      <div style={{ display: "flex", gap: ".5rem", alignItems: "stretch" }}>
        <Link href="/" className="logo-chip" aria-label="Fobally Art World Africa — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fobally-logo.jpg" alt="Fobally Art World Africa" />
        </Link>
        <Link href="/" className="mark" aria-label="The People's Canvas — home">The People&rsquo;s <i>Canvas</i></Link>
      </div>
      <nav className="navlinks label" aria-label="Primary">
        <Link href="/#exhibition">Exhibition</Link>
        <Link href="/#take-part">Take part</Link>
        <Link href="/register" className="solid">Register</Link>
      </nav>
    </header>
  );
}
