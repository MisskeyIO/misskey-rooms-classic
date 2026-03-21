CREATE TABLE IF NOT EXISTS rooms (
  user_id TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 0,
  room_type TEXT NOT NULL DEFAULT 'default',
  carpet_color TEXT NOT NULL DEFAULT '#85CAF0',
  furnitures TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, floor)
);

CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);
