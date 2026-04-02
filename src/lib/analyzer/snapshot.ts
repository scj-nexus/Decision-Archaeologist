import {
  assertGitRepository,
  assertNonShallow,
  assertPathExists,
  getCommitCount,
  getRepoHead,
  getRepoName,
  inferRepoKind,
  readCommits,
} from "./git";
import type {
  CommitRecord,
  HotspotEdge,
  RepoSnapshot,
  TouchedFileSummary,
} from "./types";

const MIN_COMMITS = 4;
const MAX_COMMITS = 250;

function buildHotspots(commits: CommitRecord[]) {
  const edges = new Map<string, { source: string; target: string; weight: number; commits: Set<string> }>();

  for (const commit of commits) {
    const subsystems = [...new Set(commit.files.map((file) => file.subsystem))].filter(
      (subsystem) => subsystem !== "root",
    );

    for (let index = 0; index < subsystems.length; index += 1) {
      for (let offset = index + 1; offset < subsystems.length; offset += 1) {
        const source = subsystems[index];
        const target = subsystems[offset];
        const key = [source, target].sort().join("::");
        const current = edges.get(key) ?? {
          source,
          target,
          weight: 0,
          commits: new Set<string>(),
        };

        current.weight += 1;
        current.commits.add(commit.hash);
        edges.set(key, current);
      }
    }
  }

  return [...edges.values()]
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 8)
    .map(
      (edge): HotspotEdge => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
        commits: [...edge.commits],
      }),
    );
}

function buildTouchedFiles(commits: CommitRecord[]) {
  const files = new Map<string, TouchedFileSummary>();

  for (const commit of commits) {
    for (const file of commit.files) {
      const current = files.get(file.path) ?? {
        path: file.path,
        subsystem: file.subsystem,
        touches: 0,
        renameTouches: 0,
      };

      current.touches += 1;

      if (file.previousPath) {
        current.renameTouches += 1;
      }

      files.set(file.path, current);
    }
  }

  return [...files.values()]
    .sort((left, right) => right.touches - left.touches)
    .slice(0, 16);
}

export function buildRepoSnapshot(repoPath: string): RepoSnapshot {
  assertPathExists(repoPath);
  assertGitRepository(repoPath);
  assertNonShallow(repoPath);

  const totalCommits = getCommitCount(repoPath);

  if (totalCommits < MIN_COMMITS) {
    throw new Error("Decision archaeology needs at least four commits to infer a credible story.");
  }

  const commits = readCommits(repoPath, MAX_COMMITS);
  const dependencySignals = commits.filter((commit) =>
    commit.files.some((file) => file.isDependencyFile),
  );
  const configSignals = commits.filter((commit) =>
    commit.files.some((file) => file.isConfigFile),
  );

  return {
    repoPath,
    repoName: getRepoName(repoPath),
    head: getRepoHead(repoPath),
    repoKind: inferRepoKind(repoPath),
    commits,
    touchedFiles: buildTouchedFiles(commits),
    hotspots: buildHotspots(commits),
    dependencySignals,
    configSignals,
    totalCommits,
    scannedCommits: commits.length,
    truncated: totalCommits > commits.length,
  };
}
