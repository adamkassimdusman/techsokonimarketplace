import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";
export default defineConfig([
  ...next,
  ...ts,
  {
    files: [
      "components/catalog.tsx",
      "components/gallery.tsx",
      "components/compare-table.tsx",
      "components/photo-uploader.tsx",
      "app/laptop/**/page.tsx",
    ],
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([
    ".next/**",
    ".data/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
