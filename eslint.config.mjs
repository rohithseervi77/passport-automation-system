import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "prefer-const": "off",
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "generated/**",
    "prisma/*.mjs",
    "scripts/**",
    "components/GlowCursor.tsx",
    "components/InfiniteMenu.tsx",
    "components/PassportIndexExplorer.tsx",
    "components/PassportCover.tsx",
    "components/LandingEnhancements.tsx",
    "components/ShinyText.tsx",
    "components/TextEffect.tsx",
    "components/ThemeToggle.tsx",
  ]),
]);

export default eslintConfig;
