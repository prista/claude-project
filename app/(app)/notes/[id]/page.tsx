import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import { NoteRenderer } from '@/components/note-renderer';
import DeleteNoteButton from './delete-note-button';
import ShareToggle from './share-toggle';

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/authenticate');
  }

  const { id } = await params;
  const note = getNoteById(id, session.user.id);

  if (!note) {
    notFound();
  }

  const updatedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main className='max-w-3xl mx-auto px-4 py-8'>
      <Link href='/dashboard' className='text-sm text-zinc-400 hover:text-white transition-colors'>
        &larr; Back to Dashboard
      </Link>
      <div className='flex items-center justify-between mt-4'>
        <div>
          <h1 className='text-2xl font-bold text-white'>{note.title}</h1>
          <p className='text-sm text-zinc-500 mt-1'>Updated: {updatedDate}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Link
            href={`/notes/${id}/edit`}
            className='px-3 py-1.5 rounded-md text-sm font-medium text-blue-400 border border-blue-400/50 hover:bg-blue-400/10 transition-colors'
          >
            Edit
          </Link>
          <DeleteNoteButton noteId={id} />
        </div>
      </div>

      <hr className='border-zinc-700 my-6' />

      <NoteRenderer contentJson={note.contentJson} />

      <ShareToggle noteId={id} initialIsPublic={note.isPublic} initialSlug={note.publicSlug} />
    </main>
  );
}
