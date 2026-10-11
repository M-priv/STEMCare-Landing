/**
 * MedGemma Dual-Persona Chat Service (demo port)
 *
 * Adapted from STEMCare (`apps/web/src/lib/ai/medgemma/medgemmaChatService.ts`).
 * Orchestrates:
 * 1. Interviewer Persona: prioritized follow-up questions following the
 *    deterministic interview policy (`interviewPrioritization.ts`).
 * 2. Report Writer Persona: compiles the structured intake report each turn.
 *
 * Deltas from the production surface (by design, this is a static demo):
 * - No live model. Production routes both personas through the server-side
 *   ai-gateway edge function so API keys never reach the client; this demo
 *   runs the deterministic interview policy only, so nothing a visitor types
 *   leaves the browser. If a live path is added later it MUST go through a
 *   server proxy and re-enable `validateGeneratedQuestion` +
 *   `evaluateAssistiveOnlyGuardrails` on every generated response.
 * - The production red-flag detector is ported in full (see
 *   `redFlagDetector.ts`), including negation handling and NHS 999/111
 *   routing; detection terminates the interview unconditionally.
 */

import type {
  MedGemmaChatMessage,
  MedGemmaChatState,
  InterviewTopic,
} from './harnessTypes';
import {
  createInitialInterviewPolicy,
  selectInterviewTopic,
  applyUserAnswerToPolicy,
  computeCoverageStatus,
  shouldTerminateInterview,
  getFallbackQuestion,
  getTopicLabel,
} from './interviewPrioritization';
import { detectRedFlags } from './redFlagDetector';

// Canonical protocol phrase (kept identical to production for parity; the
// trailing control marker is stripped before anything is shown to a visitor).
export const INTERVIEW_COMPLETE_PHRASE =
  'Thank you for answering my questions. I have everything needed to prepare a report for your visit. End interview.';

export const INTERVIEW_COMPLETE_DISPLAY_PHRASE =
  'Thank you for answering my questions. I have everything needed to prepare a report for your visit.';

export const CANONICAL_OPENING_GREETING =
  'Thank you for booking an appointment with your primary doctor. I am an assistant here to ask a few questions to help your doctor prepare for your visit. To start, what is your main concern today?';

export const INTERVIEWER_SYSTEM_PROMPT = `SYSTEM INSTRUCTION: Always think silently before responding.

Persona:
You are a clinical assistant for a UK NHS General Practice. Your role is to gather information from users about their health concerns through focused questioning.

CRITICAL RULES:
- **No Assessments:** You are NOT authorized to provide medical advice, diagnoses, or express any form of assessment to the patient.
- **Question Format:** Ask exactly ONE question sentence ending with "?".
- **Question Length:** Each question must be 20 words or less.
- **No Preambles:** Do NOT start with phrases like "Considering...", "Given...", or "As you mentioned...".
- **Control Compliance:** Follow the Interview Control block exactly when provided.

### Priority Policy ###
- Prioritize unresolved safety concerns (breathing/chest/neurological red flags) before lower-yield questions.
- Prioritize chief-complaint defining details (onset, severity, progression) before broad review-of-systems.
- Prefer high-yield differentiators over optional broad screening.
- Ensure relevant history coverage includes PMH, regular medications, allergies, and family/social context before wrap-up when feasible.
- Do NOT re-ask answered topics.

### Context Awareness ###
You MUST use the CURRENT REPORT and conversation history below:
- Do NOT ask for information already documented.
- Ask the next best question to close an unresolved, high-value gap.
- Keep each turn strictly fact-finding.

### Procedure ###
1. **Start Interview:** Begin the conversation with: "${CANONICAL_OPENING_GREETING}"
2. **Conduct Interview:** Ask one focused question per turn, following Interview Control.
3. **End Interview:** Print this exact phrase when complete: "${INTERVIEW_COMPLETE_PHRASE}"`;

export const REPORT_WRITER_SYSTEM_PROMPT = `<role>
You are a highly skilled medical assistant with expertise in clinical documentation.
</role>

<task>
Your task is to generate a concise yet clinically comprehensive medical intake report for a Primary Care Physician (PCP). This report will be based on a patient interview.
</task>

<guiding_principles>
1. **Principle of Brevity**:
   - Rephrase conversational patient language into standard medical terminology.
   - Omit filler and pleasantries.
2. **Principle of Clinical Relevance**:
   - Prioritize the HPI: Onset, duration, quality, severity, timing, modifying factors.
   - Include Pertinent Negatives: Symptoms the patient denies that are relevant to the complaint.
   - Relevant Medical History: Conditions, medications, allergies, family/social.
</guiding_principles>

<output_format>
The final output MUST be ONLY the full, updated Markdown medical report.
</output_format>`;

export const REPORT_TEMPLATE = `## Chief Complaint
[To be determined from interview]

## History of Present Illness
- **Onset**: Not yet discussed
- **Duration**: Not yet discussed
- **Location**: Not yet discussed
- **Character/Quality**: Not yet discussed
- **Severity**: Not yet discussed
- **Timing**: Not yet discussed
- **Modifying Factors**: Not yet discussed
- **Associated Symptoms**: Not yet discussed
- **Pertinent Negatives**: Not yet discussed

## Relevant Medical History
- **Conditions**: Not yet reviewed
- **Medications**: Not yet reviewed
- **Allergies**: Not yet reviewed
- **Family/Social**: Not yet reviewed

## Red Flags
Not yet assessed

## Summary
Interview in progress.`;

export function buildInterviewerPrompt(
  history: MedGemmaChatMessage[],
  presentingComplaint: string,
  patientName?: string,
  currentReport?: string,
  control?: {
    questionsAsked: number;
    maxQuestions: number;
    selectedTopic: InterviewTopic;
    selectedTopicRationale: string;
    blockedTopics: InterviewTopic[];
  },
): string {
  const nameContext = patientName ? `Speaking with: ${patientName}\n` : '';
  const historyText = history.length > 0
    ? history.map((msg) => `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}`).join('\n')
    : '';

  const reportContext = currentReport
    ? `\n### Current Report ###\n${currentReport}\nDo NOT ask for information already documented above.\n`
    : '';

  const controlContext = control
    ? `\n### Interview Control (authoritative) ###\nquestions_asked: ${control.questionsAsked}\nselected_topic: ${control.selectedTopic}\nrationale: ${control.selectedTopicRationale}\n`
    : '';

  return `${INTERVIEWER_SYSTEM_PROMPT}

${nameContext}Initial complaint: "${presentingComplaint}"
${controlContext}${reportContext}
${historyText ? `Conversation so far:\n${historyText}\n` : ''}
Generate your next response.
Return exactly ONE question sentence ending with "?". No preamble. No extra commentary.`;
}

export function buildReportWriterPrompt(
  transcript: MedGemmaChatMessage[],
  currentReport: string,
  presentingComplaint: string,
): string {
  const interviewText = transcript
    .map((msg) => `${msg.role === 'user' ? 'Patient' : 'Clinician'}: ${msg.content}`)
    .join('\n');

  return `${REPORT_WRITER_SYSTEM_PROMPT}

Chief Complaint: ${presentingComplaint}

<interview_transcript>
${interviewText}
</interview_transcript>

<previous_report>
${currentReport || REPORT_TEMPLATE}
</previous_report>

Update the report with the new facts from the interview. Return ONLY the full Markdown report.`;
}

export function cleanReportOutput(report: string): string {
  let cleaned = report.trim();
  const codeBlockMatch = cleaned.match(/^\s*```(?:markdown)?\s*([\s\S]*?)\s*```\s*$/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }
  return cleaned.trim();
}

export function initializeChatSession(
  presentingComplaint: string,
  patientName?: string,
): MedGemmaChatState {
  const initialPolicy = createInitialInterviewPolicy();
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const initialReport = presentingComplaint
    ? `## Chief Complaint\n${presentingComplaint}\n\n## History of Present Illness\n- **Onset**: Not yet discussed\n- **Duration**: Not yet discussed\n- **Severity**: Not yet discussed\n\n## Relevant Medical History\n- **Conditions**: Not yet reviewed\n- **Medications**: Not yet reviewed\n\n## Red Flags\nSafety screen in progress.\n\n## Summary\nInterview initiated.`
    : REPORT_TEMPLATE;

  return {
    sessionId: crypto.randomUUID(),
    patientName: patientName || 'Patient Consultation',
    presentingComplaint,
    messages: [
      {
        role: 'assistant',
        content: CANONICAL_OPENING_GREETING,
        timestamp: now,
      },
    ],
    report: initialReport,
    hasRedFlag: false,
    exchangeCount: 0,
    interviewPolicy: initialPolicy,
  };
}

export interface ProcessPatientMessageResult {
  state: MedGemmaChatState;
  assistantReply: MedGemmaChatMessage;
  redFlagDetected: boolean;
  redFlagMessage?: string;
  interviewComplete: boolean;
}

function redFlagPatientMessage(headline: string, guidance: string, urgency: 'call_999' | 'call_111' | 'same_day_gp'): string {
  const stopping = urgency === 'call_999'
    ? 'This interview has been stopped so that nothing delays emergency care. Call 999 now.'
    : urgency === 'call_111'
      ? 'This interview has been stopped. Please call 111 now for urgent advice.'
      : 'This interview has been stopped. Please arrange an urgent same-day GP appointment today.';
  return `⚠️ **${headline}**\n\n${guidance}\n\n*${stopping}*`;
}

export async function processPatientMessage(
  state: MedGemmaChatState,
  userMessage: string,
  isForceWrapUp: boolean = false,
): Promise<ProcessPatientMessageResult> {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Mandatory Red-Flag Screening (Deterministic NHS gate) — runs before
  // anything else, including the force-wrap-up path.
  const redFlagCheck = detectRedFlags(userMessage);
  if (redFlagCheck.detected && redFlagCheck.urgency) {
    const redFlagMessage: MedGemmaChatMessage = {
      role: 'assistant',
      content: redFlagPatientMessage(
        redFlagCheck.headline || 'Immediate attention required',
        redFlagCheck.guidance || 'Please seek urgent medical advice.',
        redFlagCheck.urgency,
      ),
      timestamp,
      redFlag: true,
    };

    const updatedMessages: MedGemmaChatMessage[] = [
      ...state.messages,
      { role: 'user', content: userMessage, timestamp },
      redFlagMessage,
    ];

    const updatedReport = `${state.report}\n\n## Red Flags\n⚠️ **EMERGENCY RED FLAG DETECTED**: ${redFlagCheck.symptom} (${redFlagCheck.urgency})\nGuidance: ${redFlagCheck.guidance}\n\n## Summary\nInterview terminated due to emergency red flag.`;

    return {
      state: {
        ...state,
        messages: updatedMessages,
        report: updatedReport,
        hasRedFlag: true,
        redFlagReason: redFlagCheck.symptom,
        exchangeCount: state.exchangeCount + 1,
      },
      assistantReply: redFlagMessage,
      redFlagDetected: true,
      redFlagMessage: redFlagCheck.guidance,
      interviewComplete: true,
    };
  }

  // 2. Add the patient message to the transcript. A force wrap-up carries no
  // patient text, so no user bubble is appended.
  const transcriptWithUser: MedGemmaChatMessage[] = isForceWrapUp
    ? [...state.messages]
    : [...state.messages, { role: 'user', content: userMessage, timestamp }];

  // The presenting complaint is the first substantive patient message and is
  // sticky for the rest of the session (custom flow starts blank).
  const effectiveComplaint = state.presentingComplaint || userMessage.trim();

  // 3. Update Policy with User Answer
  const currentPolicy = state.interviewPolicy || createInitialInterviewPolicy();
  const lastTopic = currentPolicy.lastSelectedTopic || 'chief_complaint_onset_timeline';
  const updatedPolicy = applyUserAnswerToPolicy(currentPolicy, lastTopic, userMessage);

  // 4. Select Next Priority Topic
  const selection = selectInterviewTopic(updatedPolicy, state.presentingComplaint, userMessage);
  const coverage = computeCoverageStatus(updatedPolicy, state.hasRedFlag);
  const termination = shouldTerminateInterview(updatedPolicy, coverage, selection);

  const shouldEnd = isForceWrapUp || termination.shouldTerminate;

  // 5. Interviewer response — deterministic policy fallback question (the
  // demo makes no model calls; see header note).
  const replyText = shouldEnd
    ? INTERVIEW_COMPLETE_DISPLAY_PHRASE
    : getFallbackQuestion(selection.selectedTopic);

  const assistantReply: MedGemmaChatMessage = {
    role: 'assistant',
    content: replyText,
    timestamp,
  };
  const fullTranscript: MedGemmaChatMessage[] = [...transcriptWithUser, assistantReply];

  // 6. Report Writer Persona — deterministic structured update (no model).
  // The first finding typically restates the chief complaint verbatim (the
  // opening answer), so it is dropped from the HPI list to avoid duplication.
  const findingsList = Object.entries(updatedPolicy.topicFindings || {})
    .filter(([_, val]) => val.trim() !== effectiveComplaint)
    .map(([t, val]) => `- **${getTopicLabel(t as InterviewTopic)}**: ${val}`)
    .join('\n');

  const updatedReportText = `## Chief Complaint\n${effectiveComplaint || 'Not yet stated'}\n\n## History of Present Illness\n${findingsList || '- Awaiting symptom details.'}\n\n## Red Flags\nScreened negative for emergency red flags.\n\n## Summary\n${shouldEnd ? 'Interview complete. Report finalized for GP review.' : 'Interview in progress.'}`;

  return {
    state: {
      ...state,
      presentingComplaint: effectiveComplaint,
      messages: fullTranscript,
      report: updatedReportText,
      exchangeCount: state.exchangeCount + 1,
      interviewPolicy: {
        ...updatedPolicy,
        lastSelectedTopic: selection.selectedTopic,
      },
    },
    assistantReply,
    redFlagDetected: false,
    interviewComplete: shouldEnd,
  };
}
