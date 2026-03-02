import { describe, it, expect, beforeEach, vi } from 'vitest';
import BetterSqlite3 from 'better-sqlite3';

// Create an in-memory DB using better-sqlite3
const memDb = new BetterSqlite3(':memory:');

// Adapt better-sqlite3 API to match bun:sqlite API used by the app
const bunCompatDb = {
  run(sql: string, params?: unknown[]) {
    const stmt = memDb.prepare(sql);
    if (params) {
      return stmt.run(...params);
    }
    return stmt.run();
  },
  query(sql: string) {
    return {
      all(...params: unknown[]) {
        return memDb.prepare(sql).all(...params);
      },
      get(...params: unknown[]) {
        return memDb.prepare(sql).get(...params) ?? null;
      },
    };
  },
};

vi.mock('@/lib/db', () => ({ db: bunCompatDb }));

vi.mock('nanoid', () => ({
  nanoid: () => 'test-slug-123',
}));

const {
  rowToNote,
  createNote,
  getNotesByUser,
  getNoteById,
  updateNote,
  deleteNote,
  toggleNotePublic,
  getNoteByPublicSlug,
} = await import('@/lib/notes');

function createNotesTable() {
  memDb.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      public_slug TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

describe('notes repository', () => {
  beforeEach(() => {
    memDb.exec('DROP TABLE IF EXISTS notes');
    createNotesTable();
  });

  describe('rowToNote', () => {
    it('converts snake_case row to camelCase Note', () => {
      const row = {
        id: '1',
        user_id: 'u1',
        title: 'Test',
        content_json: '{}',
        is_public: 0,
        public_slug: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      const note = rowToNote(row);
      expect(note.userId).toBe('u1');
      expect(note.contentJson).toBe('{}');
      expect(note.isPublic).toBe(false);
      expect(note.publicSlug).toBeNull();
      expect(note.createdAt).toBe('2024-01-01');
    });

    it('converts is_public: 1 to true', () => {
      const row = {
        id: '1',
        user_id: 'u1',
        title: 'Test',
        content_json: '{}',
        is_public: 1,
        public_slug: 'slug',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      expect(rowToNote(row).isPublic).toBe(true);
    });
  });

  describe('createNote', () => {
    it('inserts a note with defaults', () => {
      const note = createNote('user-1', {});
      expect(note.userId).toBe('user-1');
      expect(note.title).toBe('Untitled note');
      expect(note.isPublic).toBe(false);
      expect(note.id).toBeTruthy();

      const dbNote = getNoteById(note.id, 'user-1');
      expect(dbNote).not.toBeNull();
      expect(dbNote!.title).toBe('Untitled note');
    });

    it('uses provided title and content', () => {
      const content = JSON.stringify({ type: 'doc', content: [] });
      const note = createNote('user-1', { title: 'My Note', contentJson: content });
      expect(note.title).toBe('My Note');
      expect(note.contentJson).toBe(content);
    });
  });

  describe('getNotesByUser', () => {
    it('returns only notes for the given user ordered by updated_at DESC', () => {
      const noteA = createNote('user-1', { title: 'Note A' });
      createNote('user-2', { title: 'Note B' });
      const noteC = createNote('user-1', { title: 'Note C' });

      // Give noteC a later updated_at so ordering is deterministic
      memDb
        .prepare('UPDATE notes SET updated_at = ? WHERE id = ?')
        .run('2099-01-01T00:00:00.000Z', noteC.id);
      memDb
        .prepare('UPDATE notes SET updated_at = ? WHERE id = ?')
        .run('2000-01-01T00:00:00.000Z', noteA.id);

      const notes = getNotesByUser('user-1');
      expect(notes).toHaveLength(2);
      expect(notes[0].title).toBe('Note C');
      expect(notes[1].title).toBe('Note A');
    });

    it('returns empty array for user with no notes', () => {
      expect(getNotesByUser('no-user')).toEqual([]);
    });
  });

  describe('getNoteById', () => {
    it('returns note for correct user', () => {
      const note = createNote('user-1', { title: 'Test' });
      expect(getNoteById(note.id, 'user-1')).not.toBeNull();
    });

    it('returns null for wrong user', () => {
      const note = createNote('user-1', { title: 'Test' });
      expect(getNoteById(note.id, 'user-2')).toBeNull();
    });

    it('returns null for non-existent ID', () => {
      expect(getNoteById('nope', 'user-1')).toBeNull();
    });
  });

  describe('updateNote', () => {
    it('updates title', () => {
      const note = createNote('user-1', { title: 'Old' });
      const updated = updateNote(note.id, 'user-1', { title: 'New' });
      expect(updated!.title).toBe('New');
    });

    it('updates content', () => {
      const note = createNote('user-1', {});
      const newContent = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });
      const updated = updateNote(note.id, 'user-1', { contentJson: newContent });
      expect(updated!.contentJson).toBe(newContent);
    });

    it('returns null for wrong user', () => {
      const note = createNote('user-1', {});
      expect(updateNote(note.id, 'user-2', { title: 'Hack' })).toBeNull();
    });
  });

  describe('deleteNote', () => {
    it('returns true on success', () => {
      const note = createNote('user-1', {});
      expect(deleteNote(note.id, 'user-1')).toBe(true);
      expect(getNoteById(note.id, 'user-1')).toBeNull();
    });

    it('returns false for non-existent note', () => {
      expect(deleteNote('nope', 'user-1')).toBe(false);
    });

    it('returns false for wrong user', () => {
      const note = createNote('user-1', {});
      expect(deleteNote(note.id, 'user-2')).toBe(false);
    });
  });

  describe('toggleNotePublic', () => {
    it('sets slug when enabling public', () => {
      const note = createNote('user-1', {});
      const toggled = toggleNotePublic(note.id, 'user-1', true);
      expect(toggled!.isPublic).toBe(true);
      expect(toggled!.publicSlug).toBe('test-slug-123');
    });

    it('clears slug when disabling public', () => {
      const note = createNote('user-1', {});
      toggleNotePublic(note.id, 'user-1', true);
      const toggled = toggleNotePublic(note.id, 'user-1', false);
      expect(toggled!.isPublic).toBe(false);
      expect(toggled!.publicSlug).toBeNull();
    });
  });

  describe('getNoteByPublicSlug', () => {
    it('finds public note by slug', () => {
      const note = createNote('user-1', { title: 'Public Note' });
      toggleNotePublic(note.id, 'user-1', true);
      const found = getNoteByPublicSlug('test-slug-123');
      expect(found).not.toBeNull();
      expect(found!.title).toBe('Public Note');
    });

    it('returns null for private note', () => {
      createNote('user-1', {});
      expect(getNoteByPublicSlug('test-slug-123')).toBeNull();
    });

    it('returns null for non-existent slug', () => {
      expect(getNoteByPublicSlug('no-such-slug')).toBeNull();
    });
  });
});
