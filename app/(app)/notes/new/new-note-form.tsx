"use client";

import { useActionState, useRef } from "react";
import { createNoteAction } from "@/lib/actions/notes";
import NoteEditor from "./note-editor";

const inputStyles =
  "w-full px-4 py-2 rounded-md bg-zinc-800 text-white border border-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-zinc-500";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

export default function NewNoteForm() {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [error, submitAction, isPending] = useActionState<string | null, FormData>(
    createNoteAction,
    null,
  );

  return (
    <form action={submitAction} className="space-y-5">
      {error && (
        <output role="alert" className="block text-red-400 text-sm">
          {error}
        </output>
      )}

      <fieldset disabled={isPending} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm text-zinc-300 mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={200}
            placeholder="Enter note title..."
            className={inputStyles}
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-300 mb-1">Content</label>
          <NoteEditor hiddenInputRef={hiddenInputRef} />
          <input
            ref={hiddenInputRef}
            type="hidden"
            name="content_json"
            defaultValue={EMPTY_DOC}
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating\u2026" : "Create Note"}
        </button>
      </fieldset>
    </form>
  );
}
