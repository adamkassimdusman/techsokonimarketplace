import { it, expect } from "vitest";
import sharp from "sharp";
import { sanitisePhoto } from "../lib/images";
it("strips metadata and downsizes actual decoded images", async () => {
  const input = await sharp({
    create: { width: 2000, height: 1000, channels: 3, background: "#087b69" },
  })
    .jpeg()
    .withMetadata({ exif: { IFD0: { Artist: "Sensitive test metadata" } } })
    .toBuffer();
  const result = await sanitisePhoto(
    new File([new Uint8Array(input)], "test.jpg", { type: "image/jpeg" }),
  );
  const m = await sharp(result).metadata();
  expect(m.format).toBe("webp");
  expect(m.width).toBe(1600);
  expect(m.exif).toBeUndefined();
});
it("rejects spoofed image contents", async () => {
  await expect(
    sanitisePhoto(
      new File(["<script>unsafe</script>"], "fake.jpg", { type: "image/jpeg" }),
    ),
  ).rejects.toThrow();
});
it("rejects oversize files before decoding", async () => {
  await expect(
    sanitisePhoto({
      size: 6 * 1024 * 1024,
      type: "image/jpeg",
      arrayBuffer: async () => new ArrayBuffer(0),
    }),
  ).rejects.toThrow("5 MB");
});
it("rejects SVG despite an image extension", async () => {
  await expect(
    sanitisePhoto(
      new File(["<svg></svg>"], "image.svg", { type: "image/svg+xml" }),
    ),
  ).rejects.toThrow();
});
