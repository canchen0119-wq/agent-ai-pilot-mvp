import type { FollowUpType, TaskType } from "@prisma/client";

export type ComplianceResult = {
  safeText: string;
  passed: boolean;
  flags: string[];
  disclaimerAdded: boolean;
};

export type ContentGenerationResult = {
  title: string;
  body: string;
  cta: string;
  compliance: ComplianceResult;
};

export type ChatGenerationResult = {
  reply: string;
  compliance: ComplianceResult;
};

export type FollowUpRecommendation = {
  followUpType: FollowUpType;
  recommendation: string;
  dueToday: boolean;
};

export type DashboardTask = {
  id: string;
  type: TaskType;
  title: string;
  completed: boolean;
};

