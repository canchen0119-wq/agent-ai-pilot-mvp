import { prisma } from "@/lib/prisma";
import { getRecommendedFollowUp } from "@/lib/rhythm";

export async function listLeadsWithRecommendation() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return leads.map((lead) => {
    const rec = getRecommendedFollowUp(lead, new Date());
    return {
      ...lead,
      recommendation: rec.recommendation,
      recommendationType: rec.followUpType,
      dueToday: rec.dueToday
    };
  });
}

