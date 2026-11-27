import { MAX_PHOTO_UPLOAD_BYTES } from "./listing-upload";

/** Browser-side transport preparation. Server still validates and re-encodes. */
export async function preparePhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    if (
      !bitmap.width ||
      !bitmap.height ||
      bitmap.width * bitmap.height > 25000000
    )
      throw new Error("Choose a photograph smaller than 25 megapixels.");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this photo.");
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    for (const factor of [1, 0.75, 0.5]) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale * factor));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale * factor));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.82, 0.68, 0.52, 0.38]) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (!blob)
          throw new Error("Your browser could not prepare this photo.");
        if (blob.size <= MAX_PHOTO_UPLOAD_BYTES) {
          const extension = blob.type === "image/webp" ? "webp" : "png";
          return new File(
            [blob],
            file.name.replace(/\.[^.]+$/, "") + "." + extension,
            { type: blob.type },
          );
        }
      }
    }
    throw new Error(
      "This photo is too detailed to upload. Choose a smaller photograph.",
    );
  } finally {
    bitmap.close();
  }
}
