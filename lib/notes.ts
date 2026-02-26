import { nanoid } from 'nanoid';
import { db } from './db';

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

const EMPTY_DOC = JSON.stringify({ type: 'doc', content: [] });

export function getNotesByUser(userId: string): Note[] {
  const rows = db
    .query('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId) as NoteRow[];
  return rows.map(rowToNote);
}

export function getNoteById(id: string, userId: string): Note | null {
  const row = db
    .query('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(id, userId) as NoteRow | null;
  return row ? rowToNote(row) : null;
}

export function updateNote(
  id: string,
  userId: string,
  data: { title?: string; contentJson?: string },
): Note | null {
  const title = data.title?.trim() || undefined;
  const contentJson = data.contentJson || undefined;
  const now = new Date().toISOString();

  const sets: string[] = ['updated_at = ?'];
  const values: string[] = [now];

  if (title) {
    sets.push('title = ?');
    values.push(title);
  }
  if (contentJson) {
    sets.push('content_json = ?');
    values.push(contentJson);
  }

  values.push(id, userId);

  db.run(`UPDATE notes SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, values);

  return getNoteById(id, userId);
}

export function deleteNote(id: string, userId: string): boolean {
  const result = db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return result.changes > 0;
}

export function toggleNotePublic(id: string, userId: string, isPublic: boolean): Note | null {
  const now = new Date().toISOString();

  if (isPublic) {
    const slug = nanoid();
    db.run(
      'UPDATE notes SET is_public = 1, public_slug = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [slug, now, id, userId],
    );
  } else {
    db.run(
      'UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = ? WHERE id = ? AND user_id = ?',
      [now, id, userId],
    );
  }

  return getNoteById(id, userId);
}

export function getNoteByPublicSlug(slug: string): Note | null {
  const row = db
    .query('SELECT * FROM notes WHERE public_slug = ? AND is_public = 1')
    .get(slug) as NoteRow | null;
  return row ? rowToNote(row) : null;
}

export function createNote(userId: string, data: { title?: string; contentJson?: string }): Note {
  const id = crypto.randomUUID();
  const title = data.title?.trim() || 'Untitled note';
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
