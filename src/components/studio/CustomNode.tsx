import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { X, Play } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

export const CustomNode = memo(({ data, id }: NodeProps) => {
  const { deleteNode, activeCategory, updateNode } = useWorkflowStore();
  const category = data.category?.[0] || activeCategory;
  
  const getCategoryColor = () => {
    switch (category) {
      case 'copy': return 'copy';
      case 'vfx': return 'vfx';
      case 'image': return 'image';
      default: return 'copy';
    }
  };
  
  const color = getCategoryColor();
  const isRunning = data.status === 'running';
  const isCompleted = data.status === 'completed';
  const isError = data.status === 'error';
  
  return (
    <div
      className={cn(
        'min-w-[280px] rounded-xl border-2 shadow-lg',
        'bg-node-bg backdrop-blur-sm',
        'transition-all duration-300 hover:shadow-xl',
        isRunning && 'animate-pulse',
        isCompleted && 'border-green-500/50',
        isError && 'border-red-500/50',
        !isRunning && !isCompleted && !isError && [
          'border-node-border',
          color === 'copy' && 'hover:border-copy-primary/50 hover:glow-copy',
          color === 'vfx' && 'hover:border-vfx-primary/50 hover:glow-vfx',
          color === 'image' && 'hover:border-image-primary/50 hover:glow-image',
        ]
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          'w-3 h-3 border-2 transition-all',
          color === 'copy' && 'bg-copy-primary border-copy-primary',
          color === 'vfx' && 'bg-vfx-primary border-vfx-primary',
          color === 'image' && 'bg-image-primary border-image-primary',
        )}
      />
      
      {/* Header */}
      <div className={cn(
        'px-4 py-3 rounded-t-xl border-b border-node-border',
        'flex items-center justify-between gap-2',
        'bg-gradient-to-r',
        color === 'copy' && 'from-copy-primary/10 to-transparent',
        color === 'vfx' && 'from-vfx-primary/10 to-transparent',
        color === 'image' && 'from-image-primary/10 to-transparent',
      )}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{data.icon}</span>
          <span className="font-semibold text-sm truncate">{data.label}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {isRunning && (
            <Play className="w-4 h-4 text-blue-500 animate-pulse" />
          )}
          {isCompleted && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          {isError && (
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
          
          <button
            onClick={() => deleteNode(id)}
            className="p-1 hover:bg-destructive/20 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {data.description && (
          <p className="text-xs text-muted-foreground">
            {data.description}
          </p>
        )}
        
        {/* Node-specific content */}
        {data.nodeType === 'textInput' && (
          <textarea
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-current"
            placeholder="Enter text..."
            rows={3}
            value={data.text || ''}
            onChange={(e) => updateNode(id, { text: e.target.value })}
          />
        )}
        
        {data.nodeType === 'smartSearch' && (
          <div className="space-y-2">
            <input
              type="text"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-current"
              placeholder="Search query..."
              value={data.query || ''}
              onChange={(e) => updateNode(id, { query: e.target.value })}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Threshold</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-input border border-border rounded text-xs"
                  value={data.threshold || 0.8}
                  min="0"
                  max="1"
                  step="0.1"
                  onChange={(e) => updateNode(id, { threshold: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Max Results</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-input border border-border rounded text-xs"
                  value={data.maxResults || 10}
                  min="1"
                  max="100"
                  onChange={(e) => updateNode(id, { maxResults: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {data.nodeType === 'hookGenerator' && (
          <div className="space-y-2">
            <textarea
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-current"
              placeholder="Input text to generate hooks from..."
              rows={3}
              value={data.inputText || ''}
              onChange={(e) => updateNode(id, { inputText: e.target.value })}
            />
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Frameworks</label>
              <div className="flex flex-wrap gap-1">
                {['AIDA', 'PAS', 'Curiosity', 'Problem-Solution'].map(fw => (
                  <button
                    key={fw}
                    onClick={() => {
                      const current = data.frameworks || [];
                      const updated = current.includes(fw)
                        ? current.filter((f: string) => f !== fw)
                        : [...current, fw];
                      updateNode(id, { frameworks: updated });
                    }}
                    className={cn(
                      'px-2 py-1 text-xs rounded transition-colors',
                      data.frameworks?.includes(fw) 
                        ? 'bg-copy-primary text-white' 
                        : 'bg-input hover:bg-input/80'
                    )}
                  >
                    {fw}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Count: {data.count || 5}</label>
              <input
                type="range"
                min="1"
                max="20"
                value={data.count || 5}
                onChange={(e) => updateNode(id, { count: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {data.nodeType === 'imageInput' && (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                  updateNode(id, { 
                    imageUrl: e.target?.result as string,
                    imageFile: file 
                  });
                };
                reader.readAsDataURL(file);
              }}
              className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            
            {data.imageUrl && (
              <img 
                src={data.imageUrl} 
                alt="Input" 
                className="w-full rounded-lg border border-border"
              />
            )}
          </div>
        )}

        {data.nodeType === 'deepAnalysis' && (
          <div className="space-y-2">
            {data.imageUrl && (
              <img 
                src={data.imageUrl} 
                alt="Analyzing" 
                className="w-full rounded-lg border border-border opacity-50"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Connect an image input node to analyze
            </p>
          </div>
        )}

        {data.nodeType === 'effectApplier' && (
          <div className="space-y-2">
            <select
              value={data.effect || ''}
              onChange={(e) => updateNode(id, { effect: e.target.value })}
              className="w-full px-2 py-1 bg-input border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-current"
            >
              <option value="">Select effect...</option>
              <option value="cinematic">Cinematic</option>
              <option value="vintage">Vintage Film</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="horror">Horror Atmosphere</option>
              <option value="romantic">Romantic Drama</option>
            </select>
            
            <div>
              <label className="text-xs text-muted-foreground">Intensity: {data.intensity || 50}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={data.intensity || 50}
                onChange={(e) => updateNode(id, { intensity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
        
        {data.nodeType === 'text2image' && (
          <div className="space-y-2">
            <textarea
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-current"
              placeholder="Describe the image..."
              rows={3}
              value={data.prompt || ''}
              onChange={(e) => updateNode(id, { prompt: e.target.value })}
            />
            <textarea
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-current"
              placeholder="Negative prompt (optional)..."
              rows={2}
              value={data.negativePrompt || ''}
              onChange={(e) => updateNode(id, { negativePrompt: e.target.value })}
            />
            <div className="flex gap-2 text-xs">
              <div className="flex-1">
                <label className="text-muted-foreground block mb-1">Width</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-input border border-border rounded text-xs"
                  value={data.width || 1024}
                  onChange={(e) => updateNode(id, { width: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex-1">
                <label className="text-muted-foreground block mb-1">Height</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-input border border-border rounded text-xs"
                  value={data.height || 1024}
                  onChange={(e) => updateNode(id, { height: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {data.nodeType === 'image2image' && (
          <div className="space-y-2">
            <textarea
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-current"
              placeholder="Transformation prompt..."
              rows={3}
              value={data.prompt || ''}
              onChange={(e) => updateNode(id, { prompt: e.target.value })}
            />
            
            <div>
              <label className="text-xs text-muted-foreground">Strength: {data.strength || 0.75}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={data.strength || 0.75}
                onChange={(e) => updateNode(id, { strength: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower = closer to original, Higher = more creative
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Output Display */}
      {data.output && (
        <div className="px-4 py-3 border-t border-node-border bg-node-bg/30">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Output:
          </div>
          
          {/* Text2Image Output */}
          {data.nodeType === 'text2image' && data.output.generatedUrl && (
            <div className="space-y-2">
              <img 
                src={data.output.generatedUrl} 
                alt="Generated" 
                className="w-full rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground truncate">
                {data.output.prompt}
              </p>
            </div>
          )}
          
          {/* Image2Image Output */}
          {data.nodeType === 'image2image' && data.output.generatedUrl && (
            <div className="space-y-2">
              <img 
                src={data.output.generatedUrl} 
                alt="Transformed" 
                className="w-full rounded-lg border border-border"
              />
            </div>
          )}
          
          {/* Hook Generator Output */}
          {data.nodeType === 'hookGenerator' && data.output.hooks && (
            <ul className="space-y-1 max-h-32 overflow-y-auto text-xs">
              {data.output.hooks.slice(0, 5).map((hook: any, i: number) => (
                <li key={i} className="p-2 bg-input rounded text-xs">
                  <span className="font-medium text-copy-primary">{hook.framework || 'Hook'}:</span> {hook.hook || hook}
                </li>
              ))}
            </ul>
          )}
          
          {/* Deep Analysis Output */}
          {data.nodeType === 'deepAnalysis' && data.output.analysis && (
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {data.output.analysis.style && (
                <div><strong className="text-vfx-primary">Style:</strong> {data.output.analysis.style}</div>
              )}
              {data.output.analysis.lighting && (
                <div><strong className="text-vfx-primary">Lighting:</strong> {data.output.analysis.lighting}</div>
              )}
              {data.output.analysis.mood && (
                <div><strong className="text-vfx-primary">Mood:</strong> {data.output.analysis.mood}</div>
              )}
            </div>
          )}
          
          {/* Smart Search Output */}
          {data.nodeType === 'smartSearch' && data.output.results && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.output.results.map((result: any, i: number) => (
                <div key={i} className="p-2 bg-input rounded text-xs">
                  <div className="font-medium">{result.text}</div>
                  <div className="text-muted-foreground text-xs">Score: {result.score.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Effect Applier Output */}
          {data.nodeType === 'effectApplier' && data.output.effect && (
            <div className="text-xs space-y-1">
              <div><strong>Effect:</strong> {data.output.effect}</div>
              <div><strong>Intensity:</strong> {data.output.intensity}%</div>
              <div className="text-muted-foreground text-xs">{data.output.effectDescription}</div>
            </div>
          )}
          
          {/* Generic Text Output */}
          {['textInput', 'imageInput'].includes(data.nodeType) && data.output.text && (
            <pre className="text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
              {data.output.text}
            </pre>
          )}
        </div>
      )}
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          'w-3 h-3 border-2 transition-all',
          color === 'copy' && 'bg-copy-primary border-copy-primary',
          color === 'vfx' && 'bg-vfx-primary border-vfx-primary',
          color === 'image' && 'bg-image-primary border-image-primary',
        )}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
