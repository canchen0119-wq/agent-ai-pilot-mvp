import OpenAI from "openai";
import { applyComplianceFilter } from "@/lib/compliance/filter";
import { buildContentPrompt, buildReplyPrompt, FIXED_CTA } from "@/lib/ai/prompts";
import type { ChatGenerationResult, ContentGenerationResult } from "@/lib/types";

type RawContent = { title: string; body: string; cta: string };
type RawReply = { reply: string };

function maybeOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function safeParseJSON<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mockContent(audience: string): RawContent {
  const title = `给${audience}的一条保障提醒：别等风险来了才补作业`;
  const body = `最近不少${audience}在聊“先赚钱再补保障”。以经纪人的经验看，越忙越要先把家庭责任和现金流风险兜住。先做一版基础保障清单，再看预算优化，会更稳。`;
  return { title, body, cta: FIXED_CTA };
}

function mockReply(message: string, mode: "soft" | "push"): RawReply {
  if (mode === "push") {
    return {
      reply: `作为保险顾问，我理解你的顾虑。你这条问题很关键，我可以先按你的家庭结构做一版基础保障建议。方便留一个电话或微信吗？我用15分钟帮你快速梳理。`
    };
  }
  return {
    reply: `作为保险顾问，我理解你现在的担心。我们可以先不急着定产品，我先帮你把“必须先补的保障缺口”讲清楚，再看预算内怎么安排会更安心。`
  };
}

async function callOpenAIJSON(prompt: string, fallback: string) {
  const client = maybeOpenAIClient();
  if (!client) return fallback;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "你是保险顾问的合规内容助手，只输出 JSON，不输出多余文字。" },
        { role: "user", content: prompt }
      ]
    });
    return completion.choices[0]?.message?.content || fallback;
  } catch {
    return fallback;
  }
}

export async function generateContent(audience: string): Promise<ContentGenerationResult> {
  const fallback = JSON.stringify(mockContent(audience));
  const rawText = await callOpenAIJSON(buildContentPrompt(audience), fallback);
  const raw = safeParseJSON<RawContent>(rawText, mockContent(audience));

  // 输出分段过滤，确保标题与正文都经过合规引擎。
  const titleCompliance = applyComplianceFilter(raw.title);
  const bodyCompliance = applyComplianceFilter(raw.body);
  const cta = FIXED_CTA;

  return {
    title: titleCompliance.safeText,
    body: bodyCompliance.safeText,
    cta,
    compliance: {
      safeText: `${titleCompliance.safeText}\n${bodyCompliance.safeText}\n${cta}`,
      passed: titleCompliance.passed && bodyCompliance.passed,
      flags: [...titleCompliance.flags, ...bodyCompliance.flags],
      disclaimerAdded: titleCompliance.disclaimerAdded || bodyCompliance.disclaimerAdded
    }
  };
}

export async function generateReply(customerMessage: string, mode: "soft" | "push"): Promise<ChatGenerationResult> {
  const fallback = JSON.stringify(mockReply(customerMessage, mode));
  const rawText = await callOpenAIJSON(buildReplyPrompt(customerMessage, mode), fallback);
  const raw = safeParseJSON<RawReply>(rawText, mockReply(customerMessage, mode));
  // 聊天回复统一经过同一套合规过滤器。
  const compliance = applyComplianceFilter(raw.reply);

  return {
    reply: compliance.safeText,
    compliance
  };
}
