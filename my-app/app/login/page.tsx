import { LoginClient } from "./login-client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.next;
  const nextStr = Array.isArray(raw) ? raw[0] : raw;
  const nextPath = typeof nextStr === "string" && nextStr.startsWith("/") ? nextStr : "/courses";

  return <LoginClient nextPath={nextPath} />;
}
