import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNotesByUser } from "@/lib/notes";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authenticate");
  }

  const notes = getNotesByUser(session.user.id);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Your Notes</h1>
        <Link
          href="/notes/new"
          className="px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-colors"
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="text-zinc-400 text-center py-12">
          No notes yet.{" "}
          <Link href="/notes/new" className="text-white underline hover:no-underline">
            Create your first note
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block p-4 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              <h2 className="font-semibold text-white truncate">{note.title}</h2>
              <p className="text-sm text-zinc-400 mt-1">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                {getPreview(note.contentJson)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function getPreview(contentJson: string): string {
  try {
    const doc = JSON.parse(contentJson);
    const texts: string[] = [];
    extractText(doc, texts);
    return texts.join(" ").slice(0, 120) || "Empty note";
  } catch {
    return "Empty note";
  }
}

function extractText(node: Record<string, unknown>, out: string[]) {
  if (node.type === "text" && typeof node.text === "string") {
    out.push(node.text);
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      extractText(child as Record<string, unknown>, out);
    }
  }
}
