import { CoursesClient } from "./courses-client";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.page;
  const pageStr = Array.isArray(raw) ? raw[0] : raw;
  const page = Math.max(1, Number(pageStr ?? "1") || 1);

  return <CoursesClient page={page} />;
}
