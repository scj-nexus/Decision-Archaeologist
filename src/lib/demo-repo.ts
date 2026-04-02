import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { getDemoRepoPath, getProjectRoot } from "./paths";

export function ensureDemoRepo(targetPath = getDemoRepoPath()) {
  const gitPath = path.resolve(targetPath, ".git");

  if (existsSync(gitPath)) {
    return targetPath;
  }

  execFileSync(process.execPath, [path.resolve(getProjectRoot(), "scripts", "generate-demo-repo.mjs"), targetPath], {
    cwd: getProjectRoot(),
    stdio: "pipe",
    encoding: "utf8",
  });

  return targetPath;
}
