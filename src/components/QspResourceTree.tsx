'use client';

import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  PauseCircle,
  GitBranch,
  Box,
  Server,
  Terminal,
  RefreshCcw,
  CircleDot,
} from 'lucide-react';
import type { ResourceNode } from '@/services/qspClient';

function hasDegraded(node: ResourceNode): boolean {
  if (node.healthStatus === 'Degraded') return true;
  if (!node.children) return false;
  return node.children.some(hasDegraded);
}

function HealthIcon({ status }: { status: ResourceNode['healthStatus'] }) {
  switch (status) {
    case 'Healthy':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'Progressing':
      return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
    case 'Degraded':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'Suspended':
      return <PauseCircle className="w-4 h-4 text-slate-500" />;
    default:
      return <CircleDot className="w-4 h-4 text-gray-400" />;
  }
}

function SyncBadge({ status }: { status: ResourceNode['syncStatus'] }) {
  const colors =
    status === 'Synced'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'OutOfSync'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors}`}>
      {status}
    </span>
  );
}

export default function QspResourceTree({
  node,
  depth = 0,
}: {
  node: ResourceNode;
  depth?: number;
}) {
  const degradedPropagated = hasDegraded(node);
  const isRoot = depth === 0;

  const borderClass = degradedPropagated
    ? 'border-[#EF4444] bg-red-50/40'
    : isRoot
    ? 'border-blue-200 bg-white'
    : 'border-gray-200 bg-gray-50/40';

  const textClass = degradedPropagated ? 'text-[#EF4444]' : 'text-slate-800';

  return (
    <div className={`rounded-lg shadow-sm border p-3 mb-2 transition-colors ${borderClass}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100">
          {node.kind === 'Application' && <Server className="w-4 h-4 text-blue-600" />}
          {node.kind === 'GVC' && <Box className="w-4 h-4 text-violet-600" />}
          {node.kind === 'Deployment' && <RefreshCcw className="w-4 h-4 text-indigo-600" />}
          {node.kind === 'Service' && <GitBranch className="w-4 h-4 text-sky-600" />}
          {node.kind === 'Pod' && <Terminal className="w-4 h-4 text-rose-600" />}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <h3 className={`font-semibold text-sm truncate ${textClass}`} title={node.name}>
            {node.name}
          </h3>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
            {node.kind}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <SyncBadge status={node.syncStatus} />
          <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
            <HealthIcon status={node.healthStatus} />
            <span className={node.healthStatus === 'Degraded' ? 'text-[#EF4444] font-bold' : ''}>
              {node.healthStatus}
            </span>
          </div>
          {node.age && (
            <span className="text-xs text-slate-400">{node.age}</span>
          )}
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="ml-4 mt-2 pl-3 border-l border-gray-200/60 space-y-2">
          {node.children.map((child) => (
            <QspResourceTree key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
