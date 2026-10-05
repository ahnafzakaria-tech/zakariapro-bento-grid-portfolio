import { myProjects, Project } from "../ts/projects";

export const SITE_URL = "https://zakariapro.vercel.app";

export const FULL_NAME = "Md Zakaria Hossain";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// ---------- Projects ----------

export function projectSlug(p: Project): string {
  return slugify(p.title);
}

export function findProjectBySlug(slug: string): Project | undefined {
  const norm = slug.toLowerCase();
  return (
    myProjects.find((p) => projectSlug(p) === norm) ||
    // also allow /projects/<id> as a fallback for older links
    myProjects.find((p) => String(p.id) === norm)
  );
}

export function allProjectRoutes(): string[] {
  return myProjects.map((p) => `/projects/${projectSlug(p)}`);
}

// ---------- Full canonical URL builder ----------

export function canonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}
