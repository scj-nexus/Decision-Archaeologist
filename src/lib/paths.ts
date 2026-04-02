import path from "node:path";

export function getProjectRoot() {
  return process.cwd();
}

export function getDemoRepoPath() {
  return path.resolve(getProjectRoot(), "fixtures", "demo-repo");
}
