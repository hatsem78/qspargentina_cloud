export type HealthStatusCode = 'Healthy' | 'Degraded' | 'Progressing' | 'Suspended' | 'Unknown';
export type SyncStatusCode = 'Synced' | 'OutOfSync' | 'Unknown';

export interface ResourceNode {
  id: string;
  name: string;
  kind: 'Application' | 'GVC' | 'Deployment' | 'Service' | 'Pod';
  healthStatus: HealthStatusCode;
  syncStatus: SyncStatusCode;
  age?: string;
  children?: ResourceNode[];
}
