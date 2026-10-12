import type { PackArtworkSettings } from "../types/packArtwork";

export const PACK_WIDTH = 600;
export const PACK_HEIGHT = 840;

export function renderPackArtwork(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  packName: string,
  settings: PackArtworkSettings
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize artwork canvas.");
  }

  canvas.width = PACK_WIDTH;
  canvas.height = PACK_HEIGHT;

  ctx.clearRect(0, 0, PACK_WIDTH, PACK_HEIGHT);

  // Draw artwork, filling the rectangle without distortion.
  const baseScale = Math.max(
    PACK_WIDTH / image.naturalWidth,
    PACK_HEIGHT / image.naturalHeight
  );

  const scale = baseScale * settings.imageZoom;

  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;

  const x = (PACK_WIDTH - width) / 2 + settings.imageX;
  const y = (PACK_HEIGHT - height) / 2 + settings.imageY;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, PACK_WIDTH, PACK_HEIGHT);
  ctx.clip();

  ctx.drawImage(image, x, y, width, height);
  ctx.restore();

  // Draw the pack name.
  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";

  ctx.font = `bold ${settings.fontSize}px ${settings.fontFamily}`;

  // Keep long pack names inside the image.
  const maxTextWidth = PACK_WIDTH - 40;

  ctx.strokeStyle = settings.outlineColor;
  ctx.lineWidth = settings.outlineWidth;

  if (settings.outlineWidth > 0) {
    ctx.strokeText(
      packName,
      PACK_WIDTH / 2,
      settings.titleY,
      maxTextWidth
    );
  }

  ctx.fillStyle = settings.textColor;

  ctx.fillText(
    packName,
    PACK_WIDTH / 2,
    settings.titleY,
    maxTextWidth
  );

  ctx.restore();

  // Draw a simple rectangular border.
  if (settings.borderWidth > 0) {
    ctx.save();

    ctx.strokeStyle = settings.borderColor;
    ctx.lineWidth = settings.borderWidth;

    const inset = settings.borderWidth / 2;

    ctx.strokeRect(
      inset,
      inset,
      PACK_WIDTH - settings.borderWidth,
      PACK_HEIGHT - settings.borderWidth
    );

    ctx.restore();
  }
}