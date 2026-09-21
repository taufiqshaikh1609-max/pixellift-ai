import sharp from "sharp";

// Env se configurable taaki free hosting (512MB RAM) par chhote limits
// aur paid server par bade limits lagaye ja saken.
function readPositiveInt(name: string, fallback: number) {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
}

export const MAX_UPLOAD_MB = readPositiveInt("MAX_UPLOAD_MB", 12);
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const MAX_OUTPUT_DIMENSION = readPositiveInt(
  "MAX_OUTPUT_DIMENSION",
  5000,
);
export const MAX_JOBS = readPositiveInt("MAX_JOBS", 24);
export const ALLOWED_SCALES = [2, 3, 4, 6, 8] as const;

export type Recipe = {
  labels: string[];
  sharpenSigma: number;
  saturation: number;
  brightness: number;
  hue: number;
  contrast: number;
  denoise: number;
  grayscale: boolean;
  normalize: boolean;
  tint: string | null;
};

type Rule = {
  keywords: string[];
  label: string;
  apply: (r: Recipe) => void;
};

const RULES: Rule[] = [
  {
    keywords: ["sharp", "crisp", "detail", "detailed", "tez", "clear", "4k", "8k", "ultra"],
    label: "Detail boost",
    apply: (r) => {
      r.sharpenSigma += 0.7;
      r.contrast += 0.06;
    },
  },
  {
    keywords: ["denoise", "noise", "grain", "clean", "smooth", "saaf"],
    label: "Noise removal",
    apply: (r) => {
      r.denoise = Math.max(r.denoise, 3);
      r.sharpenSigma += 0.2;
    },
  },
  {
    keywords: ["vivid", "vibrant", "colorful", "colourful", "saturate", "rangeen", "pop", "punchy"],
    label: "Vivid colors",
    apply: (r) => {
      r.saturation += 0.28;
      r.contrast += 0.08;
    },
  },
  {
    keywords: ["muted", "pastel", "soft color", "faded", "matte"],
    label: "Muted palette",
    apply: (r) => {
      r.saturation -= 0.25;
      r.contrast -= 0.04;
    },
  },
  {
    keywords: ["black and white", "blackandwhite", "b&w", "bw", "monochrome", "mono", "grayscale", "greyscale"],
    label: "Monochrome",
    apply: (r) => {
      r.grayscale = true;
      r.contrast += 0.1;
    },
  },
  {
    keywords: ["sepia", "vintage", "retro", "old school", "purana"],
    label: "Vintage sepia",
    apply: (r) => {
      r.tint = "#d8b48a";
      r.saturation -= 0.1;
    },
  },
  {
    keywords: ["warm", "golden", "sunset", "sunny", "cozy"],
    label: "Warm tone",
    apply: (r) => {
      r.tint = "#ffd9b0";
      r.brightness += 0.03;
    },
  },
  {
    keywords: ["cool", "cold", "blue", "cinematic", "teal", "moon"],
    label: "Cool cinematic tone",
    apply: (r) => {
      r.tint = "#c9dcff";
      r.contrast += 0.06;
    },
  },
  {
    keywords: ["bright", "brighten", "light", "ujala", "expose"],
    label: "Brightened",
    apply: (r) => {
      r.brightness += 0.14;
    },
  },
  {
    keywords: ["dark", "moody", "dramatic", "shadow", "noir"],
    label: "Moody shadows",
    apply: (r) => {
      r.brightness -= 0.1;
      r.contrast += 0.12;
    },
  },
  {
    keywords: ["contrast", "hdr", "dynamic"],
    label: "HDR contrast",
    apply: (r) => {
      r.contrast += 0.16;
      r.normalize = true;
    },
  },
  {
    keywords: ["restore", "restoration", "old photo", "damaged", "faded photo", "repair"],
    label: "Photo restoration",
    apply: (r) => {
      r.normalize = true;
      r.denoise = Math.max(r.denoise, 3);
      r.sharpenSigma += 0.5;
      r.saturation += 0.1;
    },
  },
  {
    keywords: ["portrait", "face", "skin", "selfie", "chehra", "beauty"],
    label: "Portrait smoothing",
    apply: (r) => {
      r.denoise = Math.max(r.denoise, 3);
      r.sharpenSigma += 0.35;
      r.brightness += 0.04;
      r.saturation += 0.05;
    },
  },
  {
    keywords: ["text", "document", "scan", "logo", "poster", "screenshot"],
    label: "Text & edge clarity",
    apply: (r) => {
      r.sharpenSigma += 1.1;
      r.contrast += 0.18;
      r.normalize = true;
    },
  },
  {
    keywords: ["anime", "cartoon", "illustration", "art", "manga", "drawing"],
    label: "Anime / art mode",
    apply: (r) => {
      r.sharpenSigma += 0.9;
      r.saturation += 0.2;
      r.denoise = Math.max(r.denoise, 3);
    },
  },
  {
    keywords: ["nature", "landscape", "forest", "sky", "mountain", "beach"],
    label: "Landscape pop",
    apply: (r) => {
      r.saturation += 0.18;
      r.contrast += 0.1;
      r.sharpenSigma += 0.4;
    },
  },
  {
    keywords: ["product", "ecommerce", "studio", "catalog"],
    label: "Studio product look",
    apply: (r) => {
      r.normalize = true;
      r.brightness += 0.06;
      r.sharpenSigma += 0.6;
    },
  },
];

export function buildRecipe(prompt: string): Recipe {
  const recipe: Recipe = {
    labels: [],
    sharpenSigma: 0.6,
    saturation: 1,
    brightness: 1,
    hue: 0,
    contrast: 1.04,
    denoise: 0,
    grayscale: false,
    normalize: false,
    tint: null,
  };

  const text = prompt.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      rule.apply(recipe);
      if (!recipe.labels.includes(rule.label)) recipe.labels.push(rule.label);
    }
  }

  recipe.sharpenSigma = clamp(recipe.sharpenSigma, 0.3, 2.6);
  recipe.saturation = clamp(recipe.saturation, 0.1, 2);
  recipe.brightness = clamp(recipe.brightness, 0.55, 1.6);
  recipe.contrast = clamp(recipe.contrast, 0.8, 1.6);

  if (recipe.labels.length === 0) {
    recipe.labels.push("Balanced AI enhance");
  }
  return recipe;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export type UpscaleResult = {
  buffer: Buffer;
  mimeType: string;
  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;
  recipe: Recipe;
  appliedScale: number;
};

export async function upscaleImage(
  input: Buffer,
  requestedScale: number,
  prompt: string,
): Promise<UpscaleResult> {
  const recipe = buildRecipe(prompt);
  const base = sharp(input, { failOn: "none" });
  const meta = await base.metadata();
  const sourceWidth = meta.width ?? 0;
  const sourceHeight = meta.height ?? 0;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Image ko read nahi kar paye. Koi doosri file try karein.");
  }

  const maxScale = Math.max(
    1,
    Math.min(
      requestedScale,
      MAX_OUTPUT_DIMENSION / sourceWidth,
      MAX_OUTPUT_DIMENSION / sourceHeight,
    ),
  );
  const appliedScale = Math.round(maxScale * 100) / 100;
  const outputWidth = Math.max(1, Math.round(sourceWidth * appliedScale));
  const outputHeight = Math.max(1, Math.round(sourceHeight * appliedScale));

  let pipeline = sharp(input, { failOn: "none" }).rotate();

  if (recipe.denoise >= 3) {
    pipeline = pipeline.median(3);
  }

  // Progressive lanczos upscaling keeps edges cleaner than one big jump.
  let currentW = sourceWidth;
  let currentH = sourceHeight;
  while (currentW * 2 < outputWidth && currentH * 2 < outputHeight) {
    currentW = Math.round(currentW * 2);
    currentH = Math.round(currentH * 2);
    pipeline = pipeline.resize(currentW, currentH, { kernel: "lanczos3" });
    pipeline = pipeline.sharpen({ sigma: 0.5 });
    pipeline = sharp(await pipeline.png().toBuffer(), { failOn: "none" });
  }

  pipeline = pipeline.resize(outputWidth, outputHeight, {
    kernel: "lanczos3",
    fit: "fill",
  });

  if (recipe.normalize) {
    pipeline = pipeline.normalise();
  }

  pipeline = pipeline.modulate({
    brightness: recipe.brightness,
    saturation: recipe.grayscale ? 1 : recipe.saturation,
    hue: recipe.hue,
  });

  if (recipe.contrast !== 1) {
    const a = recipe.contrast;
    pipeline = pipeline.linear(a, 128 * (1 - a));
  }

  if (recipe.grayscale) {
    pipeline = pipeline.grayscale();
  } else if (recipe.tint) {
    pipeline = pipeline.tint(recipe.tint);
  }

  pipeline = pipeline.sharpen({
    sigma: recipe.sharpenSigma,
    m1: 0.8,
    m2: 2.2,
  });

  const hasAlpha = Boolean(meta.hasAlpha);
  const mimeType = hasAlpha ? "image/png" : "image/jpeg";
  const buffer = hasAlpha
    ? await pipeline.png({ compressionLevel: 8 }).toBuffer()
    : await pipeline.jpeg({ quality: 94, mozjpeg: true }).toBuffer();

  return {
    buffer,
    mimeType,
    sourceWidth,
    sourceHeight,
    outputWidth,
    outputHeight,
    recipe,
    appliedScale,
  };
}

export async function makeThumbnail(input: Buffer): Promise<Buffer> {
  return sharp(input, { failOn: "none" })
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
}
