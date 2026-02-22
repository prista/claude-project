import Link from "next/link";
import LogoutButton from "./logout-button";

export default function Header({ userName }: { userName?: string }) {
  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          NextNotes
        </Link>
        {userName && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">{userName}</span>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
