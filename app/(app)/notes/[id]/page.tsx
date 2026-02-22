import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function NotePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authenticate");
  }

  return <main className="max-w-5xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold text-white">Note</h1><p className="text-zinc-400 mt-2">Placeholder</p></main>;
}
