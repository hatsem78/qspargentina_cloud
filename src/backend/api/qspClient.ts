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

export interface QspApplication {
  metadata: { name: string; namespace: string };
  spec: { source: { repoURL: string; targetRevision: string } };
  status?: {
    sync?: { status: string };
    health?: { status: string };
    resources?: Array<{ kind: string; name: string; status?: string }>;
  };
}

const QSP_CD_URL = process.env.QSP_CD_URL || 'http://localhost:8080';

function mapHealthStatus(raw: string | undefined): HealthStatusCode {
  switch (raw) {
    case 'Healthy': return 'Healthy';
    case 'Degraded': return 'Degraded';
    case 'Progressing': return 'Progressing';
    case 'Suspended': return 'Suspended';
    default: return 'Unknown';
  }
}

function mapSyncStatus(raw: string | undefined): SyncStatusCode {
  switch (raw) {
    case 'Synced': return 'Synced';
    case 'OutOfSync': return 'OutOfSync';
    default: return 'Unknown';
  }
}

export class QspClient {
  private token: string | undefined;

  constructor() {
    this.token = process.env.QSP_CD_TOKEN;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getApplications(): Promise<ResourceNode[]> {
    try {
      const res = await fetch(`${QSP_CD_URL}/api/v1/applications`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Token JWT expirado o no autorizado');
        throw new Error(`Error de conectividad con Qsp CD / Floci (${res.status})`);
      }

      const data = (await res.json()) as { items?: QspApplication[] };
      const items = data.items || [];
      return items.map((app): ResourceNode => ({
        id: app.metadata.name,
        name: app.metadata.name,
        kind: 'Application',
        healthStatus: mapHealthStatus(app.status?.health?.status),
        syncStatus: mapSyncStatus(app.status?.sync?.status),
        children: app.status?.resources?.map((r): ResourceNode => ({
          id: `${r.kind}/${r.name}`,
          name: r.name,
          kind: (r.kind as ResourceNode['kind']) || 'Pod',
          healthStatus: 'Unknown',
          syncStatus: 'Unknown',
        })),
      }));
    } catch (err) {
      if (err instanceof Error && err.message.includes('Floci')) throw err;
      throw new Error('Error de conectividad con el emulador local Floci');
    }
  }

  async getApplicationStatus(id: string): Promise<ResourceNode | null> {
    try {
      const res = await fetch(`${QSP_CD_URL}/api/v1/applications/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Token JWT expirado o no autorizado');
        throw new Error(`Error de conectividad con Qsp CD / Floci (${res.status})`);
      }

      const app = (await res.json()) as QspApplication;
      return {
        id: app.metadata.name,
        name: app.metadata.name,
        kind: 'Application',
        healthStatus: mapHealthStatus(app.status?.health?.status),
        syncStatus: mapSyncStatus(app.status?.sync?.status),
        children: app.status?.resources?.map((r): ResourceNode => ({
          id: `${r.kind}/${r.name}`,
          name: r.name,
          kind: (r.kind as ResourceNode['kind']) || 'Pod',
          healthStatus: 'Unknown',
          syncStatus: 'Unknown',
        })),
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes('Floci')) throw err;
      throw new Error('Error de conectividad con el emulador local Floci');
    }
  }
}
