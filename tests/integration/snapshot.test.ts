import { beforeAll, describe, expect, it } from "vitest";
import { ensureDemoRepo } from "@/lib/demo-repo";
import { getDemoRepoPath } from "@/lib/paths";
import { buildRepoSnapshot } from "@/lib/analyzer/snapshot";

describe("buildRepoSnapshot", () => {
  beforeAll(() => {
    ensureDemoRepo();
  });

  it("captures rename-based reorganization signals", () => {
    const snapshot = buildRepoSnapshot(getDemoRepoPath());
    const renameCommits = snapshot.commits.filter((commit) =>
      commit.files.some((file) => Boolean(file.previousPath)),
    );

    expect(renameCommits.length).toBeGreaterThan(0);
    expect(snapshot.hotspots.length).toBeGreaterThan(0);
  });
});
