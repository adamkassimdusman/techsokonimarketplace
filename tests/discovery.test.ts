import { it, expect } from "vitest";
import { interpretSearch, useCases } from "../lib/discovery";
import { searchQuery } from "../lib/validation";
it("interprets budget, RAM and county without pretending to use AI", () => {
  expect(interpretSearch({ q: "HP EliteBook under 30K" })).toMatchObject({
    q: "HP EliteBook",
    max: "30000",
  });
  expect(interpretSearch({ q: "Lenovo ThinkPad with 16GB RAM" })).toMatchObject(
    { q: "Lenovo ThinkPad", ram: "16" },
  );
  expect(interpretSearch({ q: "Dell Core i7 in Nairobi" })).toMatchObject({
    q: "Dell Core i7",
    county: "Nairobi",
  });
  expect(interpretSearch({ q: "Gaming laptop under 80K" })).toMatchObject({
    q: "",
    use: "gaming",
    max: "80000",
  });
  expect(interpretSearch({ q: "Laptop for engineering" })).toMatchObject({
    q: "",
    use: "engineering",
  });
});
it("respects explicit filters and preserves exact CPU terms", () => {
  expect(interpretSearch({ q: "HP under 30K", max: "20000" }).max).toBe(
    "20000",
  );
  expect(interpretSearch({ q: "i5-8250U" }).q).toBe("i5-8250U");
  expect(searchQuery({ use: "gaming" }).values).toEqual([
    useCases.gaming.ram,
    useCases.gaming.storage,
  ]);
  expect(searchQuery({ inspected: "yes" }).where).toContain("FALSE");
  expect(searchQuery({ seller_type: "dealer" }).values).toEqual(["dealer"]);
});
