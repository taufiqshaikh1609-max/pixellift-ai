export type Job = {
  id: string;
  fileName: string;
  prompt: string;
  scale: number;
  appliedScale?: number;
  mimeType: string;
  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;
  sourceBytes: number;
  outputBytes: number;
  durationMs: number;
  enhancements: string[];
  createdAt: string;
};

export function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "abhi";
  if (mins < 60) return `${mins}m pehle`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h pehle`;
  return `${Math.floor(hours / 24)}d pehle`;
}
