import { PrismaClient, FollowUpType, LeadStage, TaskType, AIRecordType, ChatMode } from "@prisma/client";
import { getStartOfDay, getRecommendedFollowUp } from "../lib/rhythm";

const prisma = new PrismaClient();

async function main() {
  await prisma.dailyTask.deleteMany();
  await prisma.aIRecord.deleteMany();
  await prisma.lead.deleteMany();

  const now = new Date();
  const d7 = new Date(now);
  d7.setDate(now.getDate() - 7);
  const d3 = new Date(now);
  d3.setDate(now.getDate() - 3);
  const d1 = new Date(now);
  d1.setDate(now.getDate() - 1);

  const leads = await prisma.lead.createMany({
    data: [
      {
        name: "陈女士",
        phone: "626-555-1010",
        source: "小红书",
        stage: LeadStage.NEW,
        needsReply: true,
        replied: false,
        createdAt: d1,
        nextFollowUpType: FollowUpType.DAY1,
        booked: false
      },
      {
        name: "王先生",
        phone: "213-555-9821",
        source: "转介绍",
        stage: LeadStage.FOLLOWING,
        needsReply: false,
        replied: true,
        createdAt: d3,
        lastContactAt: d3,
        nextFollowUpType: FollowUpType.DAY3,
        booked: false
      },
      {
        name: "赵先生",
        phone: "949-555-1212",
        source: "微信社群",
        stage: LeadStage.BOOKED,
        needsReply: true,
        replied: false,
        createdAt: d7,
        lastContactAt: d3,
        nextFollowUpType: FollowUpType.DAY7,
        booked: true
      }
    ]
  });

  const allLeads = await prisma.lead.findMany();
  const today = getStartOfDay(new Date());
  const followUpLeads = allLeads.filter((lead) => getRecommendedFollowUp(lead, new Date()).followUpType !== "NONE");

  await prisma.dailyTask.create({
    data: {
      date: today,
      type: TaskType.CONTENT,
      title: "发布今日社媒内容",
      completed: false
    }
  });

  for (const lead of allLeads.filter((item) => item.needsReply)) {
    await prisma.dailyTask.create({
      data: {
        date: today,
        type: TaskType.REPLY,
        title: `回复客户：${lead.name}`,
        relatedLeadId: lead.id
      }
    });
  }

  for (const lead of followUpLeads) {
    const rec = getRecommendedFollowUp(lead, new Date());
    await prisma.dailyTask.create({
      data: {
        date: today,
        type: TaskType.FOLLOW_UP,
        title: `${lead.name} - ${rec.recommendation}`,
        relatedLeadId: lead.id
      }
    });
  }

  await prisma.aIRecord.createMany({
    data: [
      {
        type: AIRecordType.CONTENT,
        inputText: "新移民家庭",
        outputText: "作为保险顾问，我建议先做家庭保障缺口盘点。",
        compliancePassed: true,
        complianceFlags: "[]"
      },
      {
        type: AIRecordType.CHAT,
        inputText: "保费能不能全美最低？",
        outputText: "我可以帮你比较更有性价比的方案，具体理赔以核保结果为准。",
        mode: ChatMode.SOFT,
        compliancePassed: false,
        complianceFlags: "[\"BANNED_TERM_REPLACED\"]"
      }
    ]
  });

  console.log(`Seeded ${leads.count} leads.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
