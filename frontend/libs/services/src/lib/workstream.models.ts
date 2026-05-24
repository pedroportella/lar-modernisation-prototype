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
