"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

interface AnalyzeFormProps {
  demoRepoPath: string;
}

export function AnalyzeForm({ demoRepoPath }: AnalyzeFormProps) {
  const router = useRouter();
  const [repoPath, setRepoPath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitPath(targetPath: string) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoPath: targetPath }),
      });
      const payload = (await response.json()) as {
        analysisId?: string;
        error?: string;
      };

      if (!response.ok || !payload.analysisId) {
        setError(payload.error ?? "Analysis failed before a report could be created.");
        return;
      }

      startTransition(() => {
        router.push(`/analysis/${payload.analysisId}`);
      });
    } catch {
      setError("The analysis request could not reach the local server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        className="grid gap-4 lg:grid-cols-[1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void submitPath(repoPath);
        }}
      >
        <label className="panel-line flex flex-col gap-3 rounded-[1.4rem] px-5 py-4 glow-edge">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[rgba(76,52,37,0.68)]">
            Repository path
          </span>
          <input
            className="bg-transparent text-base text-[var(--foreground)] outline-none sm:text-lg"
            value={repoPath}
            onChange={(event) => setRepoPath(event.target.value)}
            placeholder="C:\\Users\\Elite\\source\\repos\\your-repo"
            spellCheck={false}
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[1.4rem] bg-[var(--foreground)] px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--sand)] transition hover:bg-[var(--stone)] disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? "Digging..." : "Analyze repo"}
        </button>
      </form>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="text-left text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--stone)]"
          onClick={() => {
            setRepoPath(demoRepoPath);
            void submitPath(demoRepoPath);
          }}
          disabled={isSubmitting}
        >
          Try the bundled demo dig site
        </button>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[rgba(76,52,37,0.62)]">
          Demo path: {demoRepoPath}
        </p>
      </div>
      {error ? <p className="text-sm text-[#8d351d]">{error}</p> : null}
    </div>
  );
}

