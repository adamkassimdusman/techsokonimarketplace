import sharp from "sharp";
/** Decode rather than trust the MIME label; discard source metadata and originals. */
export async function sanitisePhoto(
  file: Pick<File, "size" | "type" | "arrayBuffer">,
) {
  if (
    file.size > 5 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  )
    throw new Error("Upload JPEG, PNG or WebP photos up to 5 MB each.");
  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input, { limitInputPixels: 25000000 }).metadata();
  if (!["jpeg", "png", "webp"].includes(meta.format ?? ""))
    throw new Error("Invalid image format.");
  return sharp(input, { limitInputPixels: 25000000 })
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();
}
