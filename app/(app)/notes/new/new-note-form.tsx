"use client";

import { createNoteAction } from "@/lib/actions/notes";
import NoteForm from "../_components/note-form";

export default function NewNoteForm() {
  return (
    <NoteForm
      action={createNoteAction}
      submitLabel="Create Note"
      pendingLabel="Creating…"
    />
  );
}
