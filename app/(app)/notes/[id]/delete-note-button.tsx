'use client';

import { useRef, useActionState } from 'react';
import { deleteNoteAction } from '@/lib/actions/notes';

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, submitAction, isPending] = useActionState<string | null, FormData>(
    deleteNoteAction,
    null,
  );

  return (
    <>
      <button
        type='button'
        onClick={() => dialogRef.current?.showModal()}
        className='px-3 py-1.5 rounded-md text-sm font-medium text-red-400 border border-red-400/50 hover:bg-red-400/10 transition-colors'
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className='m-auto bg-zinc-900 text-white rounded-lg p-6 max-w-sm backdrop:bg-black/60'
      >
        <h2 className='text-lg font-semibold mb-2'>Delete note?</h2>
        <p className='text-sm text-zinc-400 mb-4'>This action cannot be undone.</p>

        {error && (
          <output role='alert' className='block text-red-400 text-sm mb-3'>
            {error}
          </output>
        )}

        <div className='flex gap-3 justify-end'>
          <button
            type='button'
            onClick={() => dialogRef.current?.close()}
            className='px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white transition-colors'
          >
            Cancel
          </button>
          <form action={submitAction}>
            <input type='hidden' name='id' value={noteId} />
            <button
              type='submit'
              disabled={isPending}
              className='px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50'
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
