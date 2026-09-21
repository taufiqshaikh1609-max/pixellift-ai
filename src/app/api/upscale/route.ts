import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { upscaleJobs } from "@/db/schema";
import {
  ALLOWED_SCALES,
  MAX_JOBS,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  makeThumbnail,
  upscaleImage,
} from "@/lib/upscale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/avif", "image/gif", "image/tiff"];

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const prompt = String(form.get("prompt") ?? "").slice(0, 400);
    const scaleRaw = Number(form.get("scale") ?? 2);
    const scale = (ALLOWED_SCALES as readonly number[]).includes(scaleRaw)
      ? scaleRaw
      : 2;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Koi image file upload karein." },
        { status: 400 },
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File ${MAX_UPLOAD_MB}MB se badi hai. Chhoti image try karein.` },
        { status: 413 },
      );
    }
    if (file.type && !ACCEPTED.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 },
      );
    }

    const input = Buffer.from(await file.arrayBuffer());
    const started = Date.now();
    const result = await upscaleImage(input, scale, prompt);
    const durationMs = Date.now() - started;
    const sourcePreview = await makeThumbnail(input);

    const [row] = await db
      .insert(upscaleJobs)
      .values({
        fileName: file.name || "upload.png",
        prompt,
        scale,
        mimeType: result.mimeType,
        sourceWidth: result.sourceWidth,
        sourceHeight: result.sourceHeight,
        outputWidth: result.outputWidth,
        outputHeight: result.outputHeight,
        sourceBytes: input.length,
        outputBytes: result.buffer.length,
        durationMs,
        enhancements: result.recipe.labels,
        sourceData: sourcePreview,
        outputData: result.buffer,
      })
      .returning({ id: upscaleJobs.id, createdAt: upscaleJobs.createdAt });

    // Keep the gallery light: drop everything beyond the 24 most recent jobs.
    await db.execute(sql`
      delete from ${upscaleJobs}
      where id not in (
        select id from ${upscaleJobs} order by created_at desc limit 24
      )
    `);

    return NextResponse.json({
      job: {
        id: row.id,
        createdAt: row.createdAt,
        fileName: file.name || "upload.png",
        prompt,
        scale,
        appliedScale: result.appliedScale,
        mimeType: result.mimeType,
        sourceWidth: result.sourceWidth,
        sourceHeight: result.sourceHeight,
        outputWidth: result.outputWidth,
        outputHeight: result.outputHeight,
        sourceBytes: input.length,
        outputBytes: result.buffer.length,
        durationMs,
        enhancements: result.recipe.labels,
      },
    });
  } catch (error) {
    console.error("upscale failed", error);
    const message =
      error instanceof Error ? error.message : "Upscaling fail ho gaya.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
