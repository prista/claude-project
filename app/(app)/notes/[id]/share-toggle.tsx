'use client';

import { useActionState, useState } from 'react';
import { toggleShareAction, type ToggleShareResult } from '@/lib/actions/notes';

export default function ShareToggle({
  noteId,
  initialIsPublic,
  initialSlug,
}: {
  noteId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
}) {
  const [state, submitAction, isPending] = useActionState<ToggleShareResult, FormData>(
    toggleShareAction,
    { isPublic: initialIsPublic, publicSlug: initialSlug },
  );

  const isPublic = state.isPublic ?? initialIsPublic;
  const slug = state.publicSlug ?? initialSlug;
  const publicUrl = slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${slug}`
    : null;

  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className='border-t border-zinc-700 pt-6 mt-6'>
      <span
        className={`inline-block text-xs font-medium px-2 py-0.5 rounded mb-4 ${
          isPublic ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
        }`}
      >
        {isPublic ? 'Public' : 'Private'}
      </span>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-base font-semibold text-white'>Public Sharing</h2>
          <p className='text-sm text-zinc-400 mt-0.5'>
            {isPublic ? 'Anyone with the link can view this note' : 'Only you can view this note'}
          </p>
        </div>
        <form action={submitAction}>
          <input type='hidden' name='id' value={noteId} />
          <input type='hidden' name='is_public' value={isPublic ? '0' : '1'} />
          <button
            type='submit'
            disabled={isPending}
            role='switch'
            aria-checked={isPublic}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
              isPublic ? 'bg-emerald-600' : 'bg-zinc-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </form>
      </div>

      {state.error && (
        <output role='alert' className='block text-red-400 text-sm mt-2'>
          {state.error}
        </output>
      )}

      {isPublic && publicUrl && (
        <div className='flex items-center gap-2 mt-4'>
          <input
            type='text'
            readOnly
            value={publicUrl}
            className='flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300'
          />
          <button
            type='button'
            onClick={handleCopy}
            className='px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors'
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </section>
  );
}
