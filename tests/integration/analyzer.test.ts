import { beforeAll, describe, expect, it } from "vitest";
import { analyzeRepository } from "@/lib/analyzer";
import { ensureDemoRepo } from "@/lib/demo-repo";
import { getDemoRepoPath } from "@/lib/paths";

describe("analyzeRepository", () => {
  beforeAll(() => {
    ensureDemoRepo();
  });

  it("surfaces the demo repo's planned decisions", () => {
    const result = analyzeRepository(getDemoRepoPath());
    const titles = result.candidates.map((candidate) => candidate.title);

    expect(result.status).toBe("ready");
    expect(result.candidates.length).toBeGreaterThanOrEqual(4);
    expect(titles.some((title) => title.includes("Next.js"))).toBe(true);
    expect(titles.some((title) => title.includes("feature strata"))).toBe(true);
    expect(titles.some((title) => title.includes("toolchain"))).toBe(true);
    expect(titles.some((title) => title.includes("Strict configuration"))).toBe(true);
  });
});
