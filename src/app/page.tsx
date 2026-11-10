import Link from "next/link";
import { HeroArt, CatArt, ScopeMark, StateMark } from "@/components/Art";
import { Reveal } from "@/components/Reveal";
import { Mediums } from "@/components/Mediums";
import { SITE } from "@/lib/site";
import { loadArt } from "@/lib/artfiles";

const TAPE = ["Imagine the nation", "Express the vision", "Document the future", "Every nation begins with an imagination"];

const OBJECTIVES = [
  ["Record the aspiration", "Gather what Nigerians actually want their country to become — in their own words and in their own images."],
  ["Hold leadership to a picture", "Offer a citizen-made reference for the 2027–2031 governance period: what responsible leadership could look like."],
  ["Honour responsible citizenship", "Treat nation-building as shared work, with duties as well as demands."],
  ["Platform artists", "Give established and emerging Nigerian artists a national stage for work that engages the country's future."],
  ["Connect the states to the centre", "Make room for state-level voices alongside a national conversation."],
  ["Build a lasting archive", "Keep a respectful, consent-based record that artists, scholars and citizens can return to."],
];

const INVITES = [
  ["Artists", "artist", "Submit a work that interprets an aspired Nigeria. Accepted works are chosen by gallery review."],
  ["Volunteers", "volunteer", "Reception, stage, photography, content — help the exhibition happen."],
  ["Collaborators", "collaborator", "Institutions and collectives: propose a programme, a workshop, a partnership."],
  ["Sponsors", "partner", "Fund, host, brand or amplify. Join as a financial, organisational, brand or media partner."],
] as const;

function ScopePhoto({ photo }: { photo: { src: string; credit?: { title?: string } } }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="scope-img" src={photo.src} alt={photo.credit?.title ?? ""} />;
}

export default function Home() {
  const art = loadArt();
  const tape = [...TAPE, ...TAPE, ...TAPE, ...TAPE];
  return (
    <>
      <section className="hero" aria-labelledby="h1">
        <h1 id="h1" className="display hero-title">
          <span>The People&rsquo;s</span>
          <span className="l2">Canvas</span>
          <span className="l3 italic serif">Paint your aspired Nigeria 2026</span>
        </h1>
        <div className="hero-art"><HeroArt photo={art.hero} /></div>
        <div className="hero-copy">
          <p className="serif quote italic">&ldquo;Imagine the nation. Express the vision. Document the future.&rdquo;</p>
          <p>An invitation to Nigerian artists and citizens to imagine, create and document the Nigeria they aspire to see between 2027 and 2031.</p>
          <div className="cta-row">
            <Link className="btn" href="/register">Document your Nigeria <span className="arr">→</span></Link>
            <Link className="btn ghost" href="#exhibition">Explore the exhibition</Link>
          </div>
        </div>
        <div className="tape label" aria-hidden><div className="tape-track">{tape.map((t, i) => <span key={i}>{t} ✺</span>)}</div></div>
      </section>

      <section className="sec" id="exhibition">
        <div className="wrap">
          <Reveal><p className="label" style={{ color: "var(--laterite)" }}>The initiative</p></Reveal>
          <Reveal><h2 className="display statement">Every nation begins with an <em className="italic">imagination.</em> What does yours look like?</h2></Reveal>
          <div className="intro-grid">
            <Reveal>
              <p className="dropcap serif" style={{ fontSize: "1.35rem", lineHeight: 1.45 }}>
                <b style={{ fontWeight: 600 }}>Paint and Document Your Aspired Nigeria</b> is a conference and national art exhibition organised by {SITE.organiser}. It asks Nigerians — artists and citizens, established and emerging — to put the country they want on record, as paint, clay, line, print and word.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p>Nigerian artists have long pictured the nation before it was finished — the Zaria Art Society&rsquo;s 1958 call for a &ldquo;natural synthesis&rdquo; is one such moment. This exhibition continues that habit of looking forward, at a time when citizens are weighing what they expect from {SITE.period}.</p>
              <p>Everything you share is yours. Aspirations and artwork are shown publicly only if you say so.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal><h2 className="display" style={{ fontSize: "clamp(2.4rem,6vw,5.5rem)" }}>What we <span className="italic" style={{ color: "var(--laterite)" }}>aim</span> to do</h2></Reveal>
          <div className="objs">
            {OBJECTIVES.map(([t, d], i) => (
              <Reveal key={t} delay={(i % 2) * 0.08} className="obj">
                <span className="n">{i + 1}</span>
                <div><h3>{t}</h3><p>{d}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec dark" aria-labelledby="mediums-h">
        <div className="wrap">
          <Reveal><p className="label" style={{ color: "var(--ochre)" }}>Accepted mediums</p></Reveal>
          <Reveal><h2 id="mediums-h" className="display" style={{ fontSize: "clamp(2.4rem,6vw,5.5rem)" }}>Six ways to <span className="italic" style={{ color: "var(--ochre)" }}>say it</span></h2></Reveal>
          <Mediums art={art} />
        </div>
      </section>

      <section className="sec" id="take-part">
        <div className="wrap split">
          <div>
            <Reveal><p className="label" style={{ color: "var(--laterite)" }}>Who can take part</p></Reveal>
            <Reveal><h2 className="display" style={{ fontSize: "clamp(2.4rem,5vw,4.6rem)", marginBottom: "1rem" }}>Anyone who <span className="italic">cares</span> where this goes.</h2></Reveal>
            <Reveal><p style={{ color: "var(--ink-soft)", maxWidth: "26rem" }}>You do not need to be an artist to document your Nigeria. You need an opinion about the country and the willingness to say it.</p></Reveal>
          </div>
          <Reveal delay={0.1}>
            <ol className="who" style={{ listStyle: "none" }}>
              <li><b>Nigerian citizens</b>Anyone who holds Nigerian citizenship, at home or abroad, of any age.</li>
              <li><b>Established and emerging artists</b>Painters, sculptors, ceramicists, draughtspeople and printmakers.</li>
              <li><b>Volunteers</b>People who want to help the exhibition run well.</li>
              <li><b>Organisations and sponsors</b>Institutions, collectives, brands and media houses that want to build with us.</li>
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="sec ochre" style={{ paddingBlock: "clamp(3rem,7vw,6rem)" }}>
        <div className="wrap">
          <Reveal><p className="label">National and state-level scope</p></Reveal>
          <Reveal><h2 className="display" style={{ fontSize: "clamp(2rem,4.6vw,4.2rem)", maxWidth: "18ch", marginBottom: "2rem" }}>One nation. Thirty-six states and the FCT. Both count.</h2></Reveal>
          <Reveal>
            <div className="scope">
              <div className={`nat${art.national ? " has-photo" : ""}`}>
                {art.national && <ScopePhoto photo={art.national} />}
                <div><h3 className="display">National</h3><p style={{ maxWidth: "28ch" }}>What Nigeria as a whole should become: policy, leadership, institutions, shared symbols.</p></div>
                <div className="scope-foot">
                  <div style={{ width: "4.5rem" }}><ScopeMark fg="currentColor" /></div>
                  {art.national?.credit && <span className="label cap">{art.national.credit.title} · {art.national.credit.source}</span>}
                </div>
              </div>
              <div className={`sta${art.state ? " has-photo" : ""}`}>
                {art.state && <ScopePhoto photo={art.state} />}
                <div><h3 className="display">State-level</h3><p style={{ maxWidth: "28ch" }}>What your state needs: the roads, schools, clinics and cultures closest to home.</p></div>
                <div className="scope-foot">
                  <div style={{ width: "4.5rem" }}><StateMark fg="currentColor" /></div>
                  {art.state?.credit && <span className="label cap">{art.state.credit.title} · {art.state.credit.source}</span>}
                </div>
              </div>
            </div>
          </Reveal>
          <p style={{ marginTop: "1.2rem", maxWidth: "46rem" }}>Citizens, artists and collaborators can choose national, state-level, or both when they register.</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal><p className="label" style={{ color: "var(--laterite)" }}>An invitation</p></Reveal>
          <Reveal><h2 className="display" style={{ fontSize: "clamp(2.4rem,6vw,5.5rem)" }}>Come in. <span className="italic">Bring</span> something.</h2></Reveal>
          <div className="invite">
            {INVITES.map(([t, c, d]) => (
              <Reveal key={t}>
                <Link className="inv" href={`/register?as=${c}`}>
                  <CatArt c={c} />
                  <div><div className="t">{t}</div><div className="d">{d}</div></div>
                  <span className="go" aria-hidden>→</span>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="details" role="group" aria-label="Event details (placeholders)">
            <div className="ph"><span className="label">When</span><b>{SITE.dates}</b></div>
            <div className="ph"><span className="label">Where</span><b>{SITE.venue}</b></div>
            <div className="ph"><span className="label">Contact</span><b>{SITE.contactEmail}</b></div>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-logo" style={{ marginBottom: "2.5rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fobally-logo.jpg" alt="Fobally Art World Africa" />
          </div>
          <p className="display big">Document<br />your Nigeria.</p>
          <div style={{ marginTop: "2rem" }}><Link className="btn light" href="/register">Begin registration <span className="arr">→</span></Link></div>
          <div className="foot-row label">
            <span>{SITE.organiser}</span><span>{SITE.initiative}</span><span>Personal details are never shown publicly</span>
          </div>
        </div>
      </footer>
    </>
  );
}
