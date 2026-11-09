// Storage. On Netlify this is Netlify Blobs (no database to set up).
// For local testing set LOCAL_STORE=<folder> and records are saved as JSON files there.
import { getStore } from "@netlify/blobs";
import { promises as fs } from "node:fs";
import path from "node:path";

function fileStore(dir) {
  const file = key => path.join(dir, encodeURIComponent(key) + ".json");
  return {
    async get(key) {
      try { return JSON.parse(await fs.readFile(file(key), "utf8")); } catch { return null; }
    },
    async setJSON(key, value) {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(file(key), JSON.stringify(value));
    },
    async delete(key) { try { await fs.unlink(file(key)); } catch {} },
    async list({ prefix = "" } = {}) {
      let names = [];
      try { names = await fs.readdir(dir); } catch {}
      const blobs = names.filter(n => n.endsWith(".json")).map(n => ({ key: decodeURIComponent(n.slice(0, -5)) })).filter(b => b.key.startsWith(prefix));
      return { blobs };
    }
  };
}

let cached;
export function store() {
  if (cached) return cached;
  if (process.env.LOCAL_STORE) return (cached = fileStore(process.env.LOCAL_STORE));
  const s = getStore({ name: "storybloom", consistency: "strong" });
  cached = {
    get: key => s.get(key, { type: "json" }),
    setJSON: (key, value) => s.setJSON(key, value),
    delete: key => s.delete(key),
    list: opts => s.list(opts)
  };
  return cached;
}

export async function listJSON(prefix) {
  const st = store();
  const { blobs } = await st.list({ prefix });
  const out = [];
  for (const b of blobs) { const v = await st.get(b.key); if (v) out.push(v); }
  return out;
}
