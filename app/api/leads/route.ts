import { LeadStage } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listLeadsWithRecommendation } from "@/lib/leads/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await listLeadsWithRecommendation();
  return NextResponse.json({ leads });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; phone?: string; source?: string };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ message: "name is required" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      phone: body.phone?.trim() || null,
      source: body.source?.trim() || null,
      stage: LeadStage.NEW,
      needsReply: false
    }
  });

  return NextResponse.json({ lead });
}
