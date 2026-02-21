"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

const inputStyles =
  "w-full px-4 py-2 rounded-md bg-zinc-800 text-white border border-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-zinc-500";

export default function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSignup = searchParams.get("mode") === "signup";

  const [error, submitAction, isPending] = useActionState<string | null, FormData>(
    async (_prev, formData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (isSignup) {
        const name = email.split("@")[0];
        const { error } = await signUp.email({ name, email, password });
        if (error) return error.message ?? "Signup failed";
      } else {
        const { error } = await signIn.email({ email, password });
        if (error) return error.message ?? "Login failed";
      }

      router.push("/dashboard");
      return null;
    },
    null,
  );

  return (
    <form action={submitAction} className="w-full max-w-sm space-y-5">
      <h1 className="text-3xl font-bold text-white text-center">
        {isSignup ? "Create Account" : "Sign In"}
      </h1>

      {error && (
        <output role="alert" className="block text-red-400 text-sm text-center">
          {error}
        </output>
      )}

      <fieldset disabled={isPending} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-zinc-300 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputStyles}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-zinc-300 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={8}
            className={inputStyles}
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPending ? "Loading\u2026" : isSignup ? "Sign Up" : "Sign In"}
        </button>
      </fieldset>

      <p className="text-sm text-zinc-400 text-center">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="?mode=login" className="text-white hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="?mode=signup" className="text-white hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
