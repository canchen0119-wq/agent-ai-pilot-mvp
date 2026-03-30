import { LeadStage } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PatchBody = {
  stage?: LeadStage;
  booked?: boolean;
  needsReply?: boolean;
  replied?: boolean;
  lastContactAt?: string | null;
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json()) as PatchBody;
  const payload: {
    stage?: LeadStage;
    booked?: boolean;
    needsReply?: boolean;
    replied?: boolean;
    lastContactAt?: Date | null;
  } = {};

  if (body.stage) payload.stage = body.stage;
  if (typeof body.booked === "boolean") payload.booked = body.booked;
  if (typeof body.needsReply === "boolean") payload.needsReply = body.needsReply;
  if (typeof body.replied === "boolean") payload.replied = body.replied;
  if (body.lastContactAt !== undefined) {
    payload.lastContactAt = body.lastContactAt ? new Date(body.lastContactAt) : null;
  }

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: payload
  });

  return NextResponse.json({ lead });
}
