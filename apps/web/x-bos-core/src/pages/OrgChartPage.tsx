import { useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useXbosStore } from '@/store/useXbosStore';
import { buildOrgFlowGraph } from '@/utils/orgFlowLayout';
import { OrgCardNode } from '@/components/flow/OrgCardNode';

const nodeTypes = { orgCard: OrgCardNode };

function OrgChartInner() {
  const orgUnits = useXbosStore((s) => s.orgUnits);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildOrgFlowGraph(orgUnits),
    [orgUnits]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: n, edges: e } = buildOrgFlowGraph(orgUnits);
    setNodes(n);
    setEdges(e);
  }, [orgUnits, setNodes, setEdges]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Lưu vị trí hiển thị sau khi kéo thả. Thay đổi quan hệ cha–con thực hiện tại trang Đơn vị.
      setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n)));
    },
    [setNodes]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-xevn-text">Sơ đồ tổ chức</h1>
        <p className="mt-1 text-sm text-xevn-muted">
          React Flow — kéo thả nút để sắp xếp giao diện (dữ liệu cây lưu trong store).
        </p>
      </div>
      <div className="h-[640px] w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 shadow-glass backdrop-blur-sm">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.4}
          maxZoom={1.4}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="#e2e8f0" />
          <Controls className="!rounded-xl !border-black/10 !shadow-md" />
          <MiniMap
            className="!rounded-xl !border-black/10"
            maskColor="rgba(30,64,175,0.08)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export function OrgChartPage() {
  return (
    <ReactFlowProvider>
      <OrgChartInner />
    </ReactFlowProvider>
  );
}
