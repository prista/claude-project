import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-white mb-3">Welcome to Notes</h1>
      <p className="text-zinc-400 mb-8 max-w-sm">
        A simple note-taking app with rich text editing and public sharing.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/authenticate?mode=login"
          className="px-5 py-2 rounded-md bg-zinc-700 text-white hover:bg-zinc-600 transition-colors"
        >
          Log In
        </Link>
        <Link href="/authenticate?mode=signup" className="text-zinc-300 hover:text-white transition-colors">
          Sign up
        </Link>
      </div>
    </main>
  );
}
