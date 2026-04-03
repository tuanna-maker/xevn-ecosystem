import { Handle, Position, type NodeProps } from '@xyflow/react';

export function OrgCardNode({ data }: NodeProps) {
  const d = data as { label: string; code: string; type: string };
  return (
    <div className="min-w-[168px] rounded-2xl border border-black/[0.07] bg-white/95 px-4 py-3 shadow-glass backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="text-[10px] font-semibold uppercase tracking-wider text-xevn-muted">{d.type}</div>
      <div className="mt-1 text-sm font-semibold text-xevn-text leading-tight">{d.label}</div>
      <div className="mt-0.5 font-mono text-xs text-xevn-muted">{d.code}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}
