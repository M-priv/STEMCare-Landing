import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Eye,
  LockKeyhole,
  MessageSquare,
  Moon,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Sun,
  Workflow,
} from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

type StoryStep = {
  eyebrow: string;
  title: string;
  body: string;
  visual: "intent" | "spine" | "governance" | "market" | "learning";
};

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  const storedTheme = window.localStorage.getItem("stemcare-theme");
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const storySteps: StoryStep[] = [
  {
    eyebrow: "01 / What STEMCare is",
    title: "A clinical operating layer, not another chatbot.",
    body:
      "STEMCare turns patient interactions, practice policy, and clinician intent into evidence-backed drafts, actions, and shared workflow state. The clinician remains the decision maker; the system does the coordination work around them.",
    visual: "intent",
  },
  {
    eyebrow: "02 / What it changes",
    title: "Routine work moves in the background. Judgment stays visible.",
    body:
      "Expected paths such as document triage, referral chase, prescription admin, aftercare monitoring, and queue hygiene can progress through policy-clear automation. Ambiguous or higher-risk work is surfaced as a plain-language plan for clinician review.",
    visual: "spine",
  },
  {
    eyebrow: "03 / Why trust is built in",
    title: "Resident proposes. Guardian gates. Mentor learns offline.",
    body:
      "STEMCare separates generation from permission. AI can draft, classify, retrieve, and propose. Deterministic Guardian controls block unsafe actions, require evidence receipts, and escalate clinical judgment before anything material happens.",
    visual: "governance",
  },
  {
    eyebrow: "04 / Why the market feels wrong",
    title: "Most healthcare AI is sold as a feature. Care needs an operating loop.",
    body:
      "Ambient notes, generic copilots, and triage widgets can help locally, but they often leave the follow-through untouched. STEMCare is designed around the full loop: intake, evidence, plan, action, review, patient update, and learning.",
    visual: "market",
  },
  {
    eyebrow: "05 / How AI is used differently",
    title: "The model is not the product. Governed clinical work is.",
    body:
      "AI is treated as a supervised worker inside a clinical governance system: context is constrained, outputs are checked, permissions are explicit, and learning happens from reviewed outcomes rather than uncontrolled live experimentation.",
    visual: "learning",
  },
];

const marketRows = [
  {
    typical: "A chatbot or copilot that waits for prompts.",
    stemcare: "A case-first operating surface that resolves context, proposes a plan, and updates shared work.",
  },
  {
    typical: "An ambient note tool that ends at documentation.",
    stemcare: "A follow-through loop that connects notes to tasks, referrals, results, aftercare, and patient status.",
  },
  {
    typical: "AI confidence scores presented as reassurance.",
    stemcare: "Evidence receipts, Guardian decisions, and explicit review points shown beside the action.",
  },
  {
    typical: "Automation framed as clinician replacement.",
    stemcare: "Automation for policy-clear work; clinician judgment for diagnosis, prescribing, risk, and preference.",
  },
];

const modules = [
  {
    icon: MessageSquare,
    title: "Patient intake and report prep",
    body:
      "Patients can provide structured context before review. Clinicians receive a concise, safety-screened handoff rather than a raw transcript.",
  },
  {
    icon: Workflow,
    title: "Clinical Suite",
    body:
      "A goal-to-action surface for ambiguous work: preparing cases, investigating stuck workflows, and coordinating next steps.",
  },
  {
    icon: Database,
    title: "Practice Brain",
    body:
      "A governed practice knowledge layer for local SOPs, pathway rules, guideline references, and source freshness.",
  },
  {
    icon: Route,
    title: "Referral and aftercare loops",
    body:
      "Designed to track handoffs beyond the draft: chase, acknowledgement, booking, patient updates, escalation, and closure.",
  },
];

const leadershipReasons = [
  "Reduces invisible operational load without removing clinical accountability.",
  "Creates a shared record of why an action was proposed, allowed, blocked, or escalated.",
  "Turns AI from a front-door experiment into a governed care operations system.",
  "Lets practices start with narrow workflows and expand only where evidence supports it.",
];

function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("stemcare-theme", theme);
  }, [theme]);

  useEffect(() => {
    const scrollRetries: number[] = [];

    const scrollToCurrentHash = () => {
      const targetId = window.location.hash.replace("#", "");
      if (!targetId) return;

      const scrollToTarget = () => {
        document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "auto" });
      };

      window.requestAnimationFrame(scrollToTarget);
      [250, 750, 1400].forEach((delay) => {
        scrollRetries.push(window.setTimeout(scrollToTarget, delay));
      });
    };

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);

    return () => {
      window.removeEventListener("hashchange", scrollToCurrentHash);
      scrollRetries.forEach((scrollRetry) => window.clearTimeout(scrollRetry));
    };
  }, []);

  return (
    <main>
      <Navigation
        theme={theme}
        onThemeToggle={() => setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")}
      />
      <Hero />
      <IntroBand />
      <StorySection />
      <MarketContrast />
      <AiDifference />
      <ClinicalLeadCase />
      <PilotCta />
      <Footer />
    </main>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const mediaY = useTransform(scrollY, [0, 900], [0, -110]);
  const textY = useTransform(scrollY, [0, 700], [0, 44]);
  const textOpacity = useTransform(scrollY, [0, 620], [1, 0.35]);
  const boardY = useTransform(scrollY, [0, 900], [0, -76]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__ambient" aria-hidden="true" />
      <motion.div className="hero__content" style={{ y: textY, opacity: textOpacity }}>
        <p className="eyebrow hero__eyebrow">Safety-governed clinical operations</p>
        <h1 id="hero-title" aria-label="STEMCare">
          <LogoLockup variant="hero" />
        </h1>
        <p className="hero__statement">
          The clinical operating system for primary care teams that need every referral, result,
          prescription, aftercare plan, and patient update to move with evidence and control.
        </p>
        <div className="hero__actions" aria-label="Primary actions">
          <a className="button button--primary" href="#pilot">
            Request clinical lead briefing <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button button--ghost" href="#difference">
            See why it is different
          </a>
        </div>
      </motion.div>
      <motion.div className="hero__media" style={{ y: mediaY }}>
        <img src="/stemcare-product-hero.jpg" alt="Floating glass interface showing abstract clinical workflow panels" />
      </motion.div>
      <motion.div className="hero__board" style={{ y: boardY }} aria-hidden="true">
        <div className="board__topline">
          <span className="status-dot" />
          Clinical Suite
        </div>
        <p className="board__command">Get this patient ready for review this afternoon.</p>
        <div className="board__plan">
          <span>Context gathered</span>
          <span>Evidence checked</span>
          <span>Guardian review</span>
        </div>
        <div className="board__notice">
          <ShieldCheck size={16} />
          Clinician approval required before clinical action.
        </div>
      </motion.div>
      <div className="hero__next-hint" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

function LogoLockup({ variant }: { variant: "nav" | "hero" }) {
  return (
    <span className={`logo-lockup logo-lockup--${variant}`} aria-hidden="true">
      <img className="logo-lockup__image logo-lockup__image--light" src="/stemcare-logo.png" alt="" />
      <img className="logo-lockup__image logo-lockup__image--dark" src="/stemcare-logo-on-dark.png" alt="" />
    </span>
  );
}

function Navigation({
  theme,
  onThemeToggle,
}: {
  theme: ThemeMode;
  onThemeToggle: () => void;
}) {
  const isDark = theme === "dark";

  return (
    <nav className="nav" aria-label="Primary navigation">
      <a className="nav__brand" href="#top" aria-label="STEMCare home">
        <LogoLockup variant="nav" />
      </a>
      <div className="nav__actions">
        <div className="nav__links">
          <a href="#platform">Platform</a>
          <a href="#difference">Difference</a>
          <a href="#clinical-leads">Clinical leads</a>
          <a href="#pilot">Pilot</a>
        </div>
        <button
          className="nav__theme"
          type="button"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDark}
          onClick={onThemeToggle}
        >
          {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
      </div>
    </nav>
  );
}

function IntroBand() {
  return (
    <section className="intro-band" aria-label="STEMCare thesis">
      <div className="section-shell intro-band__grid">
        <div>
          <p className="eyebrow">The thesis</p>
          <h2>Healthcare does not need more AI theatre. It needs governed follow-through.</h2>
        </div>
        <p>
          The pressure in primary care is not only consultation volume. It is the operational drag
          around care: documents, results, referrals, prescribing, admin queues, patient updates,
          and unresolved handoffs. STEMCare is designed to help teams move that work safely through
          a shared clinical operating loop.
        </p>
      </div>
    </section>
  );
}

function StorySection() {
  const storyRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [36, -36]);
  const visualRotate = useTransform(scrollYProgress, [0, 1], [-1.4, 1.4]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = Math.min(storySteps.length - 1, Math.floor(latest * storySteps.length));
    setActive(next);
  });

  const activeStep = storySteps[active];

  return (
    <section className="story" id="platform" ref={storyRef} aria-labelledby="story-title">
      <div className="story__sticky">
        <div className="story__rail" aria-hidden="true">
          <motion.span style={{ scaleY: scrollYProgress }} />
        </div>
        <div className="section-shell story__grid">
          <div className="story__copy">
            <p className="eyebrow">{activeStep.eyebrow}</p>
            <motion.div
              key={activeStep.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <h2 id="story-title">{activeStep.title}</h2>
              <p>{activeStep.body}</p>
            </motion.div>
          </div>
          <motion.div
            className="story__visual"
            style={{ y: visualY, rotate: visualRotate }}
            aria-label="Reactive STEMCare product visual"
          >
            <StoryVisual step={activeStep.visual} />
          </motion.div>
        </div>
        <div className="story__indexes" aria-hidden="true">
          {storySteps.map((step, index) => (
            <span key={step.eyebrow} className={index === active ? "is-active" : ""}>
              {String(index + 1).padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>
      <div className="story__scroll-space" aria-hidden="true" />
    </section>
  );
}

function StoryVisual({ step }: { step: StoryStep["visual"] }) {
  if (step === "spine") return <WorkflowSpine />;
  if (step === "governance") return <GovernanceStack />;
  if (step === "market") return <MarketLoopVisual />;
  if (step === "learning") return <LearningLoopVisual />;
  return <IntentSurface />;
}

function IntentSurface() {
  return (
    <div className="mock mock--intent">
      <div className="mock__header">
        <span><Sparkles size={16} /> Goal interpreted</span>
        <strong>Live plan</strong>
      </div>
      <div className="command-box">
        <span>Clinician goal</span>
        <p>Prepare Amina Khan for possible urgent respiratory review.</p>
      </div>
      <div className="plan-list">
        <div><CheckCircle2 size={17} /> Pull recent symptoms, medication, allergies</div>
        <div><CheckCircle2 size={17} /> Check local escalation rules and red flags</div>
        <div><Activity size={17} /> Draft review packet and patient update</div>
      </div>
      <div className="receipt-strip">
        <span>Evidence receipt</span>
        <span>3 sources</span>
        <span>Guardian: review required</span>
      </div>
    </div>
  );
}

function WorkflowSpine() {
  return (
    <div className="mock mock--spine">
      {["Patient", "Case", "Work item", "Review", "Follow-up"].map((item, index) => (
        <div className="spine-node" key={item}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item}</strong>
          <small>{index < 3 ? "Shared state updated" : "Clinician visible"}</small>
        </div>
      ))}
    </div>
  );
}

function GovernanceStack() {
  return (
    <div className="mock mock--governance">
      <div className="governance-card resident">
        <BrainCircuit size={22} />
        <strong>Resident</strong>
        <span>Proposes draft, plan, or next-best action</span>
      </div>
      <div className="governance-card guardian">
        <ShieldCheck size={22} />
        <strong>Guardian</strong>
        <span>Checks scope, policy, evidence, and risk</span>
      </div>
      <div className="governance-card mentor">
        <RefreshCw size={22} />
        <strong>Mentor</strong>
        <span>Learns offline from reviewed outcomes</span>
      </div>
    </div>
  );
}

function MarketLoopVisual() {
  return (
    <div className="mock mock--market">
      <div className="market-card muted">
        <span>Typical AI</span>
        <p>Draft ends here</p>
      </div>
      <div className="market-arrow" />
      <div className="market-card active">
        <span>STEMCare loop</span>
        <p>Draft, route, review, action, update, learn</p>
      </div>
    </div>
  );
}

function LearningLoopVisual() {
  return (
    <div className="mock mock--learning">
      {["Accepted", "Edited", "Blocked", "Escalated"].map((signal) => (
        <div key={signal} className="signal-row">
          <span>{signal}</span>
          <div className="signal-bar"><i /></div>
        </div>
      ))}
      <div className="learning-footer">
        <LockKeyhole size={17} />
        Reviewed outcomes improve offline harnesses before any live promotion.
      </div>
    </div>
  );
}

function MarketContrast() {
  return (
    <section className="market" id="difference" aria-labelledby="market-title">
      <div className="section-shell">
        <div className="section-heading">
          <p className="eyebrow">Different by design</p>
          <h2 id="market-title">What clinical teams are usually sold versus what STEMCare is building.</h2>
        </div>
        <div className="contrast-table" role="table" aria-label="Market contrast">
          <div className="contrast-row contrast-row--head" role="row">
            <div role="columnheader">Typical healthcare AI</div>
            <div role="columnheader">STEMCare position</div>
          </div>
          {marketRows.map((row) => (
            <div className="contrast-row" role="row" key={row.typical}>
              <div role="cell">{row.typical}</div>
              <div role="cell">{row.stemcare}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiDifference() {
  return (
    <section className="ai-difference" aria-labelledby="ai-title">
      <div className="section-shell ai-difference__grid">
        <div className="ai-difference__copy">
          <p className="eyebrow">How AI is used</p>
          <h2 id="ai-title">Not magic. Not autonomy theatre. A supervised clinical workforce.</h2>
          <p>
            STEMCare treats models as one part of a governed operating system. The AI is useful
            because it has the right context, narrow permissions, visible receipts, and a clear
            place to stop.
          </p>
        </div>
        <div className="principle-grid">
          <Principle icon={Eye} title="Visible reasoning surface">
            Clinicians see the plan, sources, assumptions, blocked actions, and approval requests.
          </Principle>
          <Principle icon={ShieldCheck} title="Deterministic safety layer">
            Guardian rules can veto, require evidence, or escalate when risk crosses a boundary.
          </Principle>
          <Principle icon={ClipboardCheck} title="Outcome learning">
            Mentor improves from reviewed edits, rejects, completions, and escalations offline.
          </Principle>
        </div>
      </div>
    </section>
  );
}

function Principle({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: string;
}) {
  return (
    <article className="principle-card">
      <Icon size={23} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function ClinicalLeadCase() {
  return (
    <section className="clinical-leads" id="clinical-leads" aria-labelledby="lead-title">
      <div className="section-shell">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">For clinicians and clinical leads</p>
            <h2 id="lead-title">Why this can change the way a practice operates.</h2>
          </div>
          <p>
            The promise is not that AI replaces clinical skill. The promise is that clinical skill
            is no longer buried under unmanaged handoffs, admin drag, and disconnected tools.
          </p>
        </div>
        <div className="clinical-photo-panel">
          <img
            src="/clinical-lead-review.jpg"
            alt="Clinicians reviewing a governed workflow interface on a tablet"
          />
          <div className="clinical-photo-card">
            <span>How this sells to clinical leads</span>
            <strong>It does not ask clinicians to trust a black box. It shows the work, the source, the stop point, and the reason.</strong>
          </div>
        </div>
        <div className="module-grid">
          {modules.map(({ icon: Icon, title, body }) => (
            <article className="module-card" key={title}>
              <Icon size={24} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="leadership-panel">
          <h3>Clinical leadership value</h3>
          <div className="leadership-panel__items">
            {leadershipReasons.map((reason) => (
              <p key={reason}><CheckCircle2 size={18} aria-hidden="true" />{reason}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PilotCta() {
  return (
    <section className="pilot" id="pilot" aria-labelledby="pilot-title">
      <div className="section-shell pilot__grid">
        <div>
          <p className="eyebrow">Pre-launch clinical briefing</p>
          <h2 id="pilot-title">Bring STEMCare into the room before the product launches.</h2>
          <p>
            Use this site to open conversations with GPs, practice managers, PCN leaders,
            urgent-care teams, and clinical transformation leads. The strongest first pilots are
            narrow, measurable workflows where teams already feel the operational pain every week.
          </p>
          <div className="pilot__actions">
            <a className="button button--primary" href="mailto:stemglobalmanagement@gmail.com?subject=STEMCare%20clinical%20lead%20briefing">
              Request pilot conversation <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button button--ghost" href="#platform">
              Revisit the platform thesis
            </a>
          </div>
        </div>
        <div className="pilot-card" aria-label="Recommended pilot shape">
          <span>Recommended first pilot</span>
          <h3>One workflow. One team. One safety boundary.</h3>
          <ul>
            <li>Pick a high-friction queue such as results, referrals, prescriptions, or aftercare.</li>
            <li>Define what AI may draft, retrieve, route, and never decide.</li>
            <li>Measure time saved, handoff quality, review burden, and escalation safety.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="section-shell footer__inner">
        <a className="nav__brand" href="#top" aria-label="STEMCare home">
          <LogoLockup variant="nav" />
        </a>
        <p>Clinical operations, governed by clinicians.</p>
        <div className="footer__links">
          <a href="#platform">Platform</a>
          <a href="#difference">Difference</a>
          <a href="#pilot">Pilot</a>
          <a href="mailto:stemglobalmanagement@gmail.com?subject=STEMCare%20clinical%20lead%20briefing">Contact</a>
        </div>
      </div>
      <p className="section-shell footer__notice">
        Pre-launch product information only. STEMCare is not a medical device and does not provide
        medical advice; clinicians retain responsibility for clinical decisions.
      </p>
    </footer>
  );
}

export default App;
