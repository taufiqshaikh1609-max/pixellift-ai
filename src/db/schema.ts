import {
  customType,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
  fromDriver(value: unknown) {
    return value as Buffer;
  },
  toDriver(value: Buffer) {
    return value;
  },
});

export const upscaleJobs = pgTable("upscale_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: text("file_name").notNull(),
  prompt: text("prompt").notNull().default(""),
  scale: integer("scale").notNull().default(2),
  mimeType: text("mime_type").notNull().default("image/png"),
  sourceWidth: integer("source_width").notNull().default(0),
  sourceHeight: integer("source_height").notNull().default(0),
  outputWidth: integer("output_width").notNull().default(0),
  outputHeight: integer("output_height").notNull().default(0),
  sourceBytes: integer("source_bytes").notNull().default(0),
  outputBytes: integer("output_bytes").notNull().default(0),
  durationMs: integer("duration_ms").notNull().default(0),
  enhancements: jsonb("enhancements").$type<string[]>().notNull().default([]),
  sourceData: bytea("source_data"),
  outputData: bytea("output_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UpscaleJob = typeof upscaleJobs.$inferSelect;
export type NewUpscaleJob = typeof upscaleJobs.$inferInsert;
