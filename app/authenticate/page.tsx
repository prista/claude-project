import { Suspense } from 'react';
import AuthForm from './auth-form';

export default async function AuthenticatePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;

  return (
    <main className='min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4'>
      <Suspense>
        <AuthForm key={mode ?? 'login'} />
      </Suspense>
    </main>
  );
}
