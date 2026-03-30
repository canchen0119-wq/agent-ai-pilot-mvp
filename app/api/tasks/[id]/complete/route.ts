import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const task = await prisma.dailyTask.update({
    where: { id: params.id },
    data: { completed: true }
  });
  return NextResponse.json({ task });
}
