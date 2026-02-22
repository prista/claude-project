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
