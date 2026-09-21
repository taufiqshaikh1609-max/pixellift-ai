import { NextResponse } from "next/server";
import {
  ALLOWED_SCALES,
  MAX_JOBS,
  MAX_OUTPUT_DIMENSION,
  MAX_UPLOAD_MB,
} from "@/lib/upscale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Frontend ko server ke limits batata hai taaki upload box me
// sahi "max XMB" dikhe — free/paid deploy dono me automatic.
export async function GET() {
  return NextResponse.json({
    maxUploadMB: MAX_UPLOAD_MB,
    maxOutputDimension: MAX_OUTPUT_DIMENSION,
    maxJobs: MAX_JOBS,
    allowedScales: [...ALLOWED_SCALES],
  });
}
