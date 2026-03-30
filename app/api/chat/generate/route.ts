import { AIRecordType, ChatMode } from "@prisma/client";
import { NextResponse } from "next/server";
import { generateReply } from "@/lib/ai/service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = (await req.json()) as { customerMessage?: string; mode?: "soft" | "push" };
  const customerMessage = body.customerMessage?.trim();
  const mode = body.mode ?? "soft";

  if (!customerMessage) {
    return NextResponse.json({ message: "customerMessage is required" }, { status: 400 });
  }

  const result = await generateReply(customerMessage, mode);
  await prisma.aIRecord.create({
    data: {
      type: AIRecordType.CHAT,
      inputText: customerMessage,
      outputText: result.reply,
      mode: mode === "soft" ? ChatMode.SOFT : ChatMode.PUSH,
      compliancePassed: result.compliance.passed,
      complianceFlags: JSON.stringify(result.compliance.flags)
    }
  });

  return NextResponse.json(result);
}

