import { NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/analyzer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { repoPath?: string };

  if (!body.repoPath?.trim()) {
    return NextResponse.json(
      { error: "Enter a repository path to analyze." },
      { status: 400 },
    );
  }

  const result = analyzeRepository(body.repoPath);

  return NextResponse.json(
    {
      analysisId: result.analysisId,
      status: result.status,
    },
    {
      status: result.status === "ready" ? 200 : 202,
    },
  );
}
