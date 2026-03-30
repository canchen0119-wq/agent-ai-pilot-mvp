import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDashboardData(new Date());
  return NextResponse.json(data);
}
