import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  BackgroundVariant,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { CustomNode } from './CustomNode';
import { cn } from '@/lib/utils';

const nodeTypes = {
  custom: CustomNode,
};

export const Canvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    activeCategory,
  } = useWorkflowStore();
  
  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };
  
  const onDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    
    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (!nodeType) return;
    
    const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };
    
    const { addNode } = useWorkflowStore.getState();
    const { NODE_TYPES } = await import('@/types/nodes');
    const definition = NODE_TYPES[nodeType];
    
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        ...definition.defaultData,
        label: definition.label,
        category: definition.category,
        icon: definition.icon,
        description: definition.description,
        nodeType: nodeType,
      },
    };
    
    addNode(newNode);
  };
  
  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-canvas-bg"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { 
            strokeWidth: 2,
          },
        }}
        connectionLineStyle={{ strokeWidth: 2 }}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="hsl(var(--canvas-grid))"
        />
        
        <Controls 
          className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg"
        />
        
        <MiniMap
          className={cn(
            "bg-card/80 backdrop-blur-sm border border-card-border rounded-lg",
            "shadow-lg"
          )}
          nodeColor={(node) => {
            const category = node.data.category?.[0];
            if (category === 'copy') return 'hsl(var(--copy-primary))';
            if (category === 'vfx') return 'hsl(var(--vfx-primary))';
            if (category === 'image') return 'hsl(var(--image-primary))';
            return 'hsl(var(--muted))';
          }}
        />
        
        <Panel position="top-right" className="space-y-2">
          <div className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "bg-card/80 backdrop-blur-sm border border-card-border",
            "shadow-lg"
          )}>
            {nodes.length} nodes • {edges.length} connections
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
