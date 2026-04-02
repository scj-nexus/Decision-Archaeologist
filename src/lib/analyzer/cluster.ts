import { renderAdrDraft } from "./adr";
import { buildAggregates, type CandidateAggregate } from "./score";
import type { DecisionCandidate, RepoSnapshot } from "./types";

function pickTitle(aggregate: CandidateAggregate) {
  const subjects = aggregate.commits.map((commit) => commit.subject.toLowerCase());
  const combined = subjects.join(" ");

  if (aggregate.tag === "framework") {
    if (combined.includes("next")) {
      return "The runtime pivoted to Next.js";
    }

    return "The application shell went through a framework migration";
  }

  if (aggregate.tag === "restructure") {
    return "The codebase was reorganized around clearer feature strata";
  }

  if (aggregate.tag === "dependency") {
    if (combined.includes("vite") || combined.includes("webpack")) {
      return "The build and test toolchain was deliberately swapped";
    }

    return "A dependency-level toolchain decision reshaped delivery";
  }

  if (aggregate.tag === "config") {
    return "Strict configuration became part of the architecture";
  }

  return "A persistent coupling seam is shaping change decisions";
}

function pickSummary(aggregate: CandidateAggregate) {
  switch (aggregate.tag) {
    case "framework":
      return "The repository history points to a major framework-level runtime migration.";
    case "restructure":
      return "The repository history points to an intentional module and ownership reshuffle.";
    case "dependency":
      return "The repository history points to a deliberate dependency and toolchain replacement.";
    case "config":
      return "The repository history points to a hardening pass that locked in stricter defaults.";
    default:
      return "The repository history points to recurring co-change pressure between subsystem seams.";
  }
}

function normalizeConfidence(score: number, evidenceCount: number) {
  return Math.min(0.98, 0.34 + score / 28 + evidenceCount / 20);
}

export function buildDecisionCandidates(snapshot: RepoSnapshot): DecisionCandidate[] {
  const aggregates = buildAggregates(snapshot)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  return aggregates.map((aggregate, index) => {
    const candidateBase = {
      id: `${aggregate.tag}-${index + 1}`,
      tag: aggregate.tag,
      title: pickTitle(aggregate),
      summary: pickSummary(aggregate),
      score: aggregate.score,
      confidence: normalizeConfidence(
        aggregate.score,
        aggregate.evidence.length,
      ),
      signals: [...aggregate.signals].filter(Boolean).slice(0, 4),
      rationale: [...aggregate.rationale].slice(0, 4),
      affectedAreas: [...aggregate.files].slice(0, 6),
      evidence: aggregate.evidence
        .sort((left, right) => right.score - left.score)
        .slice(0, 6),
      commits: aggregate.commits.map((commit) => commit.hash).slice(0, 6),
      files: [...aggregate.files].slice(0, 8),
    };

    return {
      ...candidateBase,
      draft: renderAdrDraft(snapshot, candidateBase),
    };
  });
}
