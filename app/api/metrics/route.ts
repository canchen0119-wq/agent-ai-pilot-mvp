import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/metrics/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const metrics = await getMetrics();
  return NextResponse.json(metrics);
}
