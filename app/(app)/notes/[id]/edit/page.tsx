import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import { updateNoteAction } from "@/lib/actions/notes";
import NoteForm from "../../_components/note-form";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authenticate");
  }

  const { id } = await params;
  const note = getNoteById(id, session.user.id);

  if (!note) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href={`/notes/${id}`}
        className="text-sm text-zinc-400 hover:text-white transition-colors"
      >
        &larr; Back to Note
      </Link>
      <h1 className="text-2xl font-bold text-white mt-4 mb-6">Edit Note</h1>
      <NoteForm
        action={updateNoteAction}
        noteId={note.id}
        initialTitle={note.title}
        initialContentJson={note.contentJson}
        submitLabel="Save Changes"
        pendingLabel="Saving…"
      />
    </main>
  );
}
