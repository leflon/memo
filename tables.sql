CREATE TABLE IF NOT EXISTS ApiKey(
    -- Single-row table; only one API key exists at a time
    id   INTEGER PRIMARY KEY,
    hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Collections(
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Cards(
    id              TEXT PRIMARY KEY,
    front_text      TEXT NOT NULL,
    back_text       TEXT NOT NULL,
    collection_id   TEXT,
    easiness_factor REAL    NOT NULL DEFAULT 2.5,
    repetitions     INTEGER NOT NULL DEFAULT 0,
    interval        INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(collection_id) REFERENCES Collections(id)
);
