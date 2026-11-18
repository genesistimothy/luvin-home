import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Serves the Vercel functions from `api/` under `npm run dev`, so the site and
// its endpoints can be exercised without a linked Vercel project.
function devApi(root) {
  return {
    name: "dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        if (!url.pathname.startsWith("/api/")) return next();

        const parts = url.pathname.slice(5).split("/").filter(Boolean);
        const direct = resolve(root, "api", `${parts.join("/")}.js`);
        const index = resolve(root, "api", ...parts, "index.js");
        const dynamic = parts.length > 1 ? resolve(root, "api", ...parts.slice(0, -1), "[id].js") : "";
        const file = [direct, index, dynamic].find((candidate) => candidate && existsSync(candidate));
        if (!file) return next();

        try {
          req.query = Object.fromEntries(url.searchParams);
          if (file === dynamic) req.query.id = parts.at(-1);
          if (req.method !== "GET" && req.method !== "HEAD" && !req.body) {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            req.body = Buffer.concat(chunks);
          }
          // Dev-only knob for exercising loading states on a slow network.
          if (process.env.DEV_API_DELAY_MS) {
            await new Promise((done) => setTimeout(done, Number(process.env.DEV_API_DELAY_MS)));
          }
          // Bust the ESM cache so an edited handler runs without a server restart.
          const mod = await import(`${pathToFileURL(file).href}?v=${statSync(file).mtimeMs}`);
          await mod.default(req, res);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ""))) {
    if (!(key in process.env)) process.env[key] = value;
  }
  return { plugins: [react(), devApi(process.cwd())] };
});
