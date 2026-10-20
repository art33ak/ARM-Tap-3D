import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_lib/db.js";

function isAdmin(req: VercelRequest) {
  const expected = process.env.ADMIN_TOKEN;
  const provided = req.headers["x-admin-token"];
  return Boolean(expected && typeof provided === "string" && provided.length > 0 && provided === expected);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method !== "GET" && !isAdmin(req)) return res.status(401).json({ error: "Admin authorization required." });
    const sql = db();
    if (req.method === "GET") {
      const rows = await sql`SELECT id, title, description, reward, link, active FROM tasks WHERE active = TRUE ORDER BY id DESC`;
      return res.status(200).json({ tasks: rows });
    }
    if (req.method === "POST") {
      const title = String(req.body?.title ?? "").trim();
      const description = String(req.body?.description ?? "").trim();
      const reward = Number(req.body?.reward ?? 0);
      const link = String(req.body?.link ?? "").trim() || null;
      if (!title || title.length > 120 || !Number.isInteger(reward) || reward < 0 || reward > 1000000000) {
        return res.status(400).json({ error: "Enter a title (max 120 characters) and a non-negative whole-number reward." });
      }
      const rows = await sql`INSERT INTO tasks (title, description, reward, link, active) VALUES (${title}, ${description}, ${reward}, ${link}, TRUE) RETURNING id, title, description, reward, link, active`;
      return res.status(201).json({ task: rows[0] });
    }
    if (req.method === "PATCH") {
      const id = Number(req.body?.id);
      const title = String(req.body?.title ?? "").trim();
      const description = String(req.body?.description ?? "").trim();
      const reward = Number(req.body?.reward ?? 0);
      const link = String(req.body?.link ?? "").trim() || null;
      const active = req.body?.active !== false;
      if (!Number.isInteger(id) || id < 1 || !title || title.length > 120 || !Number.isInteger(reward) || reward < 0) return res.status(400).json({ error: "Invalid task details." });
      const rows = await sql`UPDATE tasks SET title=${title}, description=${description}, reward=${reward}, link=${link}, active=${active}, updated_at=NOW() WHERE id=${id} RETURNING id, title, description, reward, link, active`;
      if (!rows.length) return res.status(404).json({ error: "Task not found." });
      return res.status(200).json({ task: rows[0] });
    }
    if (req.method === "DELETE") {
      const id = Number(req.body?.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid task id." });
      const rows = await sql`UPDATE tasks SET active=FALSE, updated_at=NOW() WHERE id=${id} RETURNING id`;
      if (!rows.length) return res.status(404).json({ error: "Task not found." });
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Tasks service failed." });
  }
}
