export type WorkstreamStatus =
  | 'OnTrack'
  | 'AtRisk'
  | 'Blocked'
  | 'Monitoring'
  | 'Complete';

export type DisplayRole = 'Viewer' | 'DeliveryLead' | 'Admin';

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

export function formatRole(role: string): string {
  return sentenceCase(formatStatus(role));
}

export function formatRoles(roles: readonly string[]): string {
  return roles.map(formatRole).join(' or ');
}

function sentenceCase(value: string): string {
  return value.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export function sortByStatusRisk<T extends { status: string }>(
  items: readonly T[],
): T[] {
  return [...items].sort((first, second) => {
    const firstRank = statusOrder[first.status as WorkstreamStatus] ?? 99;
    const secondRank = statusOrder[second.status as WorkstreamStatus] ?? 99;

    return firstRank - secondRank;
  });
}
