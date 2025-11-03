import { Category } from '@/store/workflowStore';

export interface BaseNodeData {
  label: string;
  category: Category[];
  description?: string;
  icon?: string;
  status?: 'idle' | 'running' | 'completed' | 'error';
}

// Copy Research Node Types
export interface TextInputNodeData extends BaseNodeData {
  text: string;
}

export interface SmartSearchNodeData extends BaseNodeData {
  query: string;
  threshold: number;
  maxResults: number;
}

export interface HookGeneratorNodeData extends BaseNodeData {
  inputText: string;
  frameworks: string[];
  count: number;
}

// VFX Node Types
export interface ImageInputNodeData extends BaseNodeData {
  imageUrl?: string;
  imageFile?: File;
}

export interface DeepAnalysisNodeData extends BaseNodeData {
  imageUrl?: string;
  analysis?: {
    style: string;
    lighting: string;
    composition: string;
    mood: string;
  };
}

export interface EffectApplierNodeData extends BaseNodeData {
  effect: string;
  intensity: number;
  params?: Record<string, any>;
}

// Image Generation Node Types
export interface Text2ImageNodeData extends BaseNodeData {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  generatedUrl?: string;
}

export interface Image2ImageNodeData extends BaseNodeData {
  prompt: string;
  inputImage?: string;
  strength: number;
  generatedUrl?: string;
}

export type NodeData = 
  | TextInputNodeData
  | SmartSearchNodeData
  | HookGeneratorNodeData
  | ImageInputNodeData
  | DeepAnalysisNodeData
  | EffectApplierNodeData
  | Text2ImageNodeData
  | Image2ImageNodeData;

// Node Type Definitions
export interface NodeTypeDefinition {
  type: string;
  label: string;
  category: Category[];
  icon: string;
  description: string;
  color: string;
  defaultData: Partial<NodeData>;
}

export const NODE_TYPES: Record<string, NodeTypeDefinition> = {
  // Copy Research Nodes
  textInput: {
    type: 'textInput',
    label: 'Text Input',
    category: ['copy'],
    icon: '📝',
    description: 'Input text for processing',
    color: 'hsl(var(--copy-primary))',
    defaultData: { text: '' },
  },
  smartSearch: {
    type: 'smartSearch',
    label: 'Smart Search',
    category: ['copy'],
    icon: '🔍',
    description: 'Semantic search with AI',
    color: 'hsl(var(--copy-primary))',
    defaultData: { query: '', threshold: 0.8, maxResults: 10 },
  },
  hookGenerator: {
    type: 'hookGenerator',
    label: 'Hook Generator',
    category: ['copy'],
    icon: '🎯',
    description: 'Generate attention-grabbing hooks',
    color: 'hsl(var(--copy-primary))',
    defaultData: { inputText: '', frameworks: ['AIDA', 'PAS'], count: 5 },
  },
  
  // VFX Nodes
  imageInput: {
    type: 'imageInput',
    label: 'Image Input',
    category: ['vfx', 'image'],
    icon: '🖼️',
    description: 'Upload or input image',
    color: 'hsl(var(--vfx-primary))',
    defaultData: {},
  },
  deepAnalysis: {
    type: 'deepAnalysis',
    label: 'Deep Analysis',
    category: ['vfx'],
    icon: '🔬',
    description: 'AI-powered image analysis',
    color: 'hsl(var(--vfx-primary))',
    defaultData: {},
  },
  effectApplier: {
    type: 'effectApplier',
    label: 'Effect Applier',
    category: ['vfx'],
    icon: '✨',
    description: 'Apply visual effects',
    color: 'hsl(var(--vfx-primary))',
    defaultData: { effect: '', intensity: 50 },
  },
  
  // Image Generation Nodes
  text2image: {
    type: 'text2image',
    label: 'Text to Image',
    category: ['image'],
    icon: '🎨',
    description: 'Generate images from text',
    color: 'hsl(var(--image-primary))',
    defaultData: { prompt: '', width: 1024, height: 1024, steps: 30 },
  },
  image2image: {
    type: 'image2image',
    label: 'Image to Image',
    category: ['image'],
    icon: '🔄',
    description: 'Transform images with AI',
    color: 'hsl(var(--image-primary))',
    defaultData: { prompt: '', strength: 0.75 },
  },
};
