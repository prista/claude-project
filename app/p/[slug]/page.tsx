import { notFound } from 'next/navigation';
import { getNoteByPublicSlug } from '@/lib/notes';
import { NoteRenderer } from '@/components/note-renderer';

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <main className='max-w-3xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-white mb-6'>{note.title}</h1>
      <NoteRenderer contentJson={note.contentJson} />
    </main>
  );
}
