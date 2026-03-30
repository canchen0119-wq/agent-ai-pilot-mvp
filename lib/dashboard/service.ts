import { TaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRecommendedFollowUp, getStartOfDay } from "@/lib/rhythm";

async function ensureContentTask(today: Date) {
  // 每天只保留一条固定内容任务，避免重复生成。
  const existing = await prisma.dailyTask.findFirst({
    where: { date: today, type: TaskType.CONTENT }
  });
  if (existing) return;
  await prisma.dailyTask.create({
    data: {
      date: today,
      type: TaskType.CONTENT,
      title: "生成并发布今日社媒内容"
    }
  });
}

async function ensureReplyTasks(today: Date) {
  // 待回复线索 = needsReply=true，每人一条回复任务。
  const replyLeads = await prisma.lead.findMany({ where: { needsReply: true } });
  for (const lead of replyLeads) {
    const existing = await prisma.dailyTask.findFirst({
      where: {
        date: today,
        type: TaskType.REPLY,
        relatedLeadId: lead.id
      }
    });
    if (!existing) {
      await prisma.dailyTask.create({
        data: {
          date: today,
          type: TaskType.REPLY,
          title: `待回复：${lead.name}`,
          relatedLeadId: lead.id
        }
      });
    }
  }
}

async function ensureFollowUpTasks(today: Date) {
  // 跟进节拍按 Day1/3/7 规则计算，到期才生成任务。
  const leads = await prisma.lead.findMany();
  for (const lead of leads) {
    const rec = getRecommendedFollowUp(lead, today);
    if (!rec.dueToday) continue;

    await prisma.lead.update({
      where: { id: lead.id },
      data: { nextFollowUpType: rec.followUpType }
    });

    const existing = await prisma.dailyTask.findFirst({
      where: {
        date: today,
        type: TaskType.FOLLOW_UP,
        relatedLeadId: lead.id
      }
    });
    if (!existing) {
      await prisma.dailyTask.create({
        data: {
          date: today,
          type: TaskType.FOLLOW_UP,
          title: `${lead.name} - ${rec.recommendation}`,
          relatedLeadId: lead.id
        }
      });
    }
  }
}

export async function ensureDailyTasks(date = new Date()) {
  const today = getStartOfDay(date);
  await ensureContentTask(today);
  await ensureReplyTasks(today);
  await ensureFollowUpTasks(today);
}

export async function getDashboardData(date = new Date()) {
  const today = getStartOfDay(date);
  await ensureDailyTasks(today);

  const [tasks, replyCount, leads] = await Promise.all([
    prisma.dailyTask.findMany({
      where: { date: today },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }]
    }),
    prisma.lead.count({ where: { needsReply: true } }),
    prisma.lead.findMany()
  ]);

  const followUpCount = leads.filter((lead) => getRecommendedFollowUp(lead, today).dueToday).length;
  // 执行率 = 已完成 / 总任务。
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const executionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    date: today,
    tasks,
    summary: {
      contentCount: 1,
      replyCount,
      followUpCount,
      totalTasks: total,
      completedTasks: completed,
      executionRate
    }
  };
}
