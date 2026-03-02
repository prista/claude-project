import { describe, it, expect } from 'vitest';
import { createNoteSchema } from '@/lib/schemas/note';

const validDoc = JSON.stringify({ type: 'doc', content: [] });

describe('createNoteSchema', () => {
  it('accepts valid input with title and content', () => {
    const result = createNoteSchema.safeParse({
      title: 'My Note',
      content_json: validDoc,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('My Note');
      expect(result.data.content_json).toBe(validDoc);
    }
  });

  it('accepts missing title (optional)', () => {
    const result = createNoteSchema.safeParse({
      content_json: validDoc,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBeUndefined();
    }
  });

  it('trims title and converts empty string to undefined', () => {
    const result = createNoteSchema.safeParse({
      title: '   ',
      content_json: validDoc,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBeUndefined();
    }
  });

  it('rejects title longer than 200 characters', () => {
    const result = createNoteSchema.safeParse({
      title: 'a'.repeat(201),
      content_json: validDoc,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing content', () => {
    const result = createNoteSchema.safeParse({
      title: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-JSON content', () => {
    const result = createNoteSchema.safeParse({
      content_json: 'not json',
    });
    expect(result.success).toBe(false);
  });

  it('rejects content without type: "doc"', () => {
    const result = createNoteSchema.safeParse({
      content_json: JSON.stringify({ type: 'paragraph' }),
    });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding 500KB', () => {
    const largeContent = JSON.stringify({
      type: 'doc',
      content: 'x'.repeat(500_001),
    });
    const result = createNoteSchema.safeParse({
      content_json: largeContent,
    });
    expect(result.success).toBe(false);
  });
});
