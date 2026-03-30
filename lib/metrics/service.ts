import { prisma } from "@/lib/prisma";

export async function getMetrics() {
  const [leadCount, bookedCount, pendingReplyCount, repliedCount, aiTotal, aiPassed] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { booked: true } }),
    prisma.lead.count({ where: { needsReply: true } }),
    prisma.lead.count({ where: { replied: true } }),
    prisma.aIRecord.count(),
    prisma.aIRecord.count({ where: { compliancePassed: true } })
  ]);

  const replyDenominator = pendingReplyCount + repliedCount;
  const replyRate = replyDenominator === 0 ? 0 : Math.round((repliedCount / replyDenominator) * 100);
  const complianceRate = aiTotal === 0 ? 100 : Math.round((aiPassed / aiTotal) * 100);

  return {
    leadCount,
    replyRate,
    bookedCount,
    complianceRate
  };
}

