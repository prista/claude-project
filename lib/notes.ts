import { db } from "./db";

export type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

export function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

export function getNotesByUser(userId: string): Note[] {
  const rows = db
    .query("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId) as NoteRow[];
  return rows.map(rowToNote);
}

export function getNoteById(id: string, userId: string): Note | null {
  const row = db
    .query("SELECT * FROM notes WHERE id = ? AND user_id = ?")
    .get(id, userId) as NoteRow | null;
  return row ? rowToNote(row) : null;
}

export function createNote(
  userId: string,
  data: { title?: string; contentJson?: string },
): Note {
  const id = crypto.randomUUID();
  const title = data.title?.trim() || "Untitled note";
  const contentJson = data.contentJson || EMPTY_DOC;
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO notes (id, user_id, title, content_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, title, contentJson, now, now],
  );

  return {
    id,
    userId,
    title,
    contentJson,
    isPublic: false,
    publicSlug: null,
    createdAt: now,
    updatedAt: now,
  };
}
