"use client";

import { BookOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

export default function ExercisesContent() {
  const queryClient = useQueryClient();
  const { data: exercises, isLoading } = api.exercise.getAll.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 0,
  });
  const deleteExercise = api.exercise.delete.useMutation({
    onMutate: ({ id }) => {
      queryClient.setQueryData(
        [["exercise", "getAll"], { type: "query" }],
        (old: typeof exercises) => old?.filter((e) => e.id !== id) ?? [],
      );
      setConfirmId(null);
    },
  });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <>
      {/* Delete confirmation popup */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-medium/40 bg-[#141820] p-6">
            <p className="mb-1 text-sm font-semibold text-soft-white">Delete exercise?</p>
            <p className="mb-6 text-xs leading-relaxed text-muted">
              This exercise will be deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="cursor-pointer rounded-lg px-4 py-2 font-mono text-xs text-muted transition-colors duration-150 hover:bg-medium/30 hover:text-soft-white"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteExercise.mutate({ id: confirmId })}
                className="cursor-pointer rounded-lg bg-danger/10 px-4 py-2 font-mono text-xs text-danger transition-colors duration-150 hover:bg-danger/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="flex w-64 shrink-0 flex-col border-r border-medium/40 px-6 pb-10 pt-24">
        <p className="mb-8 font-mono text-[10px] tracking-[0.32em] text-green uppercase">
          // my exercises
        </p>
        <nav className="flex h-full flex-col gap-1">
          <button className="cursor-pointer rounded-lg bg-green/10 px-3 py-2 text-left font-mono text-xs text-green transition-colors duration-150">
            All exercises
          </button>
          <div className="mt-auto border-t border-medium/40 pt-4">
            <Link
              href="/account"
              className="block rounded-lg px-3 py-2 font-mono text-xs text-muted transition-colors duration-150 hover:bg-medium/30 hover:text-soft-white"
            >
              Account settings
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-12 pb-12 pt-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-10 text-xl font-bold tracking-tight text-soft-white">
            My Exercises
          </h1>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-medium/20" />
              ))}
            </div>
          ) : exercises && exercises.length > 0 ? (
            <div className="flex flex-col gap-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between rounded-xl border border-medium/30 bg-medium/10 px-5 py-4 transition-colors duration-150 hover:border-medium/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green/10">
                      <BookOpen size={14} strokeWidth={1.5} className="text-green" />
                    </div>
                    <div>
                      <Link
                        href={`/exercise/${exercise.slug}`}
                        className="font-mono text-sm text-soft-white transition-colors hover:text-green"
                      >
                        {exercise.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-[10px] text-muted">
                        Created at {new Date(exercise.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-medium/40 hover:text-soft-white">
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setConfirmId(exercise.id)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-medium/30 bg-medium/10 px-8 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green/10">
                <BookOpen size={22} strokeWidth={1.5} className="text-green" />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-soft-white">No exercises yet</p>
                <p className="max-w-xs text-xs leading-relaxed text-muted">
                  Exercises you create in the editor will appear here.
                </p>
              </div>
              <Link
                href="/editor"
                className="mt-1 rounded-xl bg-green/10 px-5 py-2 font-mono text-xs text-green transition-colors duration-150 hover:bg-green/20"
              >
                Open editor
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
