'use client';

import { useEffect, useState } from 'react';
import QspResourceTree from '@/components/QspResourceTree';
import FlociOfflineBanner from '@/components/FlociOfflineBanner';
import type { ResourceNode } from '@/services/qspClient';
import { KeyRound, RefreshCw } from 'lucide-react';

const demoData: ResourceNode[] = [
  {
    id: 'dataspace-demo',
    name: 'dataspace-demo',
    kind: 'Application',
    healthStatus: 'Healthy',
    syncStatus: 'Synced',
    age: '3d',
    children: [
      {
        id: 'gvc/dataspace-demo',
        name: 'gvc datos',
        kind: 'GVC',
        healthStatus: 'Healthy',
        syncStatus: 'Synced',
        age: '3d',
        children: [
          {
            id: 'Deployment/web',
            name: 'web deploy',
            kind: 'Deployment',
            healthStatus: 'Progressing',
            syncStatus: 'Synced',
            age: '12h',
            children: [
              {
                id: 'Service/web',
                name: 'web service',
                kind: 'Service',
                healthStatus: 'Healthy',
                syncStatus: 'Synced',
                age: '12h',
                children: [
                  {
                    id: 'Pod/web-abc',
                    name: 'web-abc',
                    kind: 'Pod',
                    healthStatus: 'Healthy',
                    syncStatus: 'Synced',
                    age: '2h',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  const [nodes, setNodes] = useState<ResourceNode[]>(demoData);
  const [loading, setLoading] = useState(true);
  const [flociOffline, setFlociOffline] = useState(false);
  const [jwtExpired, setJwtExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/qsp/applications');
        if (res.status === 401) {
          if (!cancelled) setJwtExpired(true);
          return;
        }
        if (!res.ok) {
          if (!cancelled) setFlociOffline(true);
          return;
        }
        const payload = (await res.json()) as { data?: ResourceNode[] };
        if (!cancelled && payload.data) {
          setNodes(payload.data);
          setFlociOffline(false);
          setJwtExpired(false);
        }
      } catch {
        if (!cancelled) setFlociOffline(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Qsp CD Dashboard</h1>
        <p className="text-slate-500 text-sm">Floci Cloud — Visualización jerárquica de aplicaciones</p>
      </header>

      <section className="max-w-5xl mx-auto space-y-4">
        {flociOffline && <FlociOfflineBanner />}

        {jwtExpired && (
          <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-sm flex items-center gap-3">
            <KeyRound className="w-5 h-5 shrink-0" />
            <div>
              <h2 className="font-bold text-sm">Token JWT expirado o no autorizado</h2>
              <p className="text-xs text-amber-700">Renueve el token local y recargue la página.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold underline hover:text-amber-900"
              >
                <RefreshCw className="w-3 h-3" /> Reintentar
              </button>
            </div>
          </div>
        )}

        {loading && !nodes.length && (
          <div className="text-sm text-slate-400">Cargando aplicaciones de Qsp CD...</div>
        )}

        <div className="space-y-2" data-testid="qsp-resource-tree">
          {nodes.map((n) => (
            <QspResourceTree key={n.id} node={n} />
          ))}
        </div>
      </section>
    </main>
  );
}
