import { AnalysisWorkspace } from "@/components/analysis/analysis-workspace";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="site-shell px-5 pb-10 pt-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <AnalysisWorkspace analysisId={id} />
      </div>
    </main>
  );
}
