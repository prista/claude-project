import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Header from "./header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <Header userName={session?.user.name} />
      {children}
    </>
  );
}
