import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import { NoteRenderer } from "./note-renderer";
import DeleteNoteButton from "./delete-note-button";

export default async function NotePage({
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
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/notes/${id}/edit`}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-blue-400 border border-blue-400/50 hover:bg-blue-400/10 transition-colors"
          >
            Edit
          </Link>
          <DeleteNoteButton noteId={id} />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white mt-4 mb-6">{note.title}</h1>
      <NoteRenderer contentJson={note.contentJson} />
    </main>
  );
}
