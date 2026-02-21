import { Suspense } from "react";
import AuthForm from "./auth-form";

export default function AuthenticatePage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <Suspense>
        <AuthForm />
      </Suspense>
    </main>
  );
}
