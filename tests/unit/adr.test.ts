import { describe, expect, it } from "vitest";
import { renderAdrDraft } from "@/lib/analyzer/adr";
import type { RepoSnapshot } from "@/lib/analyzer/types";

describe("renderAdrDraft", () => {
  it("renders a markdown ADR with evidence sections", () => {
    const snapshot = {
      repoPath: "C:/demo",
      repoName: "demo-repo",
      head: "abc123",
      repoKind: "JavaScript / TypeScript",
      commits: [],
      touchedFiles: [],
      hotspots: [],
      dependencySignals: [],
      configSignals: [],
      totalCommits: 6,
      scannedCommits: 6,
      truncated: false,
    } satisfies RepoSnapshot;

    const draft = renderAdrDraft(snapshot, {
      id: "framework-1",
      tag: "framework",
      title: "The runtime pivoted to Next.js",
      summary: "The repository history points to a major framework-level runtime migration.",
      score: 18,
      confidence: 0.88,
      signals: ["3 config touches"],
      rationale: ["migrate the excavation board to Next.js app router"],
      affectedAreas: ["app", "src/core"],
      evidence: [
        {
          type: "commit",
          label: "migrate the excavation board to Next.js app router",
          detail: "Touches 6 files.",
          score: 6,
        },
      ],
      commits: ["abc123"],
      files: ["app/page.tsx"],
    });

    expect(draft.markdown).toContain("# ADR: The runtime pivoted to Next.js");
    expect(draft.markdown).toContain("## Context");
    expect(draft.markdown).toContain("## Decision");
    expect(draft.markdown).toContain("## Supporting evidence");
  });
});
