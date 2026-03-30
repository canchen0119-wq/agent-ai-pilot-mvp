import { AIRecordType } from "@prisma/client";
import { NextResponse } from "next/server";
import { generateContent } from "@/lib/ai/service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = (await req.json()) as { audience?: string };
  const audience = body.audience?.trim();

  if (!audience) {
    return NextResponse.json({ message: "audience is required" }, { status: 400 });
  }

  const result = await generateContent(audience);
  await prisma.aIRecord.create({
    data: {
      type: AIRecordType.CONTENT,
      inputText: audience,
      outputText: `${result.title}\n${result.body}\n${result.cta}`,
      compliancePassed: result.compliance.passed,
      complianceFlags: JSON.stringify(result.compliance.flags)
    }
  });

  return NextResponse.json(result);
}

