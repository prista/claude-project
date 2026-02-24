"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createNote, updateNote, deleteNote } from "@/lib/notes";
import { createNoteSchema } from "@/lib/schemas/note";

export async function createNoteAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authenticate");
  }

  const parsed = createNoteSchema.safeParse({
    title: formData.get("title"),
    content_json: formData.get("content_json"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0].message;
  }

  let note;
  try {
    note = createNote(session.user.id, {
      title: parsed.data.title,
      contentJson: parsed.data.content_json,
    });
  } catch {
    return "Failed to create note. Please try again.";
  }

  redirect(`/notes/${note.id}`);
}

export async function updateNoteAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authenticate");
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return "Missing note ID.";
  }

  const parsed = createNoteSchema.safeParse({
    title: formData.get("title"),
    content_json: formData.get("content_json"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0].message;
  }

  try {
    const updated = updateNote(id, session.user.id, {
      title: parsed.data.title,
      contentJson: parsed.data.content_json,
    });
    if (!updated) {
      return "Note not found.";
    }
  } catch {
    return "Failed to update note. Please try again.";
  }

  redirect(`/notes/${id}`);
}

export async function deleteNoteAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authenticate");
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return "Missing note ID.";
  }

  try {
    const deleted = deleteNote(id, session.user.id);
    if (!deleted) {
      return "Note not found.";
    }
  } catch {
    return "Failed to delete note. Please try again.";
  }

  redirect("/dashboard");
}
