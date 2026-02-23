"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc/react";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");

  const createMutation = trpc.courses.create.useMutation({
    onSuccess: (data) => {
      router.replace(`/courses/${data.id}`);
      router.refresh();
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/courses" className="text-sm font-semibold">
            Back
          </Link>
          <form action="/logout" method="post">
            <button
              className="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">New course</h1>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              title,
              description: description.trim() ? description : undefined,
              durationMinutes: durationMinutes.trim() ? Number(durationMinutes) : undefined,
              language: language.trim() ? language : undefined,
              level: level.trim() ? level : undefined,
              category: category.trim() ? category : undefined,
            });
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm">Title</span>
            <input
              className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm">Description</span>
            <textarea
              className="min-h-32 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm">Duration (minutes)</span>
              <input
                className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 90"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm">Language</span>
              <input
                className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. English"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm">Level</span>
              <input
                className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g. Beginner"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm">Category</span>
              <input
                className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Web Development"
              />
            </label>
          </div>

          {createMutation.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {createMutation.error.message}
            </div>
          ) : null}

          <button
            className="h-11 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            disabled={createMutation.isPending}
            type="submit"
          >
            {createMutation.isPending ? "Creating…" : "Create"}
          </button>
        </form>
      </main>
    </div>
  );
}
