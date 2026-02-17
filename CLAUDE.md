# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `bun run dev`
- **Build:** `bun run build`
- **Lint:** `bun run lint`
- **Install deps:** `bun install`

## Tech Stack

- Next.js 16 (App Router) with Bun runtime
- TypeScript, TailwindCSS v4, React 19
- SQLite via Bun's built-in SQLite client (raw SQL, no ORM)
- better-auth for authentication
- TipTap for rich-text editing
- nanoid for public note slug generation
- zod for validation

## Architecture

This is a note-taking web app. See `SPEC.MD` for the full technical specification.

**Path aliases:** `@/*` maps to project root (configured in tsconfig.json).

### Planned Structure (from SPEC.MD)

- `lib/db.ts` — SQLite singleton connection via `Bun.SQLite`, exposes `getDb()`, `query()`, `get()`, `run()`
- `lib/notes.ts` — Note repository with user-scoped SQL queries (all queries filter by `user_id`)
- `app/api/notes/` — REST endpoints for notes CRUD
- `app/api/public-notes/[slug]/` — Public note read access
- `app/(auth)/` — Login/register pages
- `app/dashboard/` — Authenticated note list
- `app/notes/[id]/` — Note editor page
- `app/p/[slug]/` — Public read-only note page
- `components/` — NoteEditor (TipTap), NoteList, ShareToggle, DeleteNoteButton, PublicNoteViewer

### Data Model

- better-auth manages: `user`, `session`, `account`, `verification` tables (camelCase columns)
- App manages: `notes` table (snake_case columns) with FK to `user(id)`
- DB file: `data/app.db`
- Note content stored as stringified TipTap JSON in `content_json` column

### Key Conventions

- TipTap content is always stored as `JSON.stringify(editor.getJSON())` and parsed back on load
- Public note slugs are generated with nanoid (16+ chars)
- All note operations are scoped to authenticated user's `user_id` to prevent cross-user access
