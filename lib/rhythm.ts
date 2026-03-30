import type { Lead, FollowUpType } from "@prisma/client";
import type { FollowUpRecommendation } from "@/lib/types";

function diffCalendarDays(from: Date, to: Date) {
  const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  const ms = toDate.getTime() - fromDate.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getFollowUpTypeByDays(days: number): FollowUpType {
  if (days === 1) return "DAY1";
  if (days === 3) return "DAY3";
  if (days === 7) return "DAY7";
  return "NONE";
}

export function getRecommendationText(type: FollowUpType) {
  if (type === "DAY1") return "今天建议首次触达";
  if (type === "DAY3") return "今天建议分享价值信息";
  if (type === "DAY7") return "今天建议做沉默唤醒";
  return "今天无需跟进";
}

export function getRecommendedFollowUp(lead: Pick<Lead, "createdAt" | "lastContactAt">, today = new Date()): FollowUpRecommendation {
  const baseDate = lead.lastContactAt ?? lead.createdAt;
  const days = diffCalendarDays(baseDate, today);
  const followUpType = getFollowUpTypeByDays(days);

  return {
    followUpType,
    recommendation: getRecommendationText(followUpType),
    dueToday: followUpType !== "NONE"
  };
}

