export type ChangeStatus = "A" | "M" | "D" | "R" | "C" | "T";

export interface CommitFileChange {
  path: string;
  previousPath?: string;
  status: ChangeStatus;
  additions?: number;
  deletions?: number;
  subsystem: string;
  isConfigFile: boolean;
  isDependencyFile: boolean;
}

export interface CommitRecord {
  hash: string;
  authorName: string;
  authorEmail: string;
  authoredAt: string;
  subject: string;
  body: string;
  files: CommitFileChange[];
}

export interface TouchedFileSummary {
  path: string;
  subsystem: string;
  touches: number;
  renameTouches: number;
}

export interface HotspotEdge {
  source: string;
  target: string;
  weight: number;
  commits: string[];
}

export interface RepoSnapshot {
  repoPath: string;
  repoName: string;
  head: string;
  repoKind: string;
  commits: CommitRecord[];
  touchedFiles: TouchedFileSummary[];
  hotspots: HotspotEdge[];
  dependencySignals: CommitRecord[];
  configSignals: CommitRecord[];
  totalCommits: number;
  scannedCommits: number;
  truncated: boolean;
}

export interface EvidenceItem {
  type: "commit" | "file" | "dependency" | "config" | "coupling";
  label: string;
  detail: string;
  hash?: string;
  path?: string;
  score: number;
}

export interface AdrDraft {
  title: string;
  context: string;
  decision: string;
  markdown: string;
  alternatives: string[];
  consequences: string[];
}

export interface DecisionCandidate {
  id: string;
  title: string;
  summary: string;
  score: number;
  confidence: number;
  signals: string[];
  rationale: string[];
  affectedAreas: string[];
  evidence: EvidenceItem[];
  commits: string[];
  files: string[];
  draft: AdrDraft;
}

export interface AnalysisSummary {
  topSignals: string[];
  commitCount: number;
  hotspotCount: number;
  repoKind: string;
  decisionCount: number;
  truncated: boolean;
}

export interface AnalysisRepoMeta {
  path: string;
  name: string;
  head: string;
}

export interface AnalysisResult {
  analysisId: string;
  status: "ready" | "error";
  generatedAt: string;
  repo: AnalysisRepoMeta;
  summary: AnalysisSummary;
  candidates: DecisionCandidate[];
  hotspots: HotspotEdge[];
  notes: string[];
}
