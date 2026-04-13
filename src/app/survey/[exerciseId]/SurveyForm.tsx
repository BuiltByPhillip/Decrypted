"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

const QUESTIONS = [
  "The exercise was easy to navigate.",
  "The exercise helped me understand the concept.",
  "The difficulty level felt appropriate.",
  "I would recommend this tool to other students.",
  "I feel this tool would help me learn better than traditional methods (e.g. slides or textbooks).",
];

const fadeUp = (delay: string) => ({
  animation: `fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay} both`,
});

export default function SurveyForm({ exerciseId }: { exerciseId: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [bug, setBug] = useState("");
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitSurvey = api.survey.create.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const answered = Object.keys(answers).length;
  const allAnswered = answered === QUESTIONS.length;

  const handleSubmit = () => {
    if (!allAnswered) return;
    submitSurvey.mutate({
      exerciseId,
      q1: answers[0]!,
      q2: answers[1]!,
      q3: answers[2]!,
      q4: answers[3]!,
      q5: answers[4]!,
      c1: comments[0]?.trim() || undefined,
      c2: comments[1]?.trim() || undefined,
      c3: comments[2]?.trim() || undefined,
      c4: comments[3]?.trim() || undefined,
      c5: comments[4]?.trim() || undefined,
      bug: bug.trim() || undefined,
      feedback: feedback.trim() || undefined,
      email: email.trim() || undefined,
    });
  };

  if (submitted) {
    return (
      <main className="bg-pattern flex min-h-screen flex-col items-center justify-center gap-8 select-none">
        <div className="flex flex-col items-center gap-4" style={fadeUp("0ms")}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#5ce88a" strokeWidth="1.5" />
            <path d="M7.5 12l3 3 6-6" stroke="#5ce88a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="logo-shimmer text-4xl font-bold tracking-widest uppercase">Decrypted</span>
          <p className="font-mono text-sm text-muted/60 tracking-wider">Thank you for your feedback.</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="font-mono text-xs text-muted/40 tracking-widest uppercase hover:text-muted transition-colors duration-200"
          style={fadeUp("150ms")}
        >
          Back to home
        </button>
      </main>
    );
  }

  return (
    <main className="bg-pattern min-h-screen px-6 py-20">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-14 flex flex-col gap-2" style={fadeUp("0ms")}>
          <span className="font-mono text-[10px] tracking-[0.32em] text-green uppercase">
            // feedback
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-soft-white">
            How was your experience?
          </h1>
          <p className="mt-1 font-mono text-xs text-muted/50">
            Rate each statement from 1 (strongly disagree) to 5 (strongly agree).
          </p>
        </div>

        {/* Progress */}
        <div className="mb-10 flex items-center gap-3" style={fadeUp("60ms")}>
          <div className="h-px flex-1 bg-medium/30 overflow-hidden rounded-full">
            <div
              className="h-full bg-green/60 transition-all duration-500 rounded-full"
              style={{ width: `${(answered / QUESTIONS.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-muted/40 tabular-nums">
            {answered}/{QUESTIONS.length}
          </span>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-6">
          {QUESTIONS.map((question, i) => (
            <div
              key={i}
              className="rounded-xl border border-medium/30 bg-medium/10 px-6 py-5 transition-colors duration-200"
              style={{
                ...fadeUp(`${80 + i * 40}ms`),
                borderColor: answers[i] ? "rgba(92,232,138,0.2)" : undefined,
              }}
            >
              <p className="mb-5 text-sm leading-relaxed text-soft-white/80">
                <span className="mr-2 font-mono text-[10px] text-muted/40">{i + 1}.</span>
                {question}
              </p>
              <div className="flex items-center gap-2">
                <span className="w-28 font-mono text-[10px] text-muted/40 leading-tight">Strongly disagree</span>
                <div className="flex flex-1 justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAnswers((prev) => ({ ...prev, [i]: val }))}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border font-mono text-sm transition-all duration-150"
                      style={{
                        borderColor: answers[i] === val ? "#5ce88a" : "rgba(148,163,184,0.15)",
                        background: answers[i] === val ? "rgba(92,232,138,0.12)" : "transparent",
                        color: answers[i] === val ? "#5ce88a" : "rgba(148,163,184,0.5)",
                        transform: answers[i] === val ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <span className="w-28 text-right font-mono text-[10px] text-muted/40 leading-tight">Strongly agree</span>
              </div>

              {answers[i] !== undefined && (
                <div style={{ animation: "fade-up 0.3s ease both" }} className="mt-3">
                  <textarea
                    value={comments[i] ?? ""}
                    onChange={(e) => setComments((prev) => ({ ...prev, [i]: e.target.value }))}
                    placeholder={answers[i]! <= 3 ? "What could be improved?" : "What did you like about it?"}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-medium/40 bg-dark/40 px-3 py-2 font-mono text-xs text-soft-white placeholder:text-muted/30 transition duration-200 focus:border-green/40 focus:outline-none focus:ring-1 focus:ring-green/20"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Free text feedback */}
          <div className="rounded-xl border border-medium/30 bg-medium/10 px-6 py-5">
            <label className="mb-3 block font-mono text-[10px] tracking-[0.2em] text-muted/50 uppercase">
              Any other feedback? (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you like, dislike, or think could be improved?"
              rows={3}
              className="w-full resize-none rounded-lg border border-medium/40 bg-dark/40 px-4 py-3 font-mono text-xs text-soft-white placeholder:text-muted/30 transition duration-200 focus:border-green/40 focus:outline-none focus:ring-1 focus:ring-green/20"
            />
          </div>

          {/* Bug report */}
          <div className="rounded-xl border border-medium/30 bg-medium/10 px-6 py-5">
            <label className="mb-3 block font-mono text-[10px] tracking-[0.2em] text-muted/50 uppercase">
              Report a bug (optional)
            </label>
            <textarea
              value={bug}
              onChange={(e) => setBug(e.target.value)}
              placeholder="Describe any issues you encountered..."
              rows={3}
              className="w-full resize-none rounded-lg border border-medium/40 bg-dark/40 px-4 py-3 font-mono text-xs text-soft-white placeholder:text-muted/30 transition duration-200 focus:border-green/40 focus:outline-none focus:ring-1 focus:ring-green/20"
            />
          </div>
        </div>

          {/* Email */}
          <div className="rounded-xl border border-medium/30 bg-medium/10 px-6 py-5">
            <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-muted/50 uppercase">
              Contact email (optional)
            </label>
            <p className="mb-3 font-mono text-[10px] text-muted/30">
              Leave your email if you're happy to be contacted for follow-up.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-medium/40 bg-dark/40 px-4 py-2.5 font-mono text-xs text-soft-white placeholder:text-muted/30 transition duration-200 focus:border-green/40 focus:outline-none focus:ring-1 focus:ring-green/20"
            />
          </div>

        {/* Submit */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="font-mono text-xs text-muted/40 tracking-wider hover:text-muted transition-colors duration-200"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitSurvey.isPending}
            className="rounded-2xl bg-green px-6 py-2 font-mono text-sm font-medium text-green-foreground transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {submitSurvey.isPending ? "Submitting..." : "Submit feedback"}
          </button>
        </div>

      </div>
    </main>
  );
}
