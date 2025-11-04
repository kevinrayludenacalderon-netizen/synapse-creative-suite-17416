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
              placeholder="Input text to generate hooks from (or connect Text Input node)..."
              rows={3}
              value={data.inputText || ''}
              onChange={(e) => updateNode(id, { inputText: e.target.value })}
            />
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground block">Hook Type (Hormozi Framework)</label>
              <select
                value={data.hookType || 'desire'}
                onChange={(e) => updateNode(id, { hookType: e.target.value })}
                className="w-full px-2 py-1 bg-input border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-current"
              >
                <option value="desire">💎 Desire - Promise transformation</option>
                <option value="frustration">😤 Frustration - Expose problem</option>
                <option value="discovery">🔍 Discovery - Reveal insight</option>
                <option value="story">📖 Story - Share experience</option>
                <option value="result">📊 Result/Proof - Show evidence</option>
              </select>
            </div>
            
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

        {data.nodeType === 'brandConfig' && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Industria</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-current"
                placeholder="e.g., Inmobiliaria"
                value={data.industria || ''}
                onChange={(e) => updateNode(id, { industria: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Audiencia Objetivo</label>
              <textarea
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-current"
                placeholder="e.g., Jóvenes profesionales..."
                rows={2}
                value={data.audiencia_objetivo || ''}
                onChange={(e) => updateNode(id, { audiencia_objetivo: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Palabras Prohibidas (separadas por coma)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-current"
                placeholder="explotar, boom, estallar"
                value={data.palabras_prohibidas?.join(', ') || ''}
                onChange={(e) => updateNode(id, { palabras_prohibidas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Límite Hook (palabras)</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-input border border-border rounded text-xs"
                  value={data.limites?.hook || 12}
                  onChange={(e) => updateNode(id, { limites: { ...data.limites, hook: parseInt(e.target.value) } })}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Límite Script (palabras)</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-input border border-border rounded text-xs"
                  value={data.limites?.script || 250}
                  onChange={(e) => updateNode(id, { limites: { ...data.limites, script: parseInt(e.target.value) } })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Conceptos Clave (separados por coma)</label>
              <textarea
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-current"
                placeholder="Análisis de Competencia, Gap analysis"
                rows={2}
                value={data.conceptos_clave?.join(', ') || ''}
                onChange={(e) => updateNode(id, { conceptos_clave: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
          </div>
        )}

        {data.nodeType === 'hookValidator' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Connect a Hook Generator and Brand Config to validate hooks
            </p>
            <div className="text-xs">
              <div className="font-medium text-copy-primary mb-1">Validation Rules:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Word limit check</li>
                <li>✓ Forbidden words detection</li>
                <li>✓ Generic CTA detection</li>
                <li>✓ Auto-correction (score &lt; 70)</li>
                <li>✓ Scoring (0-100)</li>
              </ul>
            </div>
          </div>
        )}

        {data.nodeType === 'bodyGenerator' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Connect validated hooks and brief to generate body content
            </p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Max Words</label>
              <input
                type="number"
                className="w-full px-2 py-1 bg-input border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-current"
                value={data.maxWords || 250}
                min="200"
                max="255"
                onChange={(e) => updateNode(id, { maxWords: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 200-255 words</p>
            </div>
          </div>
        )}

        {data.nodeType === 'ctaGenerator' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Connect body content to generate a soft, specific CTA
            </p>
            <div className="text-xs">
              <div className="font-medium text-copy-primary mb-1">CTA Guidelines:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Natural and conversational</li>
                <li>✓ Specific and actionable</li>
                <li>✓ No generic phrases</li>
                <li>✓ 1-2 sentences max</li>
              </ul>
            </div>
          </div>
        )}

        {data.nodeType === 'copyAssembler' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Connect hook, body, and CTA to assemble final copy
            </p>
            <div className="text-xs">
              <div className="font-medium text-copy-primary mb-1">Final Structure:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>1. Hook (Attention grabber)</li>
                <li>2. Body (Development + Insight)</li>
                <li>3. CTA (Soft call-to-action)</li>
              </ul>
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
          
          {/* Brand Config Output */}
          {data.nodeType === 'brandConfig' && data.output.brandConfig && (
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              <div><strong className="text-copy-primary">Industria:</strong> {data.output.brandConfig.industria}</div>
              <div><strong className="text-copy-primary">Límites:</strong> Hook: {data.output.brandConfig.limites.hook}, Script: {data.output.brandConfig.limites.script}</div>
            </div>
          )}
          
          {/* Hook Validator Output */}
          {data.nodeType === 'hookValidator' && data.output.validatedHooks && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="text-xs font-medium text-copy-primary">
                {data.output.passedHooks}/{data.output.totalHooks} hooks passed
              </div>
              {data.output.validatedHooks.slice(0, 3).map((result: any, i: number) => (
                <div key={i} className={cn(
                  "p-2 rounded text-xs",
                  result.passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Score: {result.score}/100</span>
                    {result.passed ? '✅' : '❌'}
                  </div>
                  <div className="text-muted-foreground">
                    {result.corrected !== result.original ? result.corrected : result.original}
                  </div>
                  {result.issues && (
                    <div className="mt-1 text-xs opacity-70">
                      {result.issues.exceedsLimit && '⚠️ Límite excedido '}
                      {result.issues.hasForbiddenWords && '⚠️ Palabras prohibidas '}
                      {result.issues.hasGenericCTA && '⚠️ CTA genérico'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Body Generator Output */}
          {data.nodeType === 'bodyGenerator' && data.output.generatedBody && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="text-xs font-medium text-copy-primary">
                Generated Body ({data.output.wordCount} words)
              </div>
              <div className="p-2 bg-input rounded text-xs whitespace-pre-wrap text-muted-foreground">
                {data.output.generatedBody}
              </div>
            </div>
          )}

          {/* CTA Generator Output */}
          {data.nodeType === 'ctaGenerator' && data.output.generatedCTA && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-copy-primary">Generated CTA</div>
              <div className="p-2 bg-input rounded text-xs text-muted-foreground">
                {data.output.generatedCTA}
              </div>
            </div>
          )}

          {/* Copy Assembler Output */}
          {data.nodeType === 'copyAssembler' && data.output.finalCopy && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-copy-primary">Final Copy</span>
                <span className="text-muted-foreground">{data.output.totalWords} words</span>
              </div>
              <div className="p-3 bg-input rounded text-xs whitespace-pre-wrap text-muted-foreground border border-border">
                {data.output.finalCopy}
              </div>
              <div className="flex flex-wrap gap-1">
                {data.output.structure.hasHook && (
                  <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">✓ Hook</span>
                )}
                {data.output.structure.hasBody && (
                  <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">✓ Body</span>
                )}
                {data.output.structure.hasCTA && (
                  <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">✓ CTA</span>
                )}
              </div>
            </div>
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
