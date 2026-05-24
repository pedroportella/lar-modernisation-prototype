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
