import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
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
  useReducedMotion,
  useScroll,
  useTransform,
  animate,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type StoryStep = {
  eyebrow: string;
  title: string;
  body: string;
  visual: "intent" | "spine" | "governance" | "market" | "learning";
};

type ThemeMode = "light" | "dark";

// ─── Theme ───────────────────────────────────────────────────────────────────

function getInitialTheme(): ThemeMode {
  try {
    const storedTheme = window.localStorage.getItem("stemcare-theme");
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

// ─── Content ─────────────────────────────────────────────────────────────────

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
    id: "reactive-vs-proactive",
    typicalShort: "A chatbot or copilot that waits for prompts.",
    typicalTitle: "Typical AI (The Assistant)",
    typicalProblem: "Forces clinicians into the role of prompt-engineers. You still have to manually assemble context and copy-paste between systems.",
    stemcareShort: "A case-first operating surface that resolves context and proposes plans.",
    stemcareTitle: "STEMCare (The Operating Loop)",
    stemcareSolution: "Pre-assembled clinical context. STEMCare ingests the patient history, task details, and local guidelines to present a structured, ready-to-review clinical plan.",
    icon: Sparkles
  },
  {
    id: "documentation-vs-action",
    typicalShort: "An ambient note tool that ends at documentation.",
    typicalTitle: "Typical AI (Scribble/Note)",
    typicalProblem: "Ends at documentation. It might draft a flawless consultation note, but leaves the referrals, investigations, and patient follow-ups for you to execute manually.",
    stemcareShort: "A follow-through loop that connects note context directly to workflows.",
    stemcareTitle: "STEMCare (Action-Oriented)",
    stemcareSolution: "Complete workflow follow-through. It turns consultation context directly into action—drafting referrals, checking guidelines, and preparing patient communications.",
    icon: Workflow
  },
  {
    id: "scores-vs-evidence",
    typicalShort: "AI confidence scores presented as reassurance.",
    typicalTitle: "Typical AI (Black Box)",
    typicalProblem: "Relies on generic 'confidence scores' as a proxy for safety. Without clear provenance, clinicians are forced to manually verify every claim.",
    stemcareShort: "Evidence receipts, Guardian decisions, and explicit review points.",
    stemcareTitle: "STEMCare (Auditable)",
    stemcareSolution: "Rigorous evidence receipts. Every decision is cited back to the exact paragraph in your local formularies, patient records, or national guidelines.",
    icon: ShieldCheck
  },
  {
    id: "autonomy-vs-governance",
    typicalShort: "Automation framed as clinician replacement.",
    typicalTitle: "Typical AI (Unsafe Autonomy)",
    typicalProblem: "Sells unsafe 'full autonomy' that bypasses clinical oversight, creating unacceptable clinical risk and regulatory exposure.",
    stemcareShort: "Automation for policy-clear work; clinician judgment for diagnosis and risk.",
    stemcareTitle: "STEMCare (Governed)",
    stemcareSolution: "Strict deterministic governance. Algorithmic heavy-lifting happens in the background, but material actions require explicit clinical sign-off.",
    icon: ClipboardCheck
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

// ─── Easing ──────────────────────────────────────────────────────────────────

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Reveal wrapper ───────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.65, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

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
      scrollRetries.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <main>
      <Navigation
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />
      <Hero />
      <IntroBand />
      <HumanBand />
      <StorySection />
      <MarketContrast />
      <AiDifference />
      <ClinicalLeadCase />
      <PilotCta />
      <Footer />
    </main>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function Navigation({
  theme,
  onThemeToggle,
}: {
  theme: ThemeMode;
  onThemeToggle: () => void;
}) {
  const isDark = theme === "dark";
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("nav--scrolled", window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial state
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav ref={navRef} className="nav" aria-label="Primary navigation">
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

// ─── Logo ─────────────────────────────────────────────────────────────────────

function LogoLockup({ variant }: { variant: "nav" | "hero" }) {
  return (
    <span className={`logo-lockup logo-lockup--${variant}`} aria-hidden="true">
      <img className="logo-lockup__image logo-lockup__image--light" src="/stemcare-logo.png" alt="" />
      <img className="logo-lockup__image logo-lockup__image--dark" src="/stemcare-logo-on-dark.png" alt="" />
    </span>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const heroVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const heroItemVariant = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

const heroMediaVariant = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.3 } },
};

function Hero() {
  const prefersReduced = useReducedMotion();
  const { scrollY } = useScroll();
  const mediaY = useTransform(scrollY, [0, 900], [0, -110]);
  const textY = useTransform(scrollY, [0, 700], [0, 44]);
  const textOpacity = useTransform(scrollY, [0, 620], [1, 0.35]);
  const boardY = useTransform(scrollY, [0, 900], [0, -76]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      {/* Background Video */}
      <div className="hero__video-container" aria-hidden="true">
        <video 
          className="hero__video" 
          src="/hero-bg.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
        />
      </div>

      {/* Animated ambient glow */}
      <div className="hero__ambient-glow" aria-hidden="true" />
      <div className="hero__ambient" aria-hidden="true" />

      <motion.div
        className="hero__content"
        variants={prefersReduced ? undefined : heroVariants}
        initial={prefersReduced ? false : "hidden"}
        animate="show"
        style={prefersReduced ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.p
          className="eyebrow hero__eyebrow"
          variants={prefersReduced ? undefined : heroItemVariant}
        >
          Safety-governed clinical operations
        </motion.p>
        <motion.h1
          id="hero-title"
          aria-label="STEMCare"
          variants={prefersReduced ? undefined : heroItemVariant}
        >
          <LogoLockup variant="hero" />
        </motion.h1>
        <motion.p
          className="hero__statement"
          variants={prefersReduced ? undefined : heroItemVariant}
        >
          The clinical operating system for primary care teams that need every referral, result,
          prescription, aftercare plan, and patient update to move with evidence and control.
        </motion.p>
        <motion.div
          className="hero__actions"
          aria-label="Primary actions"
          variants={prefersReduced ? undefined : heroItemVariant}
        >
          <a className="button button--primary" href="#pilot">
            Request clinical lead briefing <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button button--ghost" href="#difference">
            See why it is different
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero__media"
        variants={prefersReduced ? undefined : heroMediaVariant}
        initial={prefersReduced ? false : "hidden"}
        animate="show"
        style={prefersReduced ? undefined : { y: mediaY }}
      >
        <GovernanceAnimation />
      </motion.div>

      <motion.div
        className="hero__board"
        style={prefersReduced ? undefined : { y: boardY }}
        initial={prefersReduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.7 }}
        aria-hidden="true"
      >
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

// ─── Governance Animation ─────────────────────────────────────────────────────

type GovPhase =
  | "resident-active"
  | "flow-1"
  | "guardian-active"
  | "flow-2"
  | "mentor-active"
  | "complete";

const GOV_PHASES: { phase: GovPhase; duration: number }[] = [
  { phase: "resident-active", duration: 1400 },
  { phase: "flow-1",         duration: 800  },
  { phase: "guardian-active",duration: 1600 },
  { phase: "flow-2",         duration: 800  },
  { phase: "mentor-active",  duration: 1800 },
  { phase: "complete",       duration: 900  },
];

const TOTAL_DURATION = GOV_PHASES.reduce((s, p) => s + p.duration, 0);

function useGovPhase(): GovPhase {
  const [phase, setPhase] = useState<GovPhase>("resident-active");
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    let elapsed = 0;
    let frameId: number;
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      elapsed = (now - startTime) % TOTAL_DURATION;

      let acc = 0;
      for (const { phase: p, duration } of GOV_PHASES) {
        acc += duration;
        if (elapsed < acc) {
          setPhase(p);
          break;
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [prefersReduced]);

  return phase;
}

function MentorProgressBar({ active }: { active: boolean }) {
  const width = useMotionValue(0);

  useEffect(() => {
    if (active) {
      const controls = animate(width, 100, { duration: 1.6, ease: "easeOut" });
      return controls.stop;
    } else {
      width.set(0);
    }
  }, [active, width]);

  return (
    <div className="gov-node__progress" aria-hidden="true">
      <motion.div
        className="gov-node__progress-fill"
        style={{ width: width.get() + "%" }}
        animate={{ width: active ? "100%" : "0%" }}
        transition={active ? { duration: 1.6, ease: "easeOut" } : { duration: 0 }}
      />
    </div>
  );
}

function GovernanceAnimation() {
  const phase = useGovPhase();
  const prefersReduced = useReducedMotion();

  const residentActive = phase === "resident-active" || phase === "complete";
  const guardianActive = phase === "guardian-active" || phase === "complete";
  const mentorActive   = phase === "mentor-active"   || phase === "complete";
  const flow1Active    = phase === "flow-1" || phase === "guardian-active" || phase === "flow-2" || phase === "mentor-active" || phase === "complete";
  const flow2Active    = phase === "flow-2" || phase === "mentor-active" || phase === "complete";

  const trans = (delay = 0) =>
    prefersReduced
      ? { duration: 0 }
      : { duration: 0.45, ease: EASE_OUT_EXPO, delay };

  return (
    <div
      className="gov-animation"
      role="img"
      aria-label="Animated diagram: Resident proposes, Guardian checks, Mentor learns — STEMCare governance loop"
    >
      {/* Resident node */}
      <motion.div
        className={`gov-node${residentActive ? " gov-node--active-resident" : ""}`}
        animate={residentActive ? { scale: 1 } : { scale: 0.99 }}
        transition={trans()}
      >
        <div className="gov-node__header">
          <span className="gov-node__icon gov-node__icon--resident">
            <BrainCircuit size={18} aria-hidden="true" />
          </span>
          <span className="gov-node__title">Resident</span>
        </div>
        <motion.p
          className="gov-node__status"
          animate={{ opacity: residentActive ? 1 : 0.45 }}
          transition={trans()}
        >
          {residentActive ? "Drafting plan from clinical context…" : "Standby"}
        </motion.p>
      </motion.div>

      {/* Connector 1 */}
      <div className="gov-connector" aria-hidden="true">
        <motion.div
          className="gov-connector__line"
          animate={{ height: flow1Active ? 32 : 8, opacity: flow1Active ? 1 : 0.3 }}
          transition={trans()}
        />
      </div>

      {/* Guardian node */}
      <motion.div
        className={`gov-node${guardianActive ? " gov-node--active-guardian" : ""}`}
        animate={guardianActive ? { scale: 1 } : { scale: 0.99 }}
        transition={trans(0.05)}
      >
        <div className="gov-node__header">
          <span className="gov-node__icon gov-node__icon--guardian">
            <ShieldCheck size={18} aria-hidden="true" />
          </span>
          <span className="gov-node__title">Guardian</span>
        </div>
        <motion.p
          className="gov-node__status"
          animate={{ opacity: guardianActive ? 1 : 0.45 }}
          transition={trans()}
        >
          {guardianActive
            ? phase === "complete"
              ? "Approved — evidence receipt logged."
              : "Checking policy, scope, and risk…"
            : "Waiting for proposal"}
        </motion.p>
        {guardianActive && (
          <motion.span
            className={`gov-badge ${phase === "complete" ? "gov-badge--approved" : "gov-badge--checking"}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={trans()}
          >
            {phase === "complete" ? "✓ Approved" : "Checking…"}
          </motion.span>
        )}
      </motion.div>

      {/* Connector 2 */}
      <div className="gov-connector" aria-hidden="true">
        <motion.div
          className="gov-connector__line"
          animate={{ height: flow2Active ? 32 : 8, opacity: flow2Active ? 1 : 0.3 }}
          transition={trans()}
        />
      </div>

      {/* Mentor node */}
      <motion.div
        className={`gov-node${mentorActive ? " gov-node--active-mentor" : ""}`}
        animate={mentorActive ? { scale: 1 } : { scale: 0.99 }}
        transition={trans(0.05)}
      >
        <div className="gov-node__header">
          <motion.span
            className="gov-node__icon gov-node__icon--mentor"
            animate={mentorActive ? { rotate: [0, 360] } : { rotate: 0 }}
            transition={mentorActive ? { duration: 2.4, ease: "linear", repeat: Infinity } : { duration: 0 }}
          >
            <RefreshCw size={18} aria-hidden="true" />
          </motion.span>
          <span className="gov-node__title">Mentor</span>
        </div>
        <motion.p
          className="gov-node__status"
          animate={{ opacity: mentorActive ? 1 : 0.45 }}
          transition={trans()}
        >
          {mentorActive ? "Learning from reviewed outcome…" : "Offline"}
        </motion.p>
        <MentorProgressBar active={mentorActive} />
        {mentorActive && (
          <motion.span
            className="gov-badge gov-badge--learning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={trans(0.2)}
          >
            Offline learning
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}

// ─── Intro Band ───────────────────────────────────────────────────────────────

function IntroBand() {
  return (
    <section className="intro-band" aria-label="STEMCare thesis">
      <div className="section-shell intro-band__grid">
        <Reveal>
          <div>
            <p className="eyebrow">The thesis</p>
            <h2>Healthcare does not need more AI theatre. <em>It needs governed follow-through.</em></h2>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <p>
            The pressure in primary care is not only consultation volume. It is the operational drag
            around care: documents, results, referrals, prescribing, admin queues, patient updates,
            and unresolved handoffs. STEMCare is designed to help teams move that work safely through
            a shared clinical operating loop.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Human Band ──────────────────────────────────────────────

function HumanBand() {
  return (
    <section className="human-band" aria-labelledby="human-band-title">
      <div className="human-band__inner">
        <Reveal className="human-band__image">
          <img
            src="/practice-in-motion.jpg"
            alt="A nurse reviewing patient information on a tablet while walking through a busy NHS primary care practice, with a receptionist at a screen in the background"
            loading="lazy"
          />
        </Reveal>
        <div className="human-band__copy">
          <Reveal>
            <p className="eyebrow">Clinicians first</p>
            <h2 id="human-band-title">The people don’t change. <em>What drags them down does.</em></h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              STEMCare is not a replacement for clinical judgment. It is infrastructure that removes
              the invisible operational weight around it — so that GPs, nurses, and practice managers
              can do what they trained to do, with the time and clarity to do it well.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="human-band__stat-row">
              <div className="human-band__stat">
                <strong>40%</strong>
                <span>of GP time on non-clinical admin</span>
              </div>
              <div className="human-band__stat">
                <strong>1 in 3</strong>
                <span>referrals involve follow-up gaps</span>
              </div>
              <div className="human-band__stat">
                <strong>0</strong>
                <span>clinical decisions made by STEMCare</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Story Section ────────────────────────────────────────────────────────────

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
  // Update story step titles with em emphasis
  const storyTitles: Record<string, React.ReactNode> = {
    "A clinical operating layer, not another chatbot.": (
      <>A clinical operating layer, <em>not another chatbot.</em></>
    ),
    "Routine work moves in the background. Judgment stays visible.": (
      <>Routine work moves in the background. <em>Judgment stays visible.</em></>
    ),
    "Resident proposes. Guardian gates. Mentor learns offline.": (
      <>Resident proposes. Guardian gates. <em>Mentor learns offline.</em></>
    ),
    "Most healthcare AI is sold as a feature. Care needs an operating loop.": (
      <>Most healthcare AI is sold as a feature. <em>Care needs an operating loop.</em></>
    ),
    "The model is not the product. Governed clinical work is.": (
      <>The model is not the product. <em>Governed clinical work is.</em></>
    ),
  };
  const titleNode = storyTitles[activeStep.title] ?? activeStep.title;

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
              <h2 id="story-title">{titleNode}</h2>
              <p>{activeStep.body}</p>
            </motion.div>
          </div>
          <motion.div
            className="story__visual"
            style={{ y: visualY, rotate: visualRotate }}
            aria-label="Reactive STEMCare product visual"
          >
            <StoryVisual step={activeStep.visual} active={active} />
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

function StoryVisual({ step, active }: { step: StoryStep["visual"]; active: number }) {
  if (step === "spine") return <WorkflowSpine />;
  if (step === "governance") return <GovernanceStack stepActive={active === 2} />;
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
        <motion.div
          className="spine-node"
          key={item}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: index * 0.07 }}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item}</strong>
          <small>{index < 3 ? "Shared state updated" : "Clinician visible"}</small>
        </motion.div>
      ))}
    </div>
  );
}

function GovernanceStack({ stepActive }: { stepActive: boolean }) {
  const cards = [
    {
      cls: "resident",
      Icon: BrainCircuit,
      title: "Resident",
      body: "Proposes draft, plan, or next-best action",
    },
    {
      cls: "guardian",
      Icon: ShieldCheck,
      title: "Guardian",
      body: "Checks scope, policy, evidence, and risk",
    },
    {
      cls: "mentor",
      Icon: RefreshCw,
      title: "Mentor",
      body: "Learns offline from reviewed outcomes",
    },
  ];

  return (
    <div className="mock mock--governance">
      {cards.map(({ cls, Icon, title, body }, i) => (
        <motion.div
          key={title}
          className={`governance-card ${cls}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: stepActive ? 1 : 0.6, y: stepActive ? 0 : 8 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: stepActive ? i * 0.1 : 0 }}
        >
          <Icon size={22} />
          <strong>{title}</strong>
          <span>{body}</span>
        </motion.div>
      ))}
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

// ─── Market Contrast ──────────────────────────────────────────────────────────

function MarketContrast() {
  const [openId, setOpenId] = useState<string | null>("reactive-vs-proactive");

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="market" id="difference" aria-labelledby="market-title">
      <div className="section-shell">
        <Reveal>
          <div className="section-heading">
            <p className="eyebrow">Different by design</p>
            <h2 id="market-title">What clinical teams are usually sold <em>versus what STEMCare is building.</em></h2>
          </div>
        </Reveal>
        
        <Reveal delay={0.1}>
          <div className="accordion-list">
            {marketRows.map((row) => {
              const isOpen = openId === row.id;
              const IconComponent = row.icon;
              return (
                <div 
                  key={row.id} 
                  className={`accordion-item ${isOpen ? "accordion-item--open" : ""}`}
                >
                  <button 
                    type="button" 
                    className="accordion-trigger" 
                    onClick={() => toggleItem(row.id)}
                    aria-expanded={isOpen}
                    aria-controls={`accordion-content-${row.id}`}
                  >
                    <div className="accordion-trigger-layout">
                      <div className="accordion-trigger-typical">
                        <span className="accordion-badge accordion-badge--typical">Typical AI</span>
                        <p className="accordion-trigger-text">{row.typicalShort}</p>
                      </div>
                      <div className="accordion-divider-vs">vs</div>
                      <div className="accordion-trigger-stemcare">
                        <span className="accordion-badge accordion-badge--stemcare">
                          <IconComponent size={12} className="inline-icon" /> STEMCare
                        </span>
                        <p className="accordion-trigger-text">{row.stemcareShort}</p>
                      </div>
                    </div>
                    <motion.div 
                      className="accordion-chevron"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        id={`accordion-content-${row.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                        className="accordion-content-wrapper"
                      >
                        <div className="accordion-detail-grid">
                          <div className="accordion-detail-typical">
                            <p>{row.typicalProblem}</p>
                          </div>
                          <div className="accordion-detail-stemcare">
                            <p>{row.stemcareSolution}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── AI Difference ────────────────────────────────────────────────────────────

function AiDifference() {
  return (
    <section className="ai-difference" aria-labelledby="ai-title">
      <div className="section-shell ai-difference__grid">
        <Reveal className="ai-difference__copy">
          <p className="eyebrow">How AI is used</p>
          <h2 id="ai-title">Not magic. Not autonomy theatre. <em>A supervised clinical workforce.</em></h2>
          <p>
            STEMCare treats models as one part of a governed operating system. The AI is useful
            because it has the right context, narrow permissions, visible receipts, and a clear
            place to stop.
          </p>
        </Reveal>
        <div className="principle-grid">
          {[
            { icon: Eye, title: "Visible reasoning surface", body: "Clinicians see the plan, sources, assumptions, blocked actions, and approval requests." },
            { icon: ShieldCheck, title: "Deterministic safety layer", body: "Guardian rules can veto, require evidence, or escalate when risk crosses a boundary." },
            { icon: ClipboardCheck, title: "Outcome learning", body: "Mentor improves from reviewed edits, rejects, completions, and escalations offline." },
          ].map(({ icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <Principle icon={icon} title={title}>{body}</Principle>
            </Reveal>
          ))}
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

// ─── Clinical Leads ───────────────────────────────────────────────────────────

function ClinicalLeadCase() {
  return (
    <section className="clinical-leads" id="clinical-leads" aria-labelledby="lead-title">
      <div className="section-shell">
        <Reveal>
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">For clinicians and clinical leads</p>
              <h2 id="lead-title">Why this can change <em>the way a practice operates.</em></h2>
            </div>
            <p>
              The promise is not that AI replaces clinical skill. The promise is that clinical skill
              is no longer buried under unmanaged handoffs, admin drag, and disconnected tools.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="clinical-photo-panel">
            <img
              src="/clinical-team-collaboration.jpg"
              alt="A GP and practice manager reviewing clinical workflow data together on a monitor in a modern primary care practice"
              loading="lazy"
            />
            <div className="clinical-photo-card">
              <span>The clinical lead perspective</span>
              <strong>We don't ask clinicians to trust a black box. We show the work, the source, the stop point, and the reason.</strong>
            </div>
          </div>
        </Reveal>
        <div className="module-grid">
          {modules.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <article className="module-card">
                <Icon size={24} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="leadership-panel">
            <h3>Clinical leadership value</h3>
            <div className="leadership-panel__items">
              {leadershipReasons.map((reason) => (
                <p key={reason}><CheckCircle2 size={18} aria-hidden="true" />{reason}</p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Pilot CTA ────────────────────────────────────────────────────────────────

function PilotCta() {
  return (
    <section className="pilot" id="pilot" aria-labelledby="pilot-title">
      <div className="section-shell pilot__grid">
        <Reveal>
          <div>
            <p className="eyebrow">Pre-launch clinical briefing</p>
            <h2 id="pilot-title">Bring STEMCare into the room <em>before the product launches.</em></h2>
            <p>
              Use this site to open conversations with GPs, practice managers, PCN leaders,
              urgent-care teams, and clinical transformation leads. The strongest first pilots are
              narrow, measurable workflows where teams already feel the operational pain every week.
            </p>
            <div className="pilot__actions">
              <a
                className="button button--primary"
                href="mailto:madesiyan@stemcare.co.uk?subject=STEMCare%20clinical%20lead%20briefing"
              >
                Request pilot conversation <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button--ghost" href="#platform">
                Revisit the platform thesis
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="pilot-card" aria-label="Recommended pilot shape">
            <span>Recommended first pilot</span>
            <h3>One workflow. One team. One safety boundary.</h3>
            <ul>
              <li>Pick a high-friction queue such as results, referrals, prescriptions, or aftercare.</li>
              <li>Define what AI may draft, retrieve, route, and never decide.</li>
              <li>Measure time saved, handoff quality, review burden, and escalation safety.</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

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
          <a href="mailto:madesiyan@stemcare.co.uk?subject=STEMCare%20clinical%20lead%20briefing">Contact</a>
        </div>
      </div>
      <p className="section-shell footer__notice">
        Pre-launch product information only. STEMCare is not a medical device and does not provide
        medical advice; clinicians retain responsibility for clinical decisions. © 2026 STEM Global.
      </p>
    </footer>
  );
}

export default App;
