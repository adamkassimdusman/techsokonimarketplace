import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, token, digest } from "../lib/security";
import { listingSchema, searchQuery } from "../lib/validation";
describe("Authentication primitives", () => {
  it("uses independent salts and rejects the wrong password", async () => {
    const a = await hashPassword("correct horse battery staple");
    const b = await hashPassword("correct horse battery staple");
    expect(a).not.toBe(b);
    expect(await verifyPassword("correct horse battery staple", a)).toBe(true);
    expect(await verifyPassword("wrong password", a)).toBe(false);
  });
  it("generates opaque tokens and stores only digests", () => {
    const a = token();
    expect(a).toHaveLength(64);
    expect(a).not.toBe(token());
    expect(digest(a)).not.toBe(a);
  });
});
describe("Search boundaries", () => {
  it("combines parameterised filters without allowing query injection", () => {
    const q = searchQuery({
      q: "' OR true;--",
      brand: "HP",
      min: "20000",
      max: "40000",
      ram: "16",
      sort: "price; DROP TABLE listings",
    });
    expect(q.values).toEqual(["' OR true;--", "HP", 2000000, 4000000, 16]);
    expect(q.where).not.toContain("DROP");
    expect(q.where).not.toContain("' OR true");
    expect(q.sort).toBe("l.created_at DESC");
  });
  it("bounds pagination and ignores invalid numbers", () => {
    expect(searchQuery({ page: "-5", min: "oops" }).page).toBe(1);
    expect(searchQuery({ page: "Infinity" }).page).toBe(10000);
    expect(searchQuery({ page: "2.7" }).page).toBe(2);
  });
  it("rejects ownership omissions, fractional prices and impossible battery values", () => {
    expect(
      listingSchema.safeParse({
        ownership_declared: false,
        price: 3.14,
        battery: 200,
      }).success,
    ).toBe(false);
  });
});
