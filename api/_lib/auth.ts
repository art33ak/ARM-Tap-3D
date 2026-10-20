import type { VercelRequest } from "@vercel/node";
import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramUser = { id: number; username?: string; first_name?: string };

export function getTelegramUser(req: VercelRequest): TelegramUser {
  const header = req.headers.authorization || "";
  const raw = header.startsWith("tma ") ? header.slice(4) : "";
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // Demo mode exists only to let developers preview locally before configuring BotFather.
  if (!raw && process.env.ALLOW_DEMO_MODE === "true" && process.env.VERCEL_ENV !== "production") {
    return { id: 100000001, first_name: "Demo Player", username: "arm_demo" };
  }
  if (!raw || !token) throw new Error("Telegram authentication is required.");

  const params = new URLSearchParams(raw);
  const hash = params.get("hash");
  const authDate = Number(params.get("auth_date") || 0);
  if (!hash || !authDate) throw new Error("Invalid Telegram initData.");
  if (Math.abs(Date.now() / 1000 - authDate) > 86400) throw new Error("Telegram initData expired.");

  const pairs: string[] = [];
  params.forEach((value, key) => { if (key !== "hash") pairs.push(`${key}=${value}`); });
  pairs.sort();
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  const calculated = createHmac("sha256", secret).update(pairs.join("\n")).digest("hex");
  const a = Buffer.from(calculated, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Telegram signature verification failed.");

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("Telegram user is missing.");
  const user = JSON.parse(userRaw) as TelegramUser;
  if (!user.id) throw new Error("Invalid Telegram user.");
  return user;
}