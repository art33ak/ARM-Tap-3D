# ARM Tap — Telegram Mini App starter

A starter implementation for `taptoearn.site`: React + TypeScript + Vite, a Three.js 3D ARM coin, Vercel serverless API routes, Telegram `initData` verification, and PostgreSQL persistence.

## Current scope
- 3D tap-to-earn screen with responsive mobile UI
- Server-side Telegram Mini App authentication (HMAC validation)
- PostgreSQL player state and tap event logging
- Server-side energy and points update (1 game point per accepted tap)
- Clearly marked preview fallback when API is not configured

## Not implemented yet
Daily reward claims, referrals, leaderboard, admin tools, TON Connect, real ARM token payouts, and STON.fi swaps are intentionally not active. Game points are **not** ARM Jettons and have no on-chain value. Add those only after the core game is deployed and tested.

## 1. Requirements
- GitHub account
- Vercel account
- PostgreSQL database provider (for example Neon)
- Telegram bot created in BotFather
- Node.js 20+ for local development

## 2. Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Set `TELEGRAM_BOT_TOKEN` and `DATABASE_URL` in `.env.local`. `ALLOW_DEMO_MODE=true` enables local preview only when there is no Telegram initData; it does not replace production authentication.

Run the SQL in `db/schema.sql` against your PostgreSQL database.

## 3. Deploy
1. Upload this project to a new GitHub repository.
2. In Vercel, choose **Add New → Project**, import the repository.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Add Environment Variables in Vercel Project Settings:
   - `TELEGRAM_BOT_TOKEN` — the bot token from BotFather (server-only; never prefix with `VITE_`)
   - `DATABASE_URL` — PostgreSQL connection string
   - `ALLOW_DEMO_MODE` — set to `false` in production
5. Deploy. After setting or changing variables, redeploy.
6. Add `taptoearn.site` under Vercel Project → Settings → Domains. Follow Vercel's displayed DNS instructions in Namecheap. DNS values can vary; copy the exact records Vercel shows rather than guessing.
7. Wait for domain verification and HTTPS certificate. Open `https://taptoearn.site` and test it.

## 4. Create the database
Create a PostgreSQL database (for example, Neon). Open its SQL editor and run `db/schema.sql`. Copy its connection string into Vercel's `DATABASE_URL`. Prefer a pooled connection string if your provider offers one for serverless deployments.

## 5. Connect Telegram
In BotFather:
1. Use `/mybots` → select `@ARM_Taptoearn_Bot`.
2. Open **Bot Settings → Configure Mini App** (menu labels can vary) and set the Web App URL to `https://taptoearn.site`.
3. If you use a menu button, set its URL to the same HTTPS address.
4. Open the app from Telegram, not only from a normal browser. The backend validates Telegram's signed `initData`; `initDataUnsafe` is never used for authentication.

## 6. Verify
- Open the app in Telegram.
- Tap the coin and confirm that points increase.
- Refresh: saved points should remain.
- Check Vercel Functions logs if `/api/state` or `/api/tap` returns an error.
- Test with a second Telegram account before inviting users.

## Security notes
- Never publish the bot token, database URL, private keys, or wallet seed phrase.
- This starter has basic tap batching and row locking, not a complete anti-bot/rate-limiting system. Add rate limits, abuse monitoring, energy regeneration, daily rewards, and admin controls before public launch.
- The client-only preview counter is temporary and is not saved. Do not use preview points for rewards.
- Keep real-token withdrawals and STON.fi transactions disabled until token contracts, reward budget, eligibility rules, and security review are complete.

## Source layout
```text
api/
  _lib/auth.ts       Telegram initData verification
  _lib/db.ts         PostgreSQL connection
  state.ts           Load/create player state
  tap.ts             Secure server-side tap update
db/schema.sql        Database tables
src/App.tsx          3D Mini App UI
src/style.css        Dark neon design
```


## Admin panel and task management

1. Apply the updated `db/schema.sql` to the PostgreSQL database configured by `DATABASE_URL`.
2. In Vercel project settings, add `ADMIN_TOKEN` as a long, random secret (at least 32 characters). Do not put the real token in GitHub or in frontend code.
3. Redeploy the project.
4. Open the app, go to **More → Admin panel**, enter the admin token, then add/edit/deactivate tasks. The browser keeps the token only in the current page state; reload clears it.
5. Public `GET /api/tasks` lists active tasks. Create/update/deactivate operations require `x-admin-token`.

Important: this version stores task definitions and provides an admin CRUD panel. It does not yet automatically verify Telegram channel membership, award task rewards, or implement referrals/TON Connect. Do not advertise a task as verified/rewarded until verification and reward-claim endpoints are implemented.


## Admin panel and task management

1. Apply the updated `db/schema.sql` to the PostgreSQL database configured by `DATABASE_URL`.
2. In Vercel project settings, add `ADMIN_TOKEN` as a long, random secret (at least 32 characters). Do not put the real token in GitHub or in frontend code.
3. Redeploy the project.
4. Open the app, go to **More → Admin panel**, enter the admin token, then add/edit/deactivate tasks. The browser keeps the token only in the current page state; reload clears it.
5. Public `GET /api/tasks` lists active tasks. Create/update/deactivate operations require `x-admin-token`.

Important: this version stores task definitions and provides an admin CRUD panel. It does not yet automatically verify Telegram channel membership, award task rewards, or implement referrals/TON Connect. Do not advertise a task as verified/rewarded until verification and reward-claim endpoints are implemented.
