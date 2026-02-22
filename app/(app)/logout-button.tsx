"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/");
      }}
      className="text-sm text-zinc-400 hover:text-white transition-colors"
    >
      Log out
    </button>
  );
}
