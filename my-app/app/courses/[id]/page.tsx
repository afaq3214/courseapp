"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useState, useEffect } from "react";

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

  // Get current user ID to check ownership
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    getCurrentUser();
  }, []);

  const course = courseQuery.data;
  const isOwner = currentUserId && course ? currentUserId === course.user_id : false;

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Button variant="ghost" asChild>
            <Link href="/courses">Back</Link>
          </Button>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/courses/${id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate({ id })}
                  type="button"
                >
                  Delete
                </Button>
              </>
            )}
            <form action="/logout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        {courseQuery.isLoading ? (
          <Card><CardContent className="p-8 text-center"><div className="text-sm">Loading…</div></CardContent></Card>
        ) : courseQuery.error ? (
          <Card><CardContent className="p-4"><div className="text-sm text-red-600">{courseQuery.error.message}</div></CardContent></Card>
        ) : course ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold gradient-text">{course.title}</h1>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      by {course.profiles?.username || 'Anonymous'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {course.duration_minutes ? (
                      <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                        {course.duration_minutes} min
                      </span>
                    ) : null}
                    {course.language ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {course.language}
                      </span>
                    ) : null}
                    {course.level ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {course.level}
                      </span>
                    ) : null}
                    {course.category ? (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        {course.category}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-3">Description</h2>
                  {course.description ? (
                    <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {course.description}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">No description provided.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
