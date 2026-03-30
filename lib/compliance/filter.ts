import type { ComplianceResult } from "@/lib/types";

const BANNED_REPLACEMENTS: Array<{ pattern: RegExp; replace: string; flag: string }> = [
  { pattern: /100%\s*赔付/gi, replace: "理赔结果需依据保险条款和核保结果", flag: "BANNED_TERM_REPLACED" },
  { pattern: /全美最低保费/gi, replace: "更具性价比的保障方案", flag: "BANNED_TERM_REPLACED" },
  { pattern: /最低保费/gi, replace: "更适合你的预算方案", flag: "BANNED_TERM_REPLACED" },
  { pattern: /保证收益/gi, replace: "收益表现受产品条款和市场情况影响", flag: "BANNED_TERM_REPLACED" },
  { pattern: /保险公司官方声明/gi, replace: "根据公开条款信息", flag: "BANNED_TERM_REPLACED" },
  { pattern: /官方声明/gi, replace: "公开条款说明", flag: "BANNED_TERM_REPLACED" },
  { pattern: /官方客服/gi, replace: "保险顾问", flag: "BANNED_TERM_REPLACED" },
  { pattern: /保证通过/gi, replace: "可先协助做核保可行性评估", flag: "BANNED_TERM_REPLACED" },
  { pattern: /一定赔/gi, replace: "是否理赔以条款及核保结论为准", flag: "BANNED_TERM_REPLACED" },
  { pattern: /肯定赔/gi, replace: "是否理赔以条款及核保结论为准", flag: "BANNED_TERM_REPLACED" }
];

const DISCLAIMER_TRIGGERS =
  /(收益|理赔|赔付|承诺|一定赔|肯定赔|保证|核保通过|回报|稳赚|保本|理赔结果)/i;

const IDENTITY_PREFIX = "作为保险顾问，我建议你先结合预算和家庭责任做基础保障评估。";
const DISCLAIMER_TEXT = "具体理赔以核保结果为准";

export function applyComplianceFilter(text: string): ComplianceResult {
  const flags = new Set<string>();
  let safeText = text.trim();

  // 1) 严禁词替换：命中后统一改写为保守表达。
  for (const rule of BANNED_REPLACEMENTS) {
    if (rule.pattern.test(safeText)) {
      safeText = safeText.replace(rule.pattern, rule.replace);
      flags.add(rule.flag);
    }
  }

  // 2) 身份锚定：强制保持“保险顾问/经纪人”语气。
  if (!/(保险顾问|经纪人)/.test(safeText)) {
    safeText = `${IDENTITY_PREFIX}\n${safeText}`;
    flags.add("IDENTITY_ANCHORED");
  }

  // 3) 免责声明：触发收益/理赔等语义时自动追加。
  let disclaimerAdded = false;
  if (DISCLAIMER_TRIGGERS.test(safeText) && !safeText.includes(DISCLAIMER_TEXT)) {
    safeText = `${safeText}\n\n${DISCLAIMER_TEXT}`;
    disclaimerAdded = true;
    flags.add("DISCLAIMER_ADDED");
  }

  return {
    safeText,
    passed: flags.size === 0,
    flags: Array.from(flags),
    disclaimerAdded
  };
}
