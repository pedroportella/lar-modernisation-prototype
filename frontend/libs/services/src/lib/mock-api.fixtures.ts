import type {
  AutomationCandidate,
  HrPlatformTask,
  InsightMetric,
  OperationalStatus,
  PaymentReadinessItem,
  ProgramReadiness,
  WarehouseSignal,
  Workstream,
  WorkstreamDetail,
} from './workstream.models';

export const mockWorkstreams: Workstream[] = [
  {
    id: 'payments',
    name: 'Payments Migration',
    status: 'AtRisk',
    summary:
      'Move payments onto the modern provider boundary with controlled cutover risk.',
    priority: 1,
  },
  {
    id: 'warehouse',
    name: 'Warehouse Optimisation',
    status: 'OnTrack',
    summary:
      'Reduce dispatch friction across fulfilment centres using operational signals.',
    priority: 2,
  },
  {
    id: 'hr-platform',
    name: 'HR Platform Uplift',
    status: 'Blocked',
    summary:
      'Track people-platform uplift tasks, process risk and integration readiness.',
    priority: 3,
  },
  {
    id: 'insights',
    name: 'Wayfinding Insights',
    status: 'Monitoring',
    summary:
      'Surface the right decision signal for leadership and delivery teams.',
    priority: 4,
  },
  {
    id: 'automation',
    name: 'Automation Opportunity Queue',
    status: 'Monitoring',
    summary:
      'Prioritise automation candidates with value, effort and governance context.',
    priority: 5,
  },
];

export const mockWorkstreamDetails: WorkstreamDetail[] = [
  {
    ...mockWorkstreams[0],
    initiatives: [
      {
        id: 1,
        name: 'Cutover readiness review',
        status: 'AtRisk',
        owner: 'Release lead',
        nextAction: 'Validate dual-write controls and rollback checkpoints.',
      },
      {
        id: 2,
        name: 'Provider settlement reconciliation',
        status: 'Monitoring',
        owner: 'Payments lead',
        nextAction:
          'Compare settlement reports against current finance extracts.',
      },
    ],
  },
  {
    ...mockWorkstreams[1],
    initiatives: [
      {
        id: 3,
        name: 'Pick exception reduction',
        status: 'OnTrack',
        owner: 'Fulfilment lead',
        nextAction:
          'Target bin-location corrections for top exception categories.',
      },
    ],
  },
  {
    ...mockWorkstreams[2],
    initiatives: [
      {
        id: 4,
        name: 'Role and entitlement mapping',
        status: 'Blocked',
        owner: 'People systems lead',
        nextAction:
          'Resolve payroll approval dependency before migration rehearsal.',
      },
    ],
  },
  {
    ...mockWorkstreams[3],
    initiatives: [
      {
        id: 5,
        name: 'Leadership signal catalogue',
        status: 'Monitoring',
        owner: 'Insights lead',
        nextAction: 'Confirm critical measures for weekly steering review.',
      },
    ],
  },
  {
    ...mockWorkstreams[4],
    initiatives: [
      {
        id: 6,
        name: 'Governed automation intake',
        status: 'Monitoring',
        owner: 'Automation lead',
        nextAction: 'Run governance review for supplier onboarding triage.',
      },
    ],
  },
];

export const mockPaymentReadiness: PaymentReadinessItem[] = [
  {
    id: 1,
    area: 'Token migration',
    status: 'AtRisk',
    risk: 'Provider cutover sequencing',
    owner: 'Payments lead',
    nextAction: 'Validate dual-write plan',
  },
  {
    id: 2,
    area: 'Settlement reporting',
    status: 'Monitoring',
    risk: 'Finance reconciliation timing',
    owner: 'Finance systems lead',
    nextAction: 'Confirm daily extract comparison',
  },
];

export const mockWarehouseSignals: WarehouseSignal[] = [
  {
    id: 1,
    signalName: 'Pick exceptions',
    currentValue: 14,
    unit: 'per shift',
    status: 'OnTrack',
    opportunity: 'Target bin-location corrections',
  },
];

export const mockHrPlatformTasks: HrPlatformTask[] = [
  {
    id: 1,
    taskName: 'Role mapping',
    status: 'Blocked',
    processRisk: 'Payroll approval dependency',
    owner: 'People systems lead',
  },
];

export const mockInsightMetrics: InsightMetric[] = [
  {
    id: 1,
    metricName: 'Decision latency',
    value: 3,
    unit: 'days',
    status: 'AtRisk',
  },
];

export const mockAutomationCandidates: AutomationCandidate[] = [
  {
    id: 1,
    workflowName: 'Supplier onboarding triage',
    valueScore: 8,
    effortScore: 3,
    riskClass: 'Medium',
    recommendedNextStep: 'Run governance review',
  },
];

export const mockOperationsStatus: OperationalStatus = {
  service: 'LargeRetailer.Modernisation.Api',
  status: 'Ready',
  environment: 'Mock',
  generatedAtUtc: '2026-05-25T00:00:00Z',
  database: {
    provider: 'Mock data',
    status: 'Available',
  },
  counts: {
    workstreams: mockWorkstreams.length,
    initiatives: mockWorkstreamDetails.reduce(
      (total, workstream) => total + workstream.initiatives.length,
      0,
    ),
    paymentReadinessItems: mockPaymentReadiness.length,
    warehouseSignals: mockWarehouseSignals.length,
    hrPlatformTasks: mockHrPlatformTasks.length,
    insightMetrics: mockInsightMetrics.length,
    automationCandidates: mockAutomationCandidates.length,
  },
};

export const mockProgramReadiness: ProgramReadiness = {
  overallStatus: 'AtRisk',
  readinessScore: 66,
  summary: '3 of 5 workstreams need active delivery attention.',
  signals: [
    { label: 'Total workstreams', value: 5, status: 'OnTrack' },
    { label: 'Needs attention', value: 3, status: 'AtRisk' },
    { label: 'On track', value: 1, status: 'OnTrack' },
    { label: 'Monitoring', value: 2, status: 'Monitoring' },
  ],
  recommendedActions: [
    {
      workstreamId: 'payments',
      workstreamName: 'Payments Migration',
      initiative: 'Cutover readiness review',
      owner: 'Release lead',
      status: 'AtRisk',
      nextAction: 'Validate dual-write controls and rollback checkpoints.',
    },
    {
      workstreamId: 'hr-platform',
      workstreamName: 'HR Platform Uplift',
      initiative: 'Role and entitlement mapping',
      owner: 'People systems lead',
      status: 'Blocked',
      nextAction:
        'Resolve payroll approval dependency before migration rehearsal.',
    },
  ],
};
