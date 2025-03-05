import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://spencercarnage.com",
  integrations: [mdx(), sitemap(), react()],
  vite: {
    mergedConfigCallback: ({ mode }) => {
      if (config.mode === "prod") {
        config.legacy = { buildSsrCjsExternalHeuristics: import.meta.env.SSR };
        config.ssr = { noExternal: ["@emotion/*"] };
      }

      return config;
    },
  },
});
