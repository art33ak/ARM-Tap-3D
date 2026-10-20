import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTelegramUser } from "./_lib/auth.js";
import { db } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const user = getTelegramUser(req);
    const requested = Number(req.body?.taps ?? 1);
    if (!Number.isInteger(requested) || requested < 1 || requested > 20) {
      return res.status(400).json({ error: "Tap batch must be between 1 and 20." });
    }
    const sql = db();
    const result = await sql.begin(async tx => {
      const rows = await tx`
        SELECT points, xp, taps, energy FROM players
        WHERE telegram_id = ${String(user.id)} FOR UPDATE
      `;
      if (!rows.length) throw new Error("Player not initialized. Reload the game.");
      const player = rows[0];
      const allowed = Math.min(requested, Number(player.energy));
      if (allowed < 1) return { ...player, added: 0 };
      const added = allowed; // 1 point per accepted tap; tune rewards server-side later.
      const updated = await tx`
        UPDATE players SET points = points + ${added}, xp = xp + ${added},
          taps = taps + ${allowed}, energy = energy - ${allowed}, updated_at = NOW()
        WHERE telegram_id = ${String(user.id)}
        RETURNING points, xp, taps, energy
      `;
      await tx`INSERT INTO tap_events (telegram_id, taps, points_added)
        VALUES (${String(user.id)}, ${allowed}, ${added})`;
      return { ...updated[0], added };
    });
    return res.status(200).json({ player: result });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Tap failed." });
  }
}