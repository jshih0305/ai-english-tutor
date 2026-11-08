// 直接用 fetch 打 OpenAI Chat Completions，不另外裝 SDK。
import type { Scenario } from "./scenarios";

const MODEL = "gpt-4o-mini";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** 打 OpenAI 並要求回傳 JSON 物件，回傳 parse 後的結果 */
async function chatJSON(messages: ChatMessage[], temperature: number): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("請在 .env.local 設定 OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API 錯誤 (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  try {
    return JSON.parse(content);
  } catch {
    return { raw: content };
  }
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// ---------------- 對話 ----------------

function tutorPrompt(scenario: Scenario, level: string) {
  return `${scenario.persona}

You are role-playing this scenario to help a Taiwanese learner practice spoken English (level: ${level}).
Rules:
- Stay in character. Reply in natural, conversational English only.
- Keep each reply short: 1-3 sentences.
- Always end with a question or prompt so the learner keeps talking.
- Match vocabulary to the learner's level.
- Respond ONLY with a JSON object: {"reply": "<your in-character reply>"}`;
}

export async function getTutorReply(
  scenario: Scenario,
  level: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: tutorPrompt(scenario, level) },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  // 對話剛開始時沒有歷史訊息，請 AI 先開場
  if (history.length === 0) {
    messages.push({
      role: "user",
      content: "(Start the conversation: greet me in character and ask me the first question.)",
    });
  }

  const json = await chatJSON(messages, 0.8);
  return str(json.reply) || str(json.raw);
}

// ---------------- 糾正文法 ----------------

export type GrammarIssue = {
  original: string;
  corrected: string;
  type: string;
  explanation: string;
};

export type GrammarResult = {
  isCorrect: boolean;
  corrected: string;
  explanation: string;
  issues: GrammarIssue[];
};

const ISSUE_TYPES = ["grammar", "vocabulary", "spelling", "word-choice", "naturalness", "other"];

export async function checkGrammar(sentence: string, context: string): Promise<GrammarResult> {
  const json = await chatJSON(
    [
      {
        role: "system",
        content: `You are an English teacher for Taiwanese learners. Check the learner's sentence for grammar, spelling, word choice and unnatural phrasing.
Only fix real mistakes; keep the learner's meaning and wording as much as possible.
Write explanations in Traditional Chinese (繁體中文, Taiwan usage).
Respond ONLY with JSON:
{
  "isCorrect": boolean,              // true if there are no mistakes
  "corrected": string,               // the full corrected sentence (same as original if correct)
  "explanation": string,             // 1-2 sentence overall comment in Traditional Chinese
  "issues": [                        // empty if correct
    { "original": string,            // the wrong fragment
      "corrected": string,           // the fixed fragment
      "type": "grammar" | "vocabulary" | "spelling" | "word-choice" | "naturalness" | "other",
      "explanation": string }        // why, in Traditional Chinese
  ]
}`,
      },
      {
        role: "user",
        content: `Conversation context (the question the learner was answering):\n${context || "(none)"}\n\nLearner's sentence:\n${sentence}`,
      },
    ],
    0.2
  );

  const issues = Array.isArray(json.issues)
    ? json.issues
        .map((i: Record<string, unknown>) => ({
          original: str(i.original),
          corrected: str(i.corrected),
          type: ISSUE_TYPES.includes(str(i.type)) ? str(i.type) : "other",
          explanation: str(i.explanation),
        }))
        .filter((i) => i.original || i.corrected)
    : [];

  return {
    isCorrect: json.isCorrect === true && issues.length === 0,
    corrected: str(json.corrected) || sentence,
    explanation: str(json.explanation),
    issues,
  };
}

// ---------------- 更好完整回答 ----------------

export type BetterAnswerResult = {
  betterAnswer: string;
  explanation: string;
  alternatives: string[];
};

export async function suggestBetterAnswer(
  sentence: string,
  context: string,
  scenario: Scenario,
  level: string
): Promise<BetterAnswerResult> {
  const json = await chatJSON(
    [
      {
        role: "system",
        content: `You are an English speaking coach for Taiwanese learners (level: ${level}).
Scenario: ${scenario.label} — ${scenario.description}.
Given the question the learner was asked and the learner's answer, write a better, more complete and natural answer that a fluent speaker would say in this situation.
Keep the learner's original meaning and intent, make it fully answer the question, and use vocabulary suitable for the learner's level. 2-4 sentences.
Never invent personal facts the learner did not mention (school, major, company, names, numbers...). If a complete answer needs such information, use a short placeholder in square brackets, e.g. [your major], so the learner can fill in their own.
Write the explanation in Traditional Chinese (繁體中文, Taiwan usage).
Respond ONLY with JSON:
{
  "betterAnswer": string,      // the improved full answer in English
  "explanation": string,       // what was improved and why, in Traditional Chinese (2-3 sentences)
  "alternatives": string[]     // 2 other natural ways to answer, in English, each 1-2 sentences
}`,
      },
      {
        role: "user",
        content: `Question the learner was answering:\n${context || "(none)"}\n\nLearner's answer:\n${sentence}`,
      },
    ],
    0.7
  );

  return {
    betterAnswer: str(json.betterAnswer) || str(json.raw),
    explanation: str(json.explanation),
    alternatives: Array.isArray(json.alternatives)
      ? json.alternatives.map(str).filter(Boolean).slice(0, 3)
      : [],
  };
}
