// Leave space for multipart fields below Vercel's default 4.5 MB request cap.
export const MAX_PHOTO_UPLOAD_BYTES = 280 * 1024;
export const MAX_LISTING_UPLOAD_BYTES = 3 * 1024 * 1024;
export const draftFields = [
  "brand",
  "model",
  "cpu",
  "ram",
  "storage",
  "storage_type",
  "gpu",
  "screen",
  "condition",
  "faults",
  "description",
  "price",
  "county",
  "town",
  "battery",
  "warranty",
  "negotiable",
  "delivery",
] as const;

export function textDraft(form: FormData) {
  const draft = new FormData();
  for (const key of draftFields) {
    const value = form.get(key);
    if (typeof value === "string") draft.set(key, value);
  }
  draft.set("revision", String(Date.now()));
  return draft;
}
