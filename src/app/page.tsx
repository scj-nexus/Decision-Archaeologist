import { AnalyzeForm } from "@/components/home/analyze-form";
import { getDemoRepoPath } from "@/lib/paths";

const workflow = [
  {
    title: "Surface hidden pivots",
    detail: "Find the runtime switches, restructures, and hardening passes that were never written down.",
  },
  {
    title: "Tie every claim to evidence",
    detail: "Score each decision with commit messages, hotspot seams, and file movement instead of vibes.",
  },
  {
    title: "Export an ADR draft",
    detail: "Start with a markdown draft that already includes context, tradeoffs, and supporting evidence.",
  },
];

export default function Home() {
  return (
    <main className="site-shell px-5 pb-16 pt-5 sm:px-8 lg:px-10">
      <section className="poster-surface mx-auto grid min-h-[calc(100svh-2.5rem)] max-w-7xl gap-10 rounded-[2rem] px-6 py-8 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-14 lg:py-12">
        <div className="relative z-10 flex flex-col justify-between gap-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4 text-sm text-[rgba(50,33,23,0.75)]">
              <span className="section-label text-xs">Decision Archaeologist</span>
              <span className="font-mono text-xs uppercase tracking-[0.28em]">Local-first repository forensics</span>
            </div>
            <div className="max-w-4xl space-y-6">
              <p className="section-label text-xs">Excavate the decisions your repo forgot to document</p>
              <h1 className="display-title max-w-4xl text-6xl leading-[0.92] text-[var(--foreground)] sm:text-7xl lg:text-8xl">
                Mine git history into architecture evidence, then leave with an ADR.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[rgba(43,28,19,0.78)] sm:text-xl">
                Decision Archaeologist turns commit history into a ranked map of framework pivots,
                ownership reshuffles, coupling seams, and configuration hardening. Point it at a repo,
                get the five likeliest hidden decisions, and export the draft narrative.
              </p>
            </div>
            <AnalyzeForm demoRepoPath={getDemoRepoPath()} />
          </div>
          <div className="grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
            {workflow.map((item, index) => (
              <div key={item.title} className="space-y-3 pr-4">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[rgba(76,52,37,0.7)]">
                  0{index + 1}
                </p>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">{item.title}</h2>
                <p className="text-sm leading-7 text-[rgba(43,28,19,0.72)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:pl-8">
          <div className="panel-dark terrain-lines rounded-[1.75rem] px-6 py-6 glow-edge sm:px-8 sm:py-8">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(247,231,207,0.72)]">
                    Sample dig site
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-[var(--sand)]">
                    Decision strata from a real commit sequence
                  </h2>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[rgba(247,231,207,0.58)]">
                  Demo fixture included
                </p>
              </div>
              <div className="space-y-4 text-sm leading-7 text-[rgba(248,236,215,0.8)]">
                <p>
                  The bundled demo repo includes a framework migration, a feature-strata reorg with renames,
                  a webpack-to-vite toolchain swap, and a configuration hardening pass.
                </p>
                <p>
                  That means the first run produces meaningful evidence immediately, not placeholder cards or mock data.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="panel-line rounded-[1.5rem] px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[rgba(76,52,37,0.65)]">
                What the engine scores
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[rgba(43,28,19,0.76)]">
                <li>Framework migrations and runtime pivots</li>
                <li>Renames, file moves, and ownership reshuffles</li>
                <li>Dependency swaps and build-tool replacement</li>
                <li>Config churn, strictness passes, and route hardening</li>
                <li>Repeated subsystem co-change hotspots</li>
              </ul>
            </div>
            <div className="panel-line rounded-[1.5rem] px-5 py-5 terrain-lines">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[rgba(76,52,37,0.65)]">
                Output
              </p>
              <div className="mt-6 space-y-4 text-sm text-[rgba(43,28,19,0.76)]">
                <p className="text-4xl font-semibold text-[var(--foreground)]">Top 5</p>
                <p>ranked hidden decisions with rationale, confidence, evidence, and a markdown export.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
