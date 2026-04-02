import { NextResponse } from "next/server";
import { readAnalysis } from "@/lib/analyzer/cache";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = readAnalysis(id);

  if (!result) {
    return NextResponse.json(
      { error: "Analysis not found." },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
