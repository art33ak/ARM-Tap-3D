import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTelegramUser } from "./_lib/auth.js";
import { db } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const user = getTelegramUser(req);
    const sql = db();
    await sql`
      INSERT INTO players (telegram_id, username, first_name)
      VALUES (${String(user.id)}, ${user.username ?? null}, ${user.first_name ?? "Player"})
      ON CONFLICT (telegram_id) DO UPDATE SET
        username = EXCLUDED.username, first_name = EXCLUDED.first_name, updated_at = NOW()
    `;
    const rows = await sql`SELECT points, xp, taps, energy FROM players WHERE telegram_id = ${String(user.id)}`;
    return res.status(200).json({ user: { name: user.first_name ?? "Player" }, player: rows[0] });
  } catch (e) {
    return res.status(401).json({ error: e instanceof Error ? e.message : "Could not load player." });
  }
}