import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeRepository } from "@/lib/analyzer";
import { ensureDemoRepo } from "@/lib/demo-repo";

describe("Windows path handling", () => {
  it("analyzes a repo path that contains spaces", () => {
    const spacedRepoPath = path.join(os.tmpdir(), "decision archaeologist demo repo");
    ensureDemoRepo(spacedRepoPath);

    const result = analyzeRepository(spacedRepoPath);

    expect(result.status).toBe("ready");
    expect(result.repo.path).toBe(path.resolve(spacedRepoPath));
  });
});
