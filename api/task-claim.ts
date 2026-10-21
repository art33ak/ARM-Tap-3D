import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTelegramUser } from "./_lib/auth.js";
import { db } from "./_lib/db.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const user = getTelegramUser(req);
    const taskId = Number(req.body?.taskId);

    if (!Number.isSafeInteger(taskId) || taskId < 1) {
      return res.status(400).json({ error: "Invalid task ID." });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Bot token is not configured." });
    }

    const sql = db();
    const tasks = await sql`
      SELECT id, reward, link
      FROM tasks
      WHERE id = ${taskId} AND active = TRUE
    `;

    if (!tasks.length) {
      return res.status(404).json({ error: "Task not found." });
    }

    const task = tasks[0];
    let username = "";

    try {
      const url = new URL(String(task.link ?? ""));
      if (url.hostname !== "t.me") throw new Error("Invalid task link.");
      username = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } catch {
      return res.status(400).json({
        error: "This task does not have a valid Telegram group link."
      });
    }

    if (username.toLowerCase() !== "armtap") {
      return res.status(400).json({
        error: "This endpoint only verifies the @armtap group."
      });
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/getChatMember`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "@armtap",
          user_id: user.id
        })
      }
    );

    const membership = await response.json();

    if (!response.ok || !membership.ok) {
      return res.status(502).json({
        error: "Could not verify group membership. Try again later."
      });
    }

    const status = membership.result?.status;
    const isMember =
      status === "creator" ||
      status === "administrator" ||
      status === "member" ||
      (status === "restricted" && membership.result?.is_member === true);

    if (!isMember) {
      return res.status(403).json({
        error: "Join the @armtap group first, then verify again."
      });
    }

    const telegramId = String(user.id);
    const reward = Number(task.reward);

    if (!Number.isSafeInteger(reward) || reward < 0) {
      return res.status(500).json({ error: "Invalid task reward." });
    }

    const result = await sql.begin(async (tx) => {
      const inserted = await tx`
        INSERT INTO task_completions
          (telegram_id, task_id, reward, verification_status,
           verification_details)
        VALUES (
          ${telegramId},
          ${task.id},
          ${reward},
          'verified',
          ${JSON.stringify({
            method: "telegram_getChatMember",
            chat: "@armtap"
          })}::jsonb
        )
        ON CONFLICT (telegram_id, task_id) DO NOTHING
        RETURNING id
      `;

      if (!inserted.length) return { alreadyClaimed: true };

      const updated = await tx`
        UPDATE players
        SET points = points + ${reward},
            updated_at = NOW()
        WHERE telegram_id = ${telegramId}
        RETURNING points, xp, taps, energy
      `;

      if (!updated.length) {
        throw new Error("Player not initialized. Reload the game.");
      }

      return { alreadyClaimed: false, reward, player: updated[0] };
    });

    if (result.alreadyClaimed) {
      return res.status(409).json({
        error: "You have already claimed this task."
      });
    }

    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({
      error: e instanceof Error ? e.message : "Task claim failed."
    });
  }
}
