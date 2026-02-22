"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createNote } from "@/lib/notes";
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

  const note = createNote(session.user.id, {
    title: parsed.data.title,
    contentJson: parsed.data.content_json,
  });

  redirect(`/notes/${note.id}`);
}
