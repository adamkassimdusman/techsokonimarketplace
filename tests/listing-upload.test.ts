import { it, expect } from "vitest";
import {
  textDraft,
  MAX_PHOTO_UPLOAD_BYTES,
  MAX_LISTING_UPLOAD_BYTES,
} from "../lib/listing-upload";

it("autosaves only public text fields, never photos, serial numbers or ownership declarations", () => {
  const form = new FormData();
  form.set("model", "EliteBook");
  form.set("price", "30000");
  form.set("serial", "private-device-serial");
  form.set("ownership_declared", "on");
  form.set(
    "photos",
    new File([new Uint8Array(6 * 1024 * 1024)], "large.png", {
      type: "image/png",
    }),
  );
  const draft = textDraft(form);
  expect([...draft.keys()].sort()).toEqual(["model", "price", "revision"]);
  expect(draft.get("model")).toBe("EliteBook");
  expect(Number(draft.get("revision"))).toBeGreaterThan(0);
});

it("reserves enough room for ten prepared photos and multipart metadata", () => {
  expect(MAX_PHOTO_UPLOAD_BYTES * 10).toBeLessThan(MAX_LISTING_UPLOAD_BYTES);
  expect(MAX_LISTING_UPLOAD_BYTES + 128 * 1024).toBeLessThan(4_500_000);
});
