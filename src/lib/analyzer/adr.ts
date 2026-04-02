import type { AdrDraft, DecisionCandidate, RepoSnapshot } from "./types";

const alternativesByTag: Record<string, string[]> = {
  framework: [
    "Keep the legacy runtime and postpone the migration",
    "Migrate one feature slice at a time behind compatibility adapters",
  ],
  restructure: [
    "Preserve the original folder topology and accept cross-team overlap",
    "Reorganize only the most volatile modules instead of the whole seam",
  ],
  dependency: [
    "Retain the incumbent toolchain and optimize around its pain points",
    "Run both toolchains in parallel for a longer transition period",
  ],
  config: [
    "Keep permissive defaults and address defects case by case",
    "Roll strict checks out incrementally instead of in one pass",
  ],
  coupling: [
    "Accept the coordination tax across the coupled seams",
    "Extract a narrow shared boundary before broader refactors",
  ],
};

export function renderAdrDraft(
  snapshot: RepoSnapshot,
  candidate: Omit<DecisionCandidate, "draft"> & { tag: string },
): AdrDraft {
  const alternatives = alternativesByTag[candidate.tag] ?? alternativesByTag.coupling;
  const consequences = [
    `Higher clarity across ${candidate.affectedAreas.slice(0, 3).join(", ")}.`,
    "More explicit ownership in future changes touching the same seam.",
    snapshot.truncated
      ? "Confidence is limited by the scanned commit window."
      : "Confidence is based on the full visible history.",
  ];
  const context = `${snapshot.repoName} shows repeated evidence that ${candidate.summary.toLowerCase()}`;
  const decision = candidate.summary;
  const markdown = [
    `# ADR: ${candidate.title}`,
    "",
    "## Status",
    "Inferred from git history",
    "",
    "## Context",
    context,
    "",
    "## Decision",
    decision,
    "",
    "## Alternatives considered",
    ...alternatives.map((alternative) => `- ${alternative}`),
    "",
    "## Consequences",
    ...consequences.map((consequence) => `- ${consequence}`),
    "",
    "## Supporting evidence",
    ...candidate.evidence
      .slice(0, 6)
      .map((item) => `- ${item.label}: ${item.detail}`),
  ].join("\n");

  return {
    title: candidate.title,
    context,
    decision,
    markdown,
    alternatives,
    consequences,
  };
}
