CREATE TABLE IF NOT EXISTS players (
  telegram_id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  points BIGINT NOT NULL DEFAULT 0,
  xp BIGINT NOT NULL DEFAULT 0,
  taps BIGINT NOT NULL DEFAULT 0,
  energy INTEGER NOT NULL DEFAULT 1000,
  last_energy_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tap_events (
  id BIGSERIAL PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES players(telegram_id),
  taps INTEGER NOT NULL,
  points_added INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS tap_events_player_created_idx ON tap_events(telegram_id, created_at DESC);