import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getProjectRoot } from "../paths";
import type { AnalysisResult } from "./types";

function getCacheDir() {
  return path.resolve(getProjectRoot(), ".cache");
}

function slugify(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

export function createAnalysisId(repoPath: string, head: string) {
  return `${slugify(repoPath)}--${head.slice(0, 12)}`;
}

export function createErrorAnalysisId(repoPath: string) {
  return `${slugify(repoPath)}--error`;
}

function getCacheFilePath(analysisId: string) {
  return path.resolve(getCacheDir(), `${analysisId}.json`);
}

export function writeAnalysis(result: AnalysisResult) {
  mkdirSync(getCacheDir(), { recursive: true });
  writeFileSync(getCacheFilePath(result.analysisId), JSON.stringify(result, null, 2));
}

export function readAnalysis(analysisId: string): AnalysisResult | null {
  try {
    return JSON.parse(readFileSync(getCacheFilePath(analysisId), "utf8")) as AnalysisResult;
  } catch {
    return null;
  }
}
