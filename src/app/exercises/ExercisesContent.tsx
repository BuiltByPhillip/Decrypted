"use client";

import { BookOpen, Check, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function ExercisesContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: exercises, isLoading } = api.exercise.getAll.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 0,
  });
  const { data: averages } = api.rating.getAverages.useQuery();
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  function copyLink(slug: string, id: string) {
    void navigator.clipboard.writeText(`${window.location.origin}/exercise/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

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
      <div className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-medium/40 px-6 pb-10 pt-24">
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
      <div className="flex-1 px-12 pb-12 pt-24">
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
            <>
            <div className="flex flex-col gap-3">
              {exercises.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between rounded-xl border border-medium/30 bg-medium/10 px-5 py-4 transition-colors duration-150 hover:border-medium/50"
                >
                  {/* Each Exercise */}
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
                      <div className="mt-0.5 flex items-center gap-3">
                        <p className="font-mono text-[10px] text-muted">
                          Created {new Date(exercise.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        {averages?.[exercise.id] && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-muted">
                            <svg width="10" height="10" viewBox="0 0 24 24">
                              <polygon
                                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                                fill="#5ce88a"
                                stroke="#5ce88a"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {averages[exercise.id]!.average} ({averages[exercise.id]!.count})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      {copiedId === exercise.id && (
                        <span className="text-green pointer-events-none absolute bottom-full left-1/2 mb-1.5 whitespace-nowrap font-mono text-[10px] [animation:copied-float_2s_ease_forwards]">
                          Copied!
                        </span>
                      )}
                      <button
                        onClick={() => copyLink(exercise.slug, exercise.id)}
                        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 hover:bg-medium/40 ${copiedId === exercise.id ? "text-green hover:text-green" : "text-muted hover:text-soft-white"}`}
                      >
                        {copiedId === exercise.id ? (
                          <Check size={14} strokeWidth={1.5} />
                        ) : (
                          <Share2 size={14} strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => router.push('/editor/' + exercise.slug)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-medium/40 hover:text-soft-white"
                    >
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
            {exercises.length > PAGE_SIZE && (
              <div className="mt-6 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, exercises.length)} of {exercises.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs text-muted transition-colors duration-150 hover:bg-medium/30 hover:text-soft-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ← prev
                  </button>
                  {Array.from({ length: Math.ceil(exercises.length / PAGE_SIZE) }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs transition-colors duration-150 ${
                        n === page
                          ? "bg-green/10 text-green"
                          : "text-muted hover:bg-medium/30 hover:text-soft-white"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === Math.ceil(exercises.length / PAGE_SIZE)}
                    className="cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs text-muted transition-colors duration-150 hover:bg-medium/30 hover:text-soft-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    next →
                  </button>
                </div>
              </div>
            )}
            </>
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
