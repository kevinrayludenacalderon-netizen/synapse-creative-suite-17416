import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export const Console = () => {
  const { executionLog, clearLog } = useWorkflowStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-sm border-t border-card-border',
        'transition-all duration-300',
        isCollapsed ? 'h-12' : 'h-48'
      )}
    >
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-card-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Console</span>
          <span className="text-xs text-muted-foreground">
            {executionLog.length} entries
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={clearLog}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Clear console"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {/* Log Content */}
      {!isCollapsed && (
        <div className="h-[calc(100%-3rem)] overflow-y-auto p-4 space-y-1 font-mono text-xs">
          {executionLog.length === 0 ? (
            <div className="text-muted-foreground italic">
              Console is empty. Execute a workflow to see logs.
            </div>
          ) : (
            executionLog.map((log, index) => (
              <div
                key={index}
                className={cn(
                  'py-1 animate-fade-in',
                  log.includes('❌') && 'text-red-400',
                  log.includes('✅') && 'text-green-400',
                  log.includes('🚀') && 'text-blue-400',
                  log.includes('💾') && 'text-purple-400',
                  log.includes('📂') && 'text-yellow-400',
                )}
              >
                {log}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
