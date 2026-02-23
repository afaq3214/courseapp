"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";

function PageButton({
  href,
  label,
  disabled,
}: {
  href: string;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <Button variant="ghost" size="sm" disabled className="opacity-50">
        {label}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
}

export function CoursesClient({ page }: { page: number }) {
  const listQuery = trpc.courses.list.useQuery({ page, pageSize: 10 });
  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: async () => {
      await listQuery.refetch();
    },
  });

  const items = listQuery.data?.items ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/courses" className="text-lg font-bold gradient-text">
            Courses
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="primary" asChild>
              <Link href="/courses/new">New course</Link>
            </Button>
            <form action="/logout" method="post">
              <Button variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gradient-text">Your courses</h1>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {listQuery.isLoading ? "Loading…" : `${listQuery.data?.totalCount ?? 0} total`}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {listQuery.error ? (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-red-600">{listQuery.error.message}</div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4">
            {items.map((c) => (
              <Card key={c.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Link href={`/courses/${c.id}`} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:text-violet-600 transition-colors">
                        {c.title}
                      </Link>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.duration_minutes ? (
                          <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                            {c.duration_minutes} min
                          </span>
                        ) : null}
                        {c.language ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {c.language}
                          </span>
                        ) : null}
                        {c.level ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            {c.level}
                          </span>
                        ) : null}
                        {c.category ? (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                            {c.category}
                          </span>
                        ) : null}
                      </div>
                      {c.description ? (
                        <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {c.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/courses/${c.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate({ id: c.id })}
                        type="button"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!listQuery.isLoading && items.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No courses yet. Create your first one.
                  </p>
                  <Button variant="primary" className="mt-4" asChild>
                    <Link href="/courses/new">Create course</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <PageButton
            href={`/courses?page=${Math.max(1, page - 1)}`}
            label="Prev"
            disabled={page <= 1}
          />
          <div className="text-sm text-zinc-600 dark:text-zinc-400 px-3">
            Page {page} of {totalPages}
          </div>
          <PageButton
            href={`/courses?page=${Math.min(totalPages, page + 1)}`}
            label="Next"
            disabled={page >= totalPages}
          />
        </div>
      </main>
    </div>
  );
}
