import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockSession = {
  user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
  session: { id: 'sess-1' },
};

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Track redirect calls
const redirectMock = vi.fn<(url: string) => never>().mockImplementation((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}));

const getSessionMock = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => getSessionMock(...args),
    },
  },
}));

const notesMock = {
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  toggleNotePublic: vi.fn(),
};
vi.mock('@/lib/notes', () => notesMock);

// Import after mocks
const { createNoteAction, updateNoteAction, deleteNoteAction, toggleShareAction } =
  await import('@/lib/actions/notes');

// --- Helpers ---

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    fd.set(k, v);
  }
  return fd;
}

const validDoc = JSON.stringify({ type: 'doc', content: [] });

// --- Tests ---

describe('createNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /authenticate when not logged in', async () => {
    getSessionMock.mockResolvedValue(null);
    await expect(
      createNoteAction(null, makeFormData({ title: '', content_json: validDoc })),
    ).rejects.toThrow('REDIRECT:/authenticate');
  });

  it('returns validation error on bad input', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    const result = await createNoteAction(null, makeFormData({ title: '', content_json: 'bad' }));
    expect(result).toBe('Invalid content format');
  });

  it('calls createNote and redirects on success', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    notesMock.createNote.mockReturnValue({ id: 'note-1' });

    await expect(
      createNoteAction(null, makeFormData({ title: 'Test', content_json: validDoc })),
    ).rejects.toThrow('REDIRECT:/notes/note-1');

    expect(notesMock.createNote).toHaveBeenCalledWith('user-1', {
      title: 'Test',
      contentJson: validDoc,
    });
  });

  it('returns error message on DB failure', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    notesMock.createNote.mockImplementation(() => {
      throw new Error('DB error');
    });

    const result = await createNoteAction(
      null,
      makeFormData({ title: '', content_json: validDoc }),
    );
    expect(result).toBe('Failed to create note. Please try again.');
  });
});

describe('updateNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /authenticate when not logged in', async () => {
    getSessionMock.mockResolvedValue(null);
    await expect(
      updateNoteAction(null, makeFormData({ id: '1', title: '', content_json: validDoc })),
    ).rejects.toThrow('REDIRECT:/authenticate');
  });

  it('returns error on missing ID', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    const result = await updateNoteAction(
      null,
      makeFormData({ title: '', content_json: validDoc }),
    );
    expect(result).toBe('Missing note ID.');
  });

  it('returns validation error on bad input', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    const result = await updateNoteAction(
      null,
      makeFormData({ id: '1', title: '', content_json: 'bad' }),
    );
    expect(result).toBe('Invalid content format');
  });

  it('redirects on success', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    notesMock.updateNote.mockReturnValue({ id: 'note-1' });

    await expect(
      updateNoteAction(null, makeFormData({ id: 'note-1', title: '', content_json: validDoc })),
    ).rejects.toThrow('REDIRECT:/notes/note-1');
  });

  it('returns error when note not found', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    notesMock.updateNote.mockReturnValue(null);

    const result = await updateNoteAction(
      null,
      makeFormData({ id: 'note-1', title: '', content_json: validDoc }),
    );
    expect(result).toBe('Note not found.');
  });
});

describe('deleteNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /authenticate when not logged in', async () => {
    getSessionMock.mockResolvedValue(null);
    await expect(deleteNoteAction(null, makeFormData({ id: '1' }))).rejects.toThrow(
      'REDIRECT:/authenticate',
    );
  });

  it('returns error on missing ID', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    const result = await deleteNoteAction(null, makeFormData({}));
    expect(result).toBe('Missing note ID.');
  });

  it('redirects to dashboard on success', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    notesMock.deleteNote.mockReturnValue(true);

    await expect(deleteNoteAction(null, makeFormData({ id: 'note-1' }))).rejects.toThrow(
      'REDIRECT:/dashboard',
    );
  });

  it('returns error when note not found', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    notesMock.deleteNote.mockReturnValue(false);

    const result = await deleteNoteAction(null, makeFormData({ id: 'note-1' }));
    expect(result).toBe('Note not found.');
  });
});

describe('toggleShareAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    getSessionMock.mockResolvedValue(null);
    const result = await toggleShareAction({}, makeFormData({ id: '1', is_public: '1' }));
    expect(result).toEqual({ error: 'Not authenticated.' });
  });

  it('returns error on missing ID', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    const result = await toggleShareAction({}, makeFormData({ is_public: '1' }));
    expect(result).toEqual({ error: 'Missing note ID.' });
  });

  it('returns isPublic and publicSlug on success', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    notesMock.toggleNotePublic.mockReturnValue({
      isPublic: true,
      publicSlug: 'abc123',
    });

    const result = await toggleShareAction({}, makeFormData({ id: 'note-1', is_public: '1' }));
    expect(result).toEqual({ isPublic: true, publicSlug: 'abc123' });
  });

  it('returns error when note not found', async () => {
    getSessionMock.mockResolvedValue(mockSession);
    notesMock.toggleNotePublic.mockReturnValue(null);

    const result = await toggleShareAction({}, makeFormData({ id: 'note-1', is_public: '1' }));
    expect(result).toEqual({ error: 'Note not found.' });
  });
});
