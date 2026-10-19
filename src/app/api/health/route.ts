import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/player/store";
import { pingPythonService } from "@/lib/player/python-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await Promise.all([checkDatabase(), pingPythonService()]);
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "not_ready" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
