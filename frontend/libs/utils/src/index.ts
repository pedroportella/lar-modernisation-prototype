export type WorkstreamStatus = 'OnTrack' | 'AtRisk' | 'Blocked' | 'Monitoring' | 'Complete';

const statusOrder: Record<WorkstreamStatus, number> = {
  Blocked: 0,
  AtRisk: 1,
  Monitoring: 2,
  OnTrack: 3,
  Complete: 4,
};

export function formatStatus(status: string): string {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function sortByStatusRisk<T extends { status: string }>(items: readonly T[]): T[] {
  return [...items].sort((first, second) => {
    const firstRank = statusOrder[first.status as WorkstreamStatus] ?? 99;
    const secondRank = statusOrder[second.status as WorkstreamStatus] ?? 99;

    return firstRank - secondRank;
  });
}
