import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Brain, Users, BarChart2, Layers } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 1600, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

function Stat({ value, suffix, label, started, color }: {
  value: number; suffix: string; label: string; started: boolean; color?: string;
}) {
  const count = useCountUp(value, 1600, started);
  return (
    <div className="lp-rec-stat-card">
      <p className="lp-rec-stat-num" style={color ? { color } : {}}>
        {count.toLocaleString()}{suffix}
      </p>
      <p className="lp-rec-stat-label">{label}</p>
    </div>
  );
}

export function LandingPage() {
  const recRef = useRef<HTMLDivElement>(null);
  const [recVisible, setRecVisible] = useState(false);

  useEffect(() => {
    const el = recRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRecVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-root">

      {/* ── NAV ────────────────────────────────────────────────── */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo">
            <span className="lp-logo-icon">
              <span className="lp-logo-dot lp-logo-dot--outer" />
              <span className="lp-logo-dot lp-logo-dot--inner" />
            </span>
            <span className="lp-logo-text">Folio</span>
          </Link>
          <nav className="lp-nav-links">
            <a href="#platform" className="lp-nav-link">Platform</a>
            <a href={import.meta.env.VITE_RECRUITER_URL || 'http://localhost:5174'} className="lp-nav-link">For Recruiters</a>
            <a href="#how" className="lp-nav-link">How it works</a>
          </nav>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-ghost">Sign in</Link>
            <Link to="/signup" className="lp-btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="lp-hero" id="platform">
        <div className="lp-hero-inner">
          <div className="lp-badge">
            <span className="lp-badge-icon">✦</span>
            Portfolio-first intelligence
          </div>

          <h1 className="lp-hero-headline">
            Your work<br />
            <em>speaks first.</em>
          </h1>

          <p className="lp-hero-sub">
            Folio Space evaluates design talent by portfolio quality
            — not resume keywords. Get matched based on actual
            work, specific skills, and verifiable output.
          </p>

          <div className="lp-hero-ctas">
            <Link to="/signup" className="lp-btn-primary lp-btn-large">
              Analyze my portfolio <ArrowRight className="lp-btn-arrow" />
            </Link>
            <a href={import.meta.env.VITE_RECRUITER_URL || 'http://localhost:5174'} className="lp-btn-outline lp-btn-large">
              I'm hiring design talent
            </a>
          </div>
        </div>

        {/* Mockup */}
        <div className="lp-mockup-wrap">
          <div className="lp-mockup">
            <div className="lp-mockup-chrome">
              <span className="lp-chrome-dot" style={{ background: '#ff5f57' }} />
              <span className="lp-chrome-dot" style={{ background: '#ffbd2e' }} />
              <span className="lp-chrome-dot" style={{ background: '#28ca41' }} />
              <span className="lp-chrome-url">folio.space/intelligence</span>
            </div>
            <div className="lp-mockup-body">
              {/* Left panel — highlighted with blue border */}
              <div className="lp-mockup-left lp-mockup-left--highlight">
                <p className="lp-mock-label">Portfolio Score</p>
                <p className="lp-mock-score">87</p>
                <p className="lp-mock-type">UX/Product Design</p>
                <div className="lp-mock-bars">
                  {[
                    { name: 'Visual craft', val: 92 },
                    { name: 'Process docs', val: 68 },
                    { name: 'Tool depth', val: 85 },
                  ].map((bar) => (
                    <div key={bar.name} className="lp-mock-bar-row">
                      <div className="lp-mock-bar-meta">
                        <span>{bar.name}</span><span>{bar.val}</span>
                      </div>
                      <div className="lp-mock-bar-track">
                        <div className="lp-mock-bar-fill" style={{ width: `${bar.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right panel */}
              <div className="lp-mockup-right">
                <p className="lp-mock-label">Intelligence Report</p>
                <div className="lp-mock-findings">
                  <div className="lp-mock-card lp-mock-card--finding">
                    <span className="lp-mock-tag lp-mock-tag--orange">Finding</span>
                    <p>2 of 4 case studies don't show your design process. Add wireframes to improve your UX match score.</p>
                  </div>
                  <div className="lp-mock-card lp-mock-card--match">
                    <span className="lp-mock-tag lp-mock-tag--mint">Match</span>
                    <p>Your work aligns with 14 active UX roles at B2B SaaS companies.</p>
                  </div>
                  <div className="lp-mock-card lp-mock-card--strength">
                    <span className="lp-mock-tag lp-mock-tag--indigo">Strength</span>
                    <p>Strong visual systems thinking — your component documentation is above 90th percentile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────── */}
      <div className="lp-stats-bar">
        <div className="lp-stats-inner">
          <div><p className="lp-stat-num">4,200+</p><p className="lp-stat-label">Portfolios analyzed</p></div>
          <div><p className="lp-stat-num">89%</p><p className="lp-stat-label">Match accuracy rate</p></div>
          <div><p className="lp-stat-num">2.4×</p><p className="lp-stat-label">Faster shortlisting</p></div>
          <div><p className="lp-stat-num">340+</p><p className="lp-stat-label">Design teams hiring</p></div>
        </div>
      </div>

      {/* ── THREE PODS ──────────────────────────────────────────── */}
      <section className="lp-pods" id="how">
        <div className="lp-pods-inner">
          <h2 className="lp-pods-headline">
            Three intelligence pods.<br />
            One honest picture.
          </h2>
          <div className="lp-pods-grid">
            <div className="lp-pod-card">
              <div className="lp-pod-icon lp-pod-icon--indigo"><Target size={20} /></div>
              <h3 className="lp-pod-title">Portfolio Intelligence</h3>
              <p className="lp-pod-desc">Extracts skills, domains, and tools from your actual work. Scores each case study on process visibility, visual craft, and tool depth.</p>
            </div>
            <div className="lp-pod-card">
              <div className="lp-pod-icon lp-pod-icon--mint"><Zap size={20} /></div>
              <h3 className="lp-pod-title">AI Matchmaking</h3>
              <p className="lp-pod-desc">Matches your real output to open roles. No keyword guessing — just work evidence mapped to what teams actually need.</p>
            </div>
            <div className="lp-pod-card">
              <div className="lp-pod-icon lp-pod-icon--orange"><Brain size={20} /></div>
              <h3 className="lp-pod-title">Assessment &amp; Intelligence</h3>
              <p className="lp-pod-desc">8-dimension evaluation covering design thinking, craft, and problem-solving. Retakeable, transparent, and explained in plain language.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="lp-steps">
        <div className="lp-steps-inner">
          <h2 className="lp-steps-headline">Three steps. No resume required.</h2>
          <p className="lp-steps-sub">
            Connect your portfolio once. Get a ranked intelligence report and matched
            opportunities immediately.
          </p>

          <div className="lp-steps-grid">
            <div className="lp-step">
              <p className="lp-step-num">01</p>
              <h3 className="lp-step-title">Connect your portfolio</h3>
              <p className="lp-step-desc">
                Link Behance, Dribbble, your personal site, or upload a PDF. Folio Space reads
                your actual work, not your job titles.
              </p>
              <div className="lp-step-badges">
                <span className="lp-step-badge">Be</span>
                <span className="lp-step-badge">Dr</span>
                <span className="lp-step-badge">PDF</span>
              </div>
            </div>

            <div className="lp-step">
              <p className="lp-step-num">02</p>
              <h3 className="lp-step-title">Get your intelligence report</h3>
              <p className="lp-step-desc">
                AI extracts your skills, tools, and domains. Each case study is scored on
                process visibility, visual craft, and impact. Takes under 60 seconds.
              </p>
            </div>

            <div className="lp-step">
              <p className="lp-step-num">03</p>
              <h3 className="lp-step-title">Match to roles that fit</h3>
              <p className="lp-step-desc">
                Your report is matched against active roles. You see your score, what's
                missing, and exactly why a role fits — before you apply.
              </p>
            </div>
          </div>

          <div className="lp-steps-cta">
            <Link to="/signup" className="lp-btn-primary lp-btn-large">
              Analyze my portfolio free <ArrowRight className="lp-btn-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOR RECRUITERS ──────────────────────────────────────── */}
      <section className="lp-rec" id="recruiters" ref={recRef}>
        <div className="lp-rec-inner">
          {/* Left column */}
          <div className="lp-rec-left">
            <div className="lp-rec-badge">
              <Users size={12} />
              For Recruiters
            </div>
            <h2 className="lp-rec-headline">
              Hire for work,<br />not keywords.
            </h2>
            <p className="lp-rec-sub">
              Folio Space gives you a portfolio intelligence report for every applicant
              — scored, ranked, and matched to your role requirements. No more manually
              reviewing 40 Behance links.
            </p>

            <ul className="lp-rec-features">
              <li className="lp-rec-feature">
                <span className="lp-rec-feat-icon"><Target size={14} /></span>
                <div>
                  <p className="lp-rec-feat-title">Portfolio-first evaluation</p>
                  <p className="lp-rec-feat-desc">Every candidate is scored on visual craft, process documentation, and domain depth — before you read a word.</p>
                </div>
              </li>
              <li className="lp-rec-feature">
                <span className="lp-rec-feat-icon"><Zap size={14} /></span>
                <div>
                  <p className="lp-rec-feat-title">AI match scoring</p>
                  <p className="lp-rec-feat-desc">Each applicant gets a match percentage against your specific role. Filter to 85%+ in one click.</p>
                </div>
              </li>
              <li className="lp-rec-feature">
                <span className="lp-rec-feat-icon"><BarChart2 size={14} /></span>
                <div>
                  <p className="lp-rec-feat-title">Side-by-side comparison</p>
                  <p className="lp-rec-feat-desc">Compare up to 3 candidates across portfolio score, assessment results, and skill match in a single view.</p>
                </div>
              </li>
            </ul>

            <Link to="/signup" className="lp-btn-primary lp-btn-large lp-rec-cta">
              I'm hiring design talent <ArrowRight className="lp-btn-arrow" />
            </Link>
          </div>

          {/* Right column — 2×2 stat cards */}
          <div className="lp-rec-right">
            <div className="lp-rec-stats">
              <Stat value={24} suffix="×" label="Faster shortlisting" started={recVisible} color="var(--color-indigo-400)" />
              <Stat value={89} suffix="%" label="Match accuracy" started={recVisible} color="var(--color-indigo-400)" />
              <Stat value={340} suffix="+" label="Design teams hiring" started={recVisible} color="var(--color-indigo-400)" />
              <div className="lp-rec-stat-card">
                <p className="lp-rec-stat-num" style={{ color: 'var(--color-orange)' }}>12 min</p>
                <p className="lp-rec-stat-label">Avg. review time per candidate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-headline">Stop applying blind.</h2>
          <p className="lp-cta-sub">
            Get your portfolio analyzed, see exactly where you rank,<br />
            and match to roles where your work fits.
          </p>
          <Link to="/signup" className="lp-btn-primary lp-btn-large">
            Analyze my portfolio free <ArrowRight className="lp-btn-arrow" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <Link to="/" className="lp-logo">
            <span className="lp-logo-icon lp-logo-icon--sm">
              <span className="lp-logo-dot lp-logo-dot--outer" />
              <span className="lp-logo-dot lp-logo-dot--inner" />
            </span>
            <span className="lp-logo-text">Folio</span>
          </Link>
          <p className="lp-footer-copy">© 2026 Folio Space. Portfolio-first career intelligence.</p>
        </div>
      </footer>

    </div>
  );
}
