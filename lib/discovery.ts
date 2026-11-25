export const useCases: Record<
  string,
  { label: string; ram: number; storage: number; gpu?: boolean; note: string }
> = {
  students: {
    label: "Students",
    ram: 8,
    storage: 256,
    note: "8 GB RAM and 256 GB storage for everyday coursework. Check your course software requirements.",
  },
  office: {
    label: "Office work",
    ram: 8,
    storage: 256,
    note: "8 GB RAM and 256 GB storage for documents, browsing and calls.",
  },
  programming: {
    label: "Programming",
    ram: 16,
    storage: 512,
    note: "16 GB RAM and 512 GB storage for development tools. Confirm OS and framework compatibility.",
  },
  engineering: {
    label: "Engineering",
    ram: 16,
    storage: 512,
    gpu: true,
    note: "16 GB RAM, 512 GB storage and a declared discrete GPU. Verify exact software and GPU requirements.",
  },
  architecture: {
    label: "Architecture",
    ram: 16,
    storage: 512,
    gpu: true,
    note: "16 GB RAM and a declared discrete GPU; verify CAD/rendering compatibility and GPU memory.",
  },
  design: {
    label: "Graphic design",
    ram: 16,
    storage: 512,
    note: "16 GB RAM and 512 GB storage. Ask about colour accuracy; it is not independently measured.",
  },
  video: {
    label: "Video editing",
    ram: 16,
    storage: 512,
    gpu: true,
    note: "16 GB RAM and a declared discrete GPU. Codec, resolution and project size affect suitability.",
  },
  gaming: {
    label: "Gaming",
    ram: 16,
    storage: 512,
    gpu: true,
    note: "16 GB RAM and a declared discrete GPU. Check the exact GPU and games; no frame-rate promise.",
  },
  remote: {
    label: "Remote work",
    ram: 8,
    storage: 256,
    note: "8 GB RAM and 256 GB storage. Test webcam, microphone, Wi-Fi and battery before buying.",
  },
  business: {
    label: "Business",
    ram: 8,
    storage: 256,
    note: "8 GB RAM and 256 GB storage. Confirm security, software and warranty needs.",
  },
};
export function interpretSearch(input: Record<string, string | undefined>) {
  const p = { ...input };
  let q = (p.q || "").slice(0, 200).trim();
  const budget = q.match(
    /\b(?:under|below|up to)\s*(?:ksh\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?\b/i,
  );
  if (budget) {
    if (!p.max)
      p.max = String(
        Number(budget[1].replaceAll(",", "")) * (budget[2] ? 1000 : 1),
      );
    q = q.replace(budget[0], " ");
  }
  const ram = q.match(/\b(?:with\s+)?(\d+)\s*gb\s*ram\b/i);
  if (ram) {
    if (!p.ram) p.ram = ram[1];
    q = q.replace(ram[0], " ");
  }
  const county = q.match(
    /\bin\s+(Nairobi|Mombasa|Kisumu|Nakuru|Kiambu|Machakos|Kajiado|Uasin Gishu)\b/i,
  );
  if (county) {
    if (!p.county)
      p.county = county[1].replace(/\b\w/g, (c) => c.toUpperCase());
    q = q.replace(county[0], " ");
  }
  for (const [key, value] of Object.entries(useCases)) {
    const names = [key, value.label.toLowerCase()];
    if (names.some((n) => new RegExp("\\b" + n + "\\b", "i").test(q))) {
      if (!p.use) p.use = key;
      for (const n of names)
        q = q.replace(new RegExp("\\b" + n + "\\b", "ig"), " ");
      break;
    }
  }
  q = q
    .replace(/\b(laptops?|for|with)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  p.q = q;
  return p;
}
