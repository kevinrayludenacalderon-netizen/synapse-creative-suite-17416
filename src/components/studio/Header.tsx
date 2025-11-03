import { useWorkflowStore } from '@/store/workflowStore';
import { CategoryTabs } from './CategoryTabs';
import { Button } from '@/components/ui/button';
import { Play, Save, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { 
    workflowName, 
    setWorkflowName, 
    executeWorkflow, 
    saveWorkflow, 
    isExecuting,
    activeCategory 
  } = useWorkflowStore();
  
  return (
    <header className="h-20 border-b border-card-border bg-card/80 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Left: Logo & Workflow Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-lg bg-gradient-to-br shadow-lg',
            activeCategory === 'copy' && 'from-copy-primary to-copy-muted',
            activeCategory === 'vfx' && 'from-vfx-primary to-vfx-muted',
            activeCategory === 'image' && 'from-image-primary to-image-muted',
          )}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Creative AI Studio</h1>
            <p className="text-xs text-muted-foreground">Visual Node Editor</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-border" />
        
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-current max-w-xs"
          placeholder="Workflow name..."
        />
      </div>
      
      {/* Center: Category Tabs */}
      <CategoryTabs />
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={saveWorkflow}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        
        <Button
          onClick={executeWorkflow}
          disabled={isExecuting}
          size="sm"
          className={cn(
            'gap-2 transition-all',
            activeCategory === 'copy' && 'bg-copy-primary hover:bg-copy-primary/90',
            activeCategory === 'vfx' && 'bg-vfx-primary hover:bg-vfx-primary/90',
            activeCategory === 'image' && 'bg-image-primary hover:bg-image-primary/90',
          )}
        >
          <Play className={cn('w-4 h-4', isExecuting && 'animate-pulse')} />
          {isExecuting ? 'Running...' : 'Run Workflow'}
        </Button>
      </div>
    </header>
  );
};
