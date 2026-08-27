import React from 'react';
import ReactDOM from 'react-dom/client';
import QspResourceTree from './components/QspResourceTree';

const demoData = [
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
                  { id: 'Pod/web-abc', name: 'web-abc', kind: 'Pod', healthStatus: 'Healthy', syncStatus: 'Synced', age: '2h' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Qsp CD Dashboard</h1>
        <p className="text-slate-500 text-sm">Floci Cloud — Visualización jerárquica de aplicaciones</p>
      </header>
      <section className="max-w-5xl mx-auto space-y-2">
        {demoData.map((n) => (
          <QspResourceTree key={n.id} node={n} />
        ))}
      </section>
    </div>
  </React.StrictMode>
);
