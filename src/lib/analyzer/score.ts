import type { CommitRecord, EvidenceItem, RepoSnapshot } from "./types";

export type CandidateTag =
  | "framework"
  | "restructure"
  | "dependency"
  | "config"
  | "coupling";

export interface CandidateAggregate {
  tag: CandidateTag;
  score: number;
  signals: Set<string>;
  rationale: Set<string>;
  commits: CommitRecord[];
  files: Set<string>;
  evidence: EvidenceItem[];
}

const TAGS: CandidateTag[] = [
  "framework",
  "restructure",
  "dependency",
  "config",
  "coupling",
];

const FRAMEWORK_TERMS = [
  "next",
  "router",
  "framework",
  "migration",
  "migrate",
  "runtime",
  "spa",
];
const RESTRUCTURE_TERMS = [
  "reorganize",
  "restructure",
  "refactor",
  "module",
  "feature",
  "core",
  "ownership",
];
const DEPENDENCY_TERMS = [
  "toolchain",
  "webpack",
  "vite",
  "jest",
  "vitest",
  "dependency",
  "package",
  "switch",
];
const CONFIG_TERMS = [
  "config",
  "strict",
  "routing",
  "cache",
  "stabilize",
  "eslint",
  "tsconfig",
];

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function scoreCommit(
  commit: CommitRecord,
  aggregates: Map<CandidateTag, CandidateAggregate>,
) {
  const text = `${commit.subject} ${commit.body}`.toLowerCase();
  const renameCount = commit.files.filter((file) => file.previousPath).length;
  const dependencyCount = commit.files.filter((file) => file.isDependencyFile).length;
  const configCount = commit.files.filter((file) => file.isConfigFile).length;
  const breadth = new Set(commit.files.map((file) => file.subsystem)).size;

  const scores: Record<CandidateTag, number> = {
    framework: 0,
    restructure: 0,
    dependency: 0,
    config: 0,
    coupling: 0,
  };

  if (containsAny(text, FRAMEWORK_TERMS)) {
    scores.framework += 4;
  }

  if (containsAny(text, RESTRUCTURE_TERMS)) {
    scores.restructure += 3;
  }

  if (containsAny(text, DEPENDENCY_TERMS)) {
    scores.dependency += 4;
  }

  if (containsAny(text, CONFIG_TERMS)) {
    scores.config += 4;
  }

  scores.restructure += renameCount * 2;
  scores.dependency += dependencyCount * 3;
  scores.config += configCount * 2;

  if (breadth >= 3) {
    scores.restructure += 2;
    scores.coupling += 2;
  }

  if (breadth >= 4) {
    scores.framework += 1;
    scores.coupling += 2;
  }

  if (dependencyCount > 0 && configCount > 0) {
    scores.framework += 2;
    scores.dependency += 1;
  }

  const primaryFile = commit.files[0]?.path;

  for (const tag of TAGS) {
    const score = scores[tag];

    if (score <= 0) {
      continue;
    }

    const aggregate = aggregates.get(tag)!;
    aggregate.score += score;
    aggregate.commits.push(commit);
    aggregate.signals.add(
      [
        renameCount ? `${renameCount} rename signal${renameCount > 1 ? "s" : ""}` : null,
        dependencyCount
          ? `${dependencyCount} dependency manifest touch${dependencyCount > 1 ? "es" : ""}`
          : null,
        configCount ? `${configCount} config touch${configCount > 1 ? "es" : ""}` : null,
        breadth >= 3 ? `${breadth} subsystems moved together` : null,
      ]
        .filter(Boolean)
        .join(", "),
    );
    aggregate.rationale.add(commit.subject);

    for (const file of commit.files.slice(0, 5)) {
      aggregate.files.add(file.path);
    }

    aggregate.evidence.push({
      type:
        tag === "dependency"
          ? "dependency"
          : tag === "config"
            ? "config"
            : "commit",
      label: commit.subject,
      detail: primaryFile
        ? `Touches ${commit.files.length} files. First hotspot: ${primaryFile}`
        : "Commit with no parsed file changes.",
      hash: commit.hash,
      path: primaryFile,
      score,
    });
  }
}

export function buildAggregates(snapshot: RepoSnapshot) {
  const aggregates = new Map<CandidateTag, CandidateAggregate>(
    TAGS.map((tag) => [
      tag,
      {
        tag,
        score: 0,
        signals: new Set<string>(),
        rationale: new Set<string>(),
        commits: [],
        files: new Set<string>(),
        evidence: [],
      },
    ]),
  );

  for (const commit of snapshot.commits) {
    scoreCommit(commit, aggregates);
  }

  for (const edge of snapshot.hotspots.slice(0, 4)) {
    const aggregate = aggregates.get("coupling")!;
    aggregate.score += edge.weight * 2;
    aggregate.signals.add(`${edge.source} and ${edge.target} repeatedly changed together`);
    aggregate.rationale.add(
      `Repeated co-change between ${edge.source} and ${edge.target} across ${edge.weight} commits.`,
    );
    aggregate.evidence.push({
      type: "coupling",
      label: `${edge.source} <-> ${edge.target}`,
      detail: `${edge.weight} co-change commits`,
      score: edge.weight * 2,
    });
    aggregate.files.add(edge.source);
    aggregate.files.add(edge.target);
  }

  return [...aggregates.values()].filter((aggregate) => aggregate.score > 0);
}

