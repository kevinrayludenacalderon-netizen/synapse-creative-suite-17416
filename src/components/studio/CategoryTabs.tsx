import { Category, useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { FileText, Sparkles, Image } from 'lucide-react';

const CATEGORIES = [
  { 
    id: 'copy' as Category, 
    label: 'Copy Research', 
    icon: FileText,
    color: 'copy',
    description: 'Content generation & analysis'
  },
  { 
    id: 'vfx' as Category, 
    label: 'VFX & Effects', 
    icon: Sparkles,
    color: 'vfx',
    description: 'Visual effects & editing'
  },
  { 
    id: 'image' as Category, 
    label: 'Image Generation', 
    icon: Image,
    color: 'image',
    description: 'AI image creation'
  },
];

export const CategoryTabs = () => {
  const { activeCategory, setActiveCategory } = useWorkflowStore();
  
  return (
    <div className="flex gap-2 p-2 bg-card/50 backdrop-blur-sm rounded-lg border border-card-border">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300',
              'border border-transparent hover:border-current',
              'group relative overflow-hidden',
              isActive ? [
                'bg-card shadow-lg',
                category.color === 'copy' && 'text-copy-primary border-copy-primary/50 glow-copy',
                category.color === 'vfx' && 'text-vfx-primary border-vfx-primary/50 glow-vfx',
                category.color === 'image' && 'text-image-primary border-image-primary/50 glow-image',
              ] : [
                'text-muted-foreground hover:text-foreground',
                'hover:bg-card/50'
              ]
            )}
          >
            {isActive && (
              <div 
                className={cn(
                  'absolute inset-0 opacity-10',
                  category.color === 'copy' && 'bg-copy-primary',
                  category.color === 'vfx' && 'bg-vfx-primary',
                  category.color === 'image' && 'bg-image-primary',
                )}
              />
            )}
            
            <Icon className={cn(
              'w-4 h-4 transition-transform duration-300',
              isActive && 'scale-110'
            )} />
            
            <div className="flex flex-col items-start relative z-10">
              <span className="text-sm font-semibold">{category.label}</span>
              <span className={cn(
                'text-xs transition-opacity duration-300',
                isActive ? 'opacity-70' : 'opacity-50'
              )}>
                {category.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
