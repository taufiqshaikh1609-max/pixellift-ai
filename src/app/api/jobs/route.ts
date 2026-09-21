import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { upscaleJobs } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: upscaleJobs.id,
        fileName: upscaleJobs.fileName,
        prompt: upscaleJobs.prompt,
        scale: upscaleJobs.scale,
        mimeType: upscaleJobs.mimeType,
        sourceWidth: upscaleJobs.sourceWidth,
        sourceHeight: upscaleJobs.sourceHeight,
        outputWidth: upscaleJobs.outputWidth,
        outputHeight: upscaleJobs.outputHeight,
        sourceBytes: upscaleJobs.sourceBytes,
        outputBytes: upscaleJobs.outputBytes,
        durationMs: upscaleJobs.durationMs,
        enhancements: upscaleJobs.enhancements,
        createdAt: upscaleJobs.createdAt,
      })
      .from(upscaleJobs)
      .orderBy(desc(upscaleJobs.createdAt))
      .limit(12);

    return NextResponse.json({ jobs: rows });
  } catch (error) {
    console.error("jobs list failed", error);
    return NextResponse.json({ jobs: [] }, { status: 200 });
  }
}
