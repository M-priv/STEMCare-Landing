# STEMCare Pre-Consultation Demo — Partner Test Guide

For design-partner testing (360medicx). This document states what the demo
is, what it deliberately is not, and a structured pass/fail script. Anything
that fails a numbered case below is a bug; anything in **Known limitations**
is by design.

## What this demo is

- A deterministic, in-browser simulation of STEMCare's pre-consultation
  intake workflow: structured interview → NHS red-flag gate → live clinical
  briefing → differential hypotheses → clinician authorization gate.
- **No live AI model.** The interview follows the same deterministic
  question-policy engine as the production system. Every behavior is
  reproducible.
- **No data egress.** Nothing typed into the demo is sent anywhere — there
  is no network call, no persistence, no analytics on input. Closing the tab
  discards everything.

## What this demo is not

- Not medical advice and not a clinical service. It is a sales/demo surface.
- Not the production accuracy story: STEMCare makes no accuracy claims for
  its AI until a measured evaluation run passes. Probability labels in the
  demo are **illustrative ranking buckets**, not calibrated estimates.
- Not the production safety stack in full: the demo ports the red-flag
  detector and the assistive-only output policy; the server-side Guardian
  layer, audit receipts, and clinician-review persistence live in the
  production app and are represented here as simulated UI.

## Map: demo surface → production surface

| Demo | Production |
| --- | --- |
| Red-flag detector (`src/demo/lib/redFlagDetector.ts`) | `apps/web/src/lib/ai/triage/redFlagDetector.ts` (ported in full, incl. negation) |
| Interview policy (`src/demo/lib/interviewPrioritization.ts`) | `apps/web/src/lib/ai/medgemma/interviewPrioritization.ts` (adapted; min questions 4 vs 8) |
| Assistive-only gate (`src/demo/lib/assistiveOnlyGuardrails.ts`) | `medgemmaSafetyPolicy.ts` patterns ported; Guardian (server-side) not in demo |
| Clinician gate UI | Production review-delivery/approval-inbox flow (simulated) |
| Patient simulator | Production roleplay harness (deterministic reasoner in demo) |

## Automated evidence

`npm test` runs 104 tests covering: all red-flag rules incl. negation and
Samaritans signposting; guardrail escalation/abstain patterns; the full
interview state machine (termination, sticky complaint, no repeated
questions, no control-marker leakage); red-flag → differential blocking;
per-scenario autoplay rehearsals; and markdown XSS hardening. Partners are
welcome to run it.

## Manual test script

Run `npm run dev` (or the deployed `/demo` route). Each case: **action →
expected result**.

1. **Launch** — Click "Try MedGemma Demo" on the landing page → demo loads
   with a persistent notice banner; migraine scenario pre-selected; chat
   shows the canonical NHS greeting.
2. **Tour** — Open "60s Tour" → four slides; no accuracy/calibration/
   compliance claims; Escape and arrow keys work.
3. **Curated autoplay** — Press "Auto-Play Case" → interview proceeds one
   question per turn, no repeated identical questions, ends with the
   completion phrase (no "End interview." marker visible); briefing updates
   each turn.
4. **Differentials** — After completion → "Differential Dx" tab shows 3
   ranked hypotheses with plausibility buckets (no fabricated percentages),
   guideline references, and "For Clinician Review" actions.
5. **Clinician gate** — Authorize a disposition → sign-off card appears with
   a *simulated* clinician persona and an honest receipt line; "Modify
   Disposition" resets the gate.
6. **Override enforcement** — Select a non-primary hypothesis → a reason is
   REQUIRED before "Authorize" enables (mirrors production
   reject-requires-notes).
7. **Custom case** — Switch to "Fresh Start (Custom Case)" → type any
   symptom narrative → interview asks varied, non-repeated questions and
   terminates within ~15 questions; briefing Chief Complaint stays fixed on
   the FIRST message and does not drift to later messages.
8. **Wrap-Up Intake** — After 2+ answers → click "Wrap-Up Intake" → no blank
   patient bubble appears; interview concludes; differentials generate.
9. **999 red flag** — Type "I want to kill myself" → interview halts
   immediately, 999 + Samaritans (116 123) guidance shown, differentials tab
   shows "Differential Generation Blocked", clinician gate offers emergency
   escalation.
10. **111 red flag** — Type "I have chest pain" → 111 guidance (not 999);
    "chest pain and sweating" → 999. Interview terminated either way.
11. **Negation** — Type "I have a cough but no chest pain" → NO emergency
    banner; interview continues normally.
12. **Same-day routing** — Malaria scenario autoplay (travel + rigors) →
    completes; the malaria rule routes to same-day GP wording when triggered.
13. **XSS attempt** — Type `<img src=x onerror=alert(1)>` → text renders as
    inert text in chat; check the Clinical Briefing: no script executes, no
    event handlers in the rendered HTML.
14. **Long input** — Paste 500+ characters → input caps at 500 characters.
15. **Rapid interaction** — Double-click send, click chips during
    "Synthesizing…", switch scenario mid-turn, hit Reset mid-turn → no
    duplicated messages, no stale scenario content bleeding into the new
    session, no mixed state.
16. **Scenario switch** — Switch between all four cases and Custom → chat,
    briefing, differentials, and clinician gate all reset cleanly.
17. **Refresh / deep link** — Refresh on `/demo` → demo reloads directly;
    browser back returns to the landing page.
18. **Mobile layout** — Narrow viewport → tab switcher (Chat / Briefing /
    Review) works; banner remains readable.
19. **Theme** — Light/dark toggle works across landing and demo.
20. **Privacy** — Open browser DevTools Network tab; interact freely → zero
    requests fire while typing/sending (only static asset loads at startup).

## Known limitations (by design — not bugs)

- The patient simulator is a scripted roleplay reasoner; its answers are
  canned per condition and vary only by symptom selection. Two autoplay runs
  share the same answer style.
- The interviewer's questions come from a fixed policy table (one per
  topic); wording is generic, not complaint-specific.
- Negation handling is clause-scoped with a 50-character window; unusual
  phrasings (e.g. "chestpain" without a space) will not match.
- Red-flag guidance in a *demo* is deliberately over-cautious: any affirmed
  emergency phrase ends the interview with escalation advice.
- The demo contains no persistence: reviews, reports, and sessions are lost
  on reload. The production system persists receipts and audit events.

## Reporting issues

Note the case number above, the scenario, the exact input, and a screenshot.
Bugs that break a numbered case are release blockers; new-content suggestions
(scenario ideas, wording) are tracked separately from safety fixes.
