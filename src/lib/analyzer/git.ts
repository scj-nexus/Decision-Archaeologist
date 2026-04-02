import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import type { ChangeStatus, CommitFileChange, CommitRecord } from "./types";

const COMMIT_SEPARATOR = "\u001e";
const FIELD_SEPARATOR = "\u001f";
const MAX_BUFFER = 8 * 1024 * 1024;
const DEFAULT_COMMIT_LIMIT = 250;

const CONFIG_PATTERNS = [
  "tsconfig",
  "eslint",
  "prettier",
  "next.config",
  "vite.config",
  "webpack",
  "config/",
  ".github/",
  "vitest.config",
  "jest.config",
  "tailwind.config",
];

const DEPENDENCY_FILES = [
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "requirements.txt",
  "pyproject.toml",
  "Gemfile",
  "Cargo.toml",
  "Cargo.lock",
];

export class AnalyzerInputError extends Error {}

function runGit(repoPath: string, args: string[]) {
  try {
    return execFileSync("git", args, {
      cwd: repoPath,
      encoding: "utf8",
      maxBuffer: MAX_BUFFER,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 20_000,
    }).trim();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Git command failed";
    throw new AnalyzerInputError(message);
  }
}

export function resolveRepoPath(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new AnalyzerInputError("Enter a repository path to analyze.");
  }

  return path.resolve(trimmed);
}

export function assertPathExists(repoPath: string) {
  if (!existsSync(repoPath)) {
    throw new AnalyzerInputError(`Repository path does not exist: ${repoPath}`);
  }
}

export function assertGitRepository(repoPath: string) {
  const inside = runGit(repoPath, ["rev-parse", "--is-inside-work-tree"]);

  if (inside !== "true") {
    throw new AnalyzerInputError(`${repoPath} is not a git repository.`);
  }
}

export function assertNonShallow(repoPath: string) {
  const shallow = runGit(repoPath, ["rev-parse", "--is-shallow-repository"]);

  if (shallow === "true") {
    throw new AnalyzerInputError(
      "This repository is a shallow clone. Fetch full history before analyzing it.",
    );
  }
}

export function getRepoHead(repoPath: string) {
  return runGit(repoPath, ["rev-parse", "HEAD"]);
}

export function getRepoName(repoPath: string) {
  return path.basename(repoPath);
}

export function getCommitCount(repoPath: string) {
  return Number.parseInt(runGit(repoPath, ["rev-list", "--count", "HEAD"]), 10);
}

function inferSubsystem(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/");
  const [first, second] = normalized.split("/");

  if (!second) {
    return "root";
  }

  if (first === "src" && second) {
    return second;
  }

  return first || "root";
}

function isDependencyFile(filePath: string) {
  return DEPENDENCY_FILES.some((fileName) => filePath.endsWith(fileName));
}

function isConfigFile(filePath: string) {
  return CONFIG_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function parseNameStatusLine(line: string): CommitFileChange | null {
  if (!line.trim()) {
    return null;
  }

  const parts = line.split("\t");
  const rawStatus = parts[0];

  if (!rawStatus) {
    return null;
  }

  const status = rawStatus[0] as ChangeStatus;

  if (status === "R" || status === "C") {
    const previousPath = parts[1];
    const nextPath = parts[2];

    if (!previousPath || !nextPath) {
      return null;
    }

    return {
      status,
      previousPath,
      path: nextPath,
      subsystem: inferSubsystem(nextPath),
      isConfigFile: isConfigFile(nextPath) || isConfigFile(previousPath),
      isDependencyFile:
        isDependencyFile(nextPath) || isDependencyFile(previousPath),
    };
  }

  const filePath = parts[1];

  if (!filePath) {
    return null;
  }

  return {
    status,
    path: filePath,
    subsystem: inferSubsystem(filePath),
    isConfigFile: isConfigFile(filePath),
    isDependencyFile: isDependencyFile(filePath),
  };
}

function readCommitFiles(repoPath: string, hash: string) {
  const raw = runGit(repoPath, [
    "diff-tree",
    "--root",
    "--find-renames=90%",
    "--no-commit-id",
    "--name-status",
    "-r",
    hash,
  ]);

  return raw
    .split(/\r?\n/)
    .map((line) => parseNameStatusLine(line))
    .filter((entry): entry is CommitFileChange => Boolean(entry));
}

export function readCommits(
  repoPath: string,
  commitLimit = DEFAULT_COMMIT_LIMIT,
) {
  const raw = runGit(repoPath, [
    "log",
    "--date=iso-strict",
    `--max-count=${commitLimit}`,
    `--format=${COMMIT_SEPARATOR}%H${FIELD_SEPARATOR}%an${FIELD_SEPARATOR}%ae${FIELD_SEPARATOR}%ad${FIELD_SEPARATOR}%s${FIELD_SEPARATOR}%b`,
  ]);

  return raw
    .split(COMMIT_SEPARATOR)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [
        hash,
        authorName,
        authorEmail,
        authoredAt,
        subject,
        body = "",
      ] = record.split(FIELD_SEPARATOR);

      const files = readCommitFiles(repoPath, hash);

      return {
        hash,
        authorName,
        authorEmail,
        authoredAt,
        subject,
        body: body.trim(),
        files,
      } satisfies CommitRecord;
    });
}

export function inferRepoKind(repoPath: string) {
  const manifests = [
    { file: "package.json", label: "JavaScript / TypeScript" },
    { file: "pyproject.toml", label: "Python" },
    { file: "Cargo.toml", label: "Rust" },
    { file: "go.mod", label: "Go" },
  ];

  for (const manifest of manifests) {
    if (existsSync(path.resolve(repoPath, manifest.file))) {
      return manifest.label;
    }
  }

  return "Mixed or infrastructure";
}
