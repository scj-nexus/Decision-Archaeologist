"use client";

import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
  useTransition,
} from "react";
import { EvidenceGraph } from "./evidence-graph";
import type { AnalysisResult, DecisionCandidate } from "@/lib/analyzer/types";

interface AnalysisWorkspaceProps {
  analysisId: string;
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

function exportMarkdown(candidate: DecisionCandidate) {
  const blob = new Blob([candidate.draft.markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${candidate.id}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AnalysisWorkspace({ analysisId }: AnalysisWorkspaceProps) {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isSelecting, startSelection] = useTransition();
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const loadAnalysis = useEffectEvent(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analysis/${analysisId}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as AnalysisResult & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "The cached analysis could not be loaded.");
        setData(null);
        return;
      }

      setData(payload);
      setSelectedId((current) => current ?? payload.candidates[0]?.id ?? null);
    } catch {
      setError("The analysis report could not be loaded from the local server.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadAnalysis();
  }, [analysisId]);

  const filteredCandidates = data
    ? data.candidates.filter((candidate) => {
        if (!deferredQuery) {
          return true;
        }

        const haystack = [candidate.title, candidate.summary, ...candidate.affectedAreas]
          .join(" ")
          .toLowerCase();

        return haystack.includes(deferredQuery);
      })
    : [];

  const selectedCandidate =
    filteredCandidates.find((candidate) => candidate.id === selectedId) ??
    data?.candidates.find((candidate) => candidate.id === selectedId) ??
    filteredCandidates[0] ??
    data?.candidates[0] ??
    null;

  if (isLoading) {
    return (
      <div className="panel-line rounded-[1.8rem] px-8 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[rgba(76,52,37,0.65)]">
          Reconstructing the dig site
        </p>
        <p className="mt-4 max-w-xl text-lg leading-8 text-[rgba(43,28,19,0.78)]">
          Loading the cached analysis, rehydrating decision strata, and preparing the evidence graph.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-line rounded-[1.8rem] px-8 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[rgba(76,52,37,0.65)]">
          Analysis unavailable
        </p>
        <p className="mt-4 text-lg text-[#8d351d]">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="poster-surface rounded-[2rem] px-6 py-6 sm:px-8 lg:px-10">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="section-label text-xs">Excavation report</p>
            <div>
              <h1 className="display-title text-5xl leading-none text-[var(--foreground)] sm:text-6xl">
                {data.repo.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[rgba(43,28,19,0.74)] sm:text-lg">
                {data.summary.repoKind} repository, {data.summary.commitCount} commits scanned, {data.summary.decisionCount} ranked decisions surfaced.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="panel-line rounded-[1.2rem] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgba(76,52,37,0.62)]">Head</p>
              <p className="mt-2 font-mono text-sm text-[var(--foreground)]">{data.repo.head.slice(0, 12)}</p>
            </div>
            <div className="panel-line rounded-[1.2rem] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgba(76,52,37,0.62)]">Hotspots</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{data.summary.hotspotCount}</p>
            </div>
            <div className="panel-line rounded-[1.2rem] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgba(76,52,37,0.62)]">Scan window</p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                {data.summary.truncated ? "Recent commits only" : "Full visible history"}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr_1fr]">
        <div className="panel-line rounded-[1.8rem] px-5 py-5">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[rgba(76,52,37,0.62)]">Decision timeline</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Top inferred pivots</h2>
            </div>
            <input
              className="rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.55)] px-4 py-2 text-sm outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter"
            />
          </div>
          <div className="mt-5 space-y-3">
            {filteredCandidates.map((candidate, index) => {
              const active = candidate.id === selectedCandidate?.id;

              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => {
                    startSelection(() => {
                      setSelectedId(candidate.id);
                    });
                  }}
                  className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                    active
                      ? "border-[rgba(184,101,40,0.45)] bg-[rgba(184,101,40,0.12)]"
                      : "border-[var(--line)] bg-[rgba(255,255,255,0.5)] hover:border-[rgba(184,101,40,0.32)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgba(76,52,37,0.6)]">
                        0{index + 1} - {formatConfidence(candidate.confidence)} confidence
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{candidate.title}</h3>
                    </div>
                    <p className="font-mono text-sm text-[rgba(43,28,19,0.58)]">{candidate.score}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[rgba(43,28,19,0.72)]">{candidate.summary}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="panel-dark rounded-[1.8rem] px-5 py-5">
          {selectedCandidate ? (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[rgba(247,231,207,0.65)]">Evidence graph</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--sand)]">{selectedCandidate.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[rgba(248,236,215,0.76)]">{selectedCandidate.summary}</p>
              </div>
              <EvidenceGraph hotspots={data.hotspots} affectedAreas={selectedCandidate.affectedAreas} />
              <div className="space-y-3 border-t border-white/10 pt-4 text-sm leading-7 text-[rgba(248,236,215,0.78)]">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[rgba(247,231,207,0.65)]">Why it scored</p>
                {selectedCandidate.signals.map((signal) => (
                  <p key={signal}>{signal}</p>
                ))}
                {isSelecting ? <p className="font-mono text-xs uppercase tracking-[0.18em] text-[rgba(247,231,207,0.55)]">Refreshing selection...</p> : null}
              </div>
            </div>
          ) : null}
        </div>
        <div className="panel-line rounded-[1.8rem] px-5 py-5">
          {selectedCandidate ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[rgba(76,52,37,0.62)]">ADR draft</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{selectedCandidate.draft.title}</h2>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--stone)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  onClick={() => exportMarkdown(selectedCandidate)}
                >
                  Export
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgba(76,52,37,0.62)]">Affected areas</p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(43,28,19,0.74)]">{selectedCandidate.affectedAreas.join(", ")}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgba(76,52,37,0.62)]">Supporting commits</p>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-[rgba(43,28,19,0.74)]">
                    {selectedCandidate.rationale.map((reason) => (
                      <p key={reason}>{reason}</p>
                    ))}
                  </div>
                </div>
              </div>
              <pre className="max-h-[32rem] overflow-auto rounded-[1.4rem] bg-[rgba(255,255,255,0.62)] p-4 font-mono text-xs leading-6 text-[rgba(43,28,19,0.85)] whitespace-pre-wrap">
                {selectedCandidate.draft.markdown}
              </pre>
            </div>
          ) : null}
        </div>
      </section>
      {data.notes.length ? (
        <section className="panel-line rounded-[1.4rem] px-5 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[rgba(76,52,37,0.62)]">Field notes</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-[rgba(43,28,19,0.72)]">
            {data.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}



