export interface Workstream {
  id: string;
  name: string;
  status: string;
  summary: string;
  priority: number;
}

export interface Initiative {
  id: number;
  name: string;
  status: string;
  owner: string;
  nextAction: string;
}

export interface WorkstreamDetail extends Workstream {
  initiatives: Initiative[];
}

export interface PaymentReadinessItem {
  id: number;
  area: string;
  status: string;
  risk: string;
  owner: string;
  nextAction: string;
}

export interface WarehouseSignal {
  id: number;
  signalName: string;
  currentValue: number;
  unit: string;
  status: string;
  opportunity: string;
}

export interface HrPlatformTask {
  id: number;
  taskName: string;
  status: string;
  processRisk: string;
  owner: string;
}

export interface InsightMetric {
  id: number;
  metricName: string;
  value: number;
  unit: string;
  status: string;
}

export interface AutomationCandidate {
  id: number;
  workflowName: string;
  valueScore: number;
  effortScore: number;
  riskClass: string;
  recommendedNextStep: string;
}

export interface OperationalStatus {
  service: string;
  status: string;
  environment: string;
  generatedAtUtc: string;
  correlationId: string;
  runtime: OperationalRuntimeStatus;
  database: OperationalDatabaseStatus;
  counts: OperationalDatasetCounts;
}

export interface OperationalRuntimeStatus {
  buildName: string;
  buildVersion: string;
  databaseProvider: string;
  correlationHeader: string;
}

export interface OperationalDatabaseStatus {
  provider: string;
  status: string;
}

export interface OperationalDatasetCounts {
  workstreams: number;
  initiatives: number;
  paymentReadinessItems: number;
  warehouseSignals: number;
  hrPlatformTasks: number;
  insightMetrics: number;
  automationCandidates: number;
}

export interface ProgramReadiness {
  overallStatus: string;
  readinessScore: number;
  summary: string;
  signals: ReadinessSignal[];
  recommendedActions: RecommendedAction[];
}

export interface ReadinessSignal {
  label: string;
  value: number;
  status: string;
}

export interface RecommendedAction {
  workstreamId: string;
  workstreamName: string;
  initiative: string;
  owner: string;
  status: string;
  nextAction: string;
}

export interface WorkflowReview {
  id: number;
  slice: string;
  recordId: number;
  status: string;
  action: string;
  note: string;
  reviewedBy: string;
  reviewedAtUtc: string;
}

export interface WorkflowReviewRequest {
  status: string;
  action: string;
  note: string;
  reviewedBy: string;
}
