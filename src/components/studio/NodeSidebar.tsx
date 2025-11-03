import { useWorkflowStore } from '@/store/workflowStore';
import { NODE_TYPES } from '@/types/nodes';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const NodeSidebar = () => {
  const { activeCategory, isSidebarCollapsed, toggleSidebar, addNode } = useWorkflowStore();
  
  const availableNodes = Object.values(NODE_TYPES).filter((nodeType) =>
    nodeType.category.includes(activeCategory)
  );
  
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const handleAddNode = (nodeType: string) => {
    const definition = NODE_TYPES[nodeType];
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
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
    <div
      className={cn(
        'relative h-full bg-card/80 backdrop-blur-sm border-r border-card-border',
        'transition-all duration-300 overflow-hidden',
        isSidebarCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-50 p-1 rounded-full bg-card border border-card-border shadow-lg hover:bg-card/80 transition-colors"
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
      
      {!isSidebarCollapsed && (
        <div className="p-4 space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h2 className="text-lg font-bold mb-1">Node Library</h2>
            <p className="text-xs text-muted-foreground">
              Drag nodes to canvas or click to add
            </p>
          </div>
          
          {/* Node List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Available Nodes
            </div>
            
            {availableNodes.map((node) => (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                onClick={() => handleAddNode(node.type)}
                className={cn(
                  'p-3 rounded-lg border cursor-move',
                  'bg-node-bg border-node-border hover:border-current',
                  'transition-all duration-300 group',
                  'hover:shadow-lg hover:scale-102',
                  activeCategory === 'copy' && 'hover:border-copy-primary hover:glow-copy',
                  activeCategory === 'vfx' && 'hover:border-vfx-primary hover:glow-vfx',
                  activeCategory === 'image' && 'hover:border-image-primary hover:glow-image',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'text-2xl p-2 rounded-lg',
                    'bg-gradient-to-br transition-colors',
                    activeCategory === 'copy' && 'from-copy-primary/20 to-copy-primary/5',
                    activeCategory === 'vfx' && 'from-vfx-primary/20 to-vfx-primary/5',
                    activeCategory === 'image' && 'from-image-primary/20 to-image-primary/5',
                  )}>
                    {node.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {node.label}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isSidebarCollapsed && (
        <div className="p-2 space-y-2 animate-fade-in">
          {availableNodes.map((node) => (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              onClick={() => handleAddNode(node.type)}
              className={cn(
                'p-2 rounded-lg cursor-move text-2xl',
                'bg-node-bg border border-node-border',
                'hover:border-current transition-all duration-300',
                'flex items-center justify-center',
                activeCategory === 'copy' && 'hover:border-copy-primary',
                activeCategory === 'vfx' && 'hover:border-vfx-primary',
                activeCategory === 'image' && 'hover:border-image-primary',
              )}
              title={node.label}
            >
              {node.icon}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
