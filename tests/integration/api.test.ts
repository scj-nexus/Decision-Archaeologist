import { beforeAll, describe, expect, it } from "vitest";
import { POST as postAnalyze } from "@/app/api/analyze/route";
import { GET as getAnalysis } from "@/app/api/analysis/[id]/route";
import { ensureDemoRepo } from "@/lib/demo-repo";
import { getDemoRepoPath } from "@/lib/paths";

describe("analysis API", () => {
  beforeAll(() => {
    ensureDemoRepo();
  });

  it("rejects an empty repo path", async () => {
    const response = await postAnalyze(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath: "" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("creates and fetches a cached analysis", async () => {
    const postResponse = await postAnalyze(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath: getDemoRepoPath() }),
      }),
    );
    const postPayload = (await postResponse.json()) as {
      analysisId: string;
      status: string;
    };

    expect(postResponse.status).toBe(200);
    expect(postPayload.analysisId).toBeTruthy();

    const getResponse = await getAnalysis(new Request("http://localhost/api/analysis"), {
      params: Promise.resolve({ id: postPayload.analysisId }),
    });
    const getPayload = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(getPayload.status).toBe("ready");
    expect(getPayload.candidates.length).toBeGreaterThan(0);
  });
});
