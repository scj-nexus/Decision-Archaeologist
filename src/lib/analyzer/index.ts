import { ensureDemoRepo } from "../demo-repo";
import { getDemoRepoPath } from "../paths";
import { buildRepoSnapshot } from "./snapshot";
import { buildDecisionCandidates } from "./cluster";
import { createAnalysisId, createErrorAnalysisId, readAnalysis, writeAnalysis } from "./cache";
import { resolveRepoPath } from "./git";
import type { AnalysisResult } from "./types";

function createErrorResult(repoPath: string, message: string): AnalysisResult {
  return {
    analysisId: createErrorAnalysisId(repoPath),
    status: "error",
    generatedAt: new Date().toISOString(),
    repo: {
      path: repoPath,
      name: repoPath.split(/[\\/]/).pop() || repoPath,
      head: "unknown",
    },
    summary: {
      topSignals: [],
      commitCount: 0,
      hotspotCount: 0,
      repoKind: "Unknown",
      decisionCount: 0,
      truncated: false,
    },
    candidates: [],
    hotspots: [],
    notes: [message],
  };
}

export function analyzeRepository(inputPath: string): AnalysisResult {
  const repoPath = resolveRepoPath(inputPath);

  if (repoPath === getDemoRepoPath()) {
    ensureDemoRepo(repoPath);
  }

  try {
    const snapshot = buildRepoSnapshot(repoPath);
    const analysisId = createAnalysisId(snapshot.repoPath, snapshot.head);
    const cached = readAnalysis(analysisId);

    if (cached) {
      return cached;
    }

    const candidates = buildDecisionCandidates(snapshot);
    const result: AnalysisResult = {
      analysisId,
      status: "ready",
      generatedAt: new Date().toISOString(),
      repo: {
        path: snapshot.repoPath,
        name: snapshot.repoName,
        head: snapshot.head,
      },
      summary: {
        topSignals: candidates.map((candidate) => candidate.title).slice(0, 3),
        commitCount: snapshot.scannedCommits,
        hotspotCount: snapshot.hotspots.length,
        repoKind: snapshot.repoKind,
        decisionCount: candidates.length,
        truncated: snapshot.truncated,
      },
      candidates,
      hotspots: snapshot.hotspots,
      notes: snapshot.truncated
        ? [
            `Scanned the most recent ${snapshot.scannedCommits} commits out of ${snapshot.totalCommits}.`,
          ]
        : ["Full visible history scanned."],
    };

    writeAnalysis(result);
    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed unexpectedly.";
    const result = createErrorResult(repoPath, message);
    writeAnalysis(result);
    return result;
  }
}
