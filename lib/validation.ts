import { interpretSearch, useCases } from "./discovery";
import { z } from "zod";
export const listingSchema = z.object({
  brand: z.enum([
    "HP",
    "Lenovo",
    "Dell",
    "Apple",
    "ASUS",
    "Acer",
    "Microsoft",
    "Other",
  ]),
  model: z.string().trim().min(2).max(100),
  cpu: z.string().trim().min(3).max(100),
  ram: z.coerce.number().int().min(1).max(256),
  storage: z.coerce.number().int().min(16).max(16384),
  storage_type: z.enum(["SSD", "HDD"]),
  gpu: z.string().max(100),
  screen: z.string().min(2).max(100),
  condition: z.enum([
    "Brand new",
    "Refurbished",
    "Imported used",
    "Locally used",
    "For parts or repair",
  ]),
  faults: z.string().trim().min(4).max(3000),
  description: z.string().trim().min(20).max(5000),
  price: z.coerce
    .number()
    .int()
    .min(100)
    .max(5000000)
    .transform((n) => n * 100),
  county: z.string().trim().min(2).max(60),
  town: z.string().trim().min(2).max(80),
  battery: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(100)])
    .transform((n) => (n === "" ? null : n)),
  warranty: z.string().max(200),
  negotiable: z.boolean(),
  delivery: z.boolean(),
  ownership_declared: z.literal(true),
});
export function searchQuery(params: Record<string, string | undefined>) {
  params = interpretSearch(params);
  const values: unknown[] = [];
  const clauses = ["l.status='published'"];
  const add = (sql: string, v: unknown) => {
    values.push(v);
    clauses.push(sql.replace("?", `$${values.length}`));
  };
  if (params.q?.trim())
    add(
      "to_tsvector('simple',l.brand||' '||l.model||' '||l.cpu||' '||l.description) @@ plainto_tsquery('simple',?)",
      params.q.slice(0, 200),
    );
  for (const key of ["brand", "condition", "county", "storage_type"])
    if (params[key]) add(`l.${key}=?`, params[key]);
  for (const [key, column, op, multiplier] of [
    ["min", "price", ">=", 100],
    ["max", "price", "<=", 100],
    ["ram", "ram", ">=", 1],
    ["storage", "storage", ">=", 1],
  ] as const) {
    if (params[key] && Number.isFinite(Number(params[key])))
      add(`l.${column}${op}?`, Number(params[key]) * multiplier);
  }
  if (params.cpu) add("l.cpu ILIKE ?", "%" + params.cpu.slice(0, 100) + "%");
  if (params.model)
    add("l.model ILIKE ?", "%" + params.model.slice(0, 100) + "%");
  if (params.screen)
    add("l.screen ILIKE ?", "%" + params.screen.slice(0, 60) + "%");
  if (params.battery && Number.isFinite(Number(params.battery)))
    add("l.battery>=?", Number(params.battery));
  if (params.negotiable === "yes") clauses.push("l.negotiable=true");
  if (params.delivery === "yes") clauses.push("l.delivery=true");
  if (params.warranty === "yes")
    clauses.push(
      "length(trim(l.warranty))>0 AND lower(l.warranty) NOT IN ('no warranty','none','n/a')",
    );
  if (params.inspected === "yes") clauses.push("FALSE");
  if (params.seller_type === "dealer" || params.seller_type === "individual")
    add(
      "l.seller_id IN (SELECT id FROM public_sellers() WHERE seller_type=?)",
      params.seller_type,
    );
  const use = useCases[params.use || ""];
  if (use) {
    add("l.ram>=?", use.ram);
    add("l.storage>=?", use.storage);
  }
  if (params.gpu === "dedicated" || use?.gpu)
    clauses.push(
      "(l.gpu ~* '(nvidia|geforce|quadro|rtx|gtx|radeon.*rx)' AND l.gpu !~* '(integrated|no dedicated)')",
    );
  if (params.seller) add("l.seller_id=?", z.uuid().parse(params.seller));
  const sort =
    (
      {
        low: "l.price ASC",
        high: "l.price DESC",
        recent: "l.created_at DESC",
        relevance: params.q?.trim()
          ? "ts_rank(to_tsvector('simple',l.brand||' '||l.model||' '||l.cpu||' '||l.description),plainto_tsquery('simple',$1)) DESC"
          : "l.created_at DESC",
      } as Record<string, string>
    )[params.sort ?? "recent"] ?? "l.created_at DESC";
  const page = Math.min(
    10000,
    Math.max(1, Math.floor(Number(params.page) || 1)),
  );
  return { where: clauses.join(" AND "), values, sort, page };
}
export const money = (minor: number) =>
  "KSh " + new Intl.NumberFormat("en-KE").format(minor / 100);
