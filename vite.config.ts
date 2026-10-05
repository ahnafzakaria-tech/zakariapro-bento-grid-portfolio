import { defineConfig, type Plugin } from "vite";
import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const SITE_URL = "https://devdeepsaha.in";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// Parses source files with regex to enumerate projects and blogs without
// having to execute TypeScript at build config time.
function readTitles(sourcePath: string, pattern: RegExp): string[] {
  try {
    const src = fs.readFileSync(sourcePath, "utf-8");
    const titles: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(src)) !== null) {
      titles.push(m[1]);
    }
    return titles;
  } catch {
    return [];
  }
}

function sitemapPlugin(): Plugin {
  return {
    name: "generate-sitemap",
    apply: "build",
    closeBundle() {
      const projectsFile = path.resolve(__dirname, "src/app/ts/projects.ts");
      const hobbiesFile = path.resolve(__dirname, "src/app/ts/hobbies.ts");

      // Matches `title: "..."` inside project entries.
      const projectTitles = readTitles(
        projectsFile,
        /title:\s*"([^"]+)"/g,
      );
      // Matches `title: "..."` inside blogContent blocks. Same pattern
      // gives all titles; we de-dupe against projects since blogContent
      // titles differ from item titles in some cases.
      const hobbyTitles = readTitles(
        hobbiesFile,
        /blogContent:\s*\{\s*title:\s*"([^"]+)"/g,
      );

      const staticRoutes = [
        { loc: "/", priority: "1.0" },
        { loc: "/projects", priority: "0.9" },
        { loc: "/blog", priority: "0.9" },
        { loc: "/story", priority: "0.8" },
        { loc: "/learning", priority: "0.7" },
      ];

      const projectRoutes = projectTitles.map((t) => ({
        loc: `/projects/${slugify(t)}`,
        priority: "0.8",
      }));

      const blogRoutes = hobbyTitles.map((t) => ({
        loc: `/blog/${slugify(t)}`,
        priority: "0.8",
      }));

      const all = [...staticRoutes, ...projectRoutes, ...blogRoutes];
      // De-dupe by loc
      const seen = new Set<string>();
      const unique = all.filter((r) => {
        if (seen.has(r.loc)) return false;
        seen.add(r.loc);
        return true;
      });

      const today = new Date().toISOString().slice(0, 10);
      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        unique
          .map(
            (r) =>
              `  <url>\n    <loc>${SITE_URL}${r.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
          )
          .join("\n") +
        `\n</urlset>\n`;

      const distPath = path.resolve(__dirname, "dist/sitemap.xml");
      fs.writeFileSync(distPath, xml, "utf-8");
      console.log(
        `[sitemap] wrote ${unique.length} URLs to dist/sitemap.xml`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sitemapPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
