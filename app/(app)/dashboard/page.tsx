import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authenticate");
  }

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
    </main>
  );
}
