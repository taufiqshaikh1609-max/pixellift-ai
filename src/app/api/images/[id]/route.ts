import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { upscaleJobs } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const variant =
    new URL(request.url).searchParams.get("variant") === "source"
      ? "source"
      : "output";

  const [row] = await db
    .select({
      mimeType: upscaleJobs.mimeType,
      sourceData: upscaleJobs.sourceData,
      outputData: upscaleJobs.outputData,
      fileName: upscaleJobs.fileName,
    })
    .from(upscaleJobs)
    .where(eq(upscaleJobs.id, id))
    .limit(1);

  const data = variant === "source" ? row?.sourceData : row?.outputData;
  if (!row || !data) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const contentType = variant === "source" ? "image/jpeg" : row.mimeType;
  const bytes = new Uint8Array(data);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(bytes.byteLength),
    },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  await db.delete(upscaleJobs).where(eq(upscaleJobs.id, id));
  return NextResponse.json({ ok: true });
}
