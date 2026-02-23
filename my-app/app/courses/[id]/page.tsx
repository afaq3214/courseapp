"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const courseQuery = trpc.courses.getById.useQuery({ id });
  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: () => {
      router.replace("/courses");
      router.refresh();
    },
  });

  const course = courseQuery.data;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/courses" className="text-sm font-semibold">
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/courses/${id}/edit`}
              className="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Edit
            </Link>
            <button
              className="inline-flex h-9 items-center rounded-md border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ id })}
              type="button"
            >
              Delete
            </button>
            <form action="/logout" method="post">
              <button
                className="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        {courseQuery.isLoading ? <div className="text-sm">Loading…</div> : null}
        {courseQuery.error ? (
          <div className="text-sm text-red-600">{courseQuery.error.message}</div>
        ) : null}

        {course ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold">{course.title}</h1>

            <div className="flex flex-wrap gap-2 text-xs">
              {course.duration_minutes ? (
                <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {course.duration_minutes} min
                </span>
              ) : null}
              {course.language ? (
                <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {course.language}
                </span>
              ) : null}
              {course.level ? (
                <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {course.level}
                </span>
              ) : null}
              {course.category ? (
                <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {course.category}
                </span>
              ) : null}
            </div>

            {course.description ? (
              <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {course.description}
              </p>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No description.</p>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
