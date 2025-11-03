import { create } from 'zustand';
import { Node, Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';

export type Category = 'copy' | 'vfx' | 'image';

export interface WorkflowState {
  // Category
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
  
  // Nodes and Edges
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  
  // Connections
  onConnect: (connection: any) => void;
  
  // Workflow Execution
  isExecuting: boolean;
  executionLog: string[];
  executeWorkflow: () => Promise<void>;
  addLog: (message: string) => void;
  clearLog: () => void;
  
  // Workflow Management
  workflowName: string;
  setWorkflowName: (name: string) => void;
  savedWorkflows: SavedWorkflow[];
  saveWorkflow: () => void;
  loadWorkflow: (id: string) => void;
  deleteWorkflow: (id: string) => void;
  
  // UI State
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  category: Category;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Category
  activeCategory: 'copy',
  setActiveCategory: (category) => set({ activeCategory: category }),
  
  // Nodes and Edges
  nodes: [],
  edges: [],
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },
  
  updateNode: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  
  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
    });
  },
  
  // Connections
  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      id: `e${connection.source}-${connection.target}`,
      type: 'smoothstep',
      animated: true,
    };
    set({ edges: [...get().edges, newEdge] });
  },
  
  // Workflow Execution
  isExecuting: false,
  executionLog: [],
  
  executeWorkflow: async () => {
    const { nodes, edges, addLog, updateNode } = get();
    
    set({ isExecuting: true, executionLog: [] });
    addLog('🚀 Starting workflow execution...');
    
    try {
      // Dynamic import to avoid circular dependencies
      const { 
        executeTextInput,
        executeSmartSearch, 
        executeHookGenerator,
        executeImageInput,
        executeDeepAnalysis,
        executeEffectApplier,
        executeText2Image,
        executeImage2Image 
      } = await import('../services/nodeExecutors');

      // Sort nodes topologically
      const sortedNodes = topologicalSort(nodes, edges);
      const resultsCache = new Map<string, any>();
      
      for (const node of sortedNodes) {
        updateNode(node.id, { status: 'running' });
        addLog(`▶️ Executing: ${node.data.label || node.type}`);
        
        try {
          // Get inputs from connected nodes
          const inputs: Record<string, any> = {};
          const incomingEdges = edges.filter((e) => e.target === node.id);
          incomingEdges.forEach((edge) => {
            const sourceResult = resultsCache.get(edge.source);
            if (sourceResult) {
              Object.assign(inputs, sourceResult.data);
            }
          });

          // Execute based on node type
          let result;
          const nodeType = node.data.nodeType || node.type;
          
          switch (nodeType) {
            case 'textInput':
              result = await executeTextInput(node.data);
              break;
            case 'smartSearch':
              result = await executeSmartSearch(node.data, inputs);
              break;
            case 'hookGenerator':
              result = await executeHookGenerator(node.data, inputs);
              break;
            case 'imageInput':
              result = await executeImageInput(node.data);
              break;
            case 'deepAnalysis':
              result = await executeDeepAnalysis(node.data, inputs);
              break;
            case 'effectApplier':
              result = await executeEffectApplier(node.data, inputs);
              break;
            case 'text2image':
              result = await executeText2Image(node.data);
              break;
            case 'image2image':
              result = await executeImage2Image(node.data, inputs);
              break;
            default:
              result = { success: true, data: { message: 'Node type not implemented' } };
          }

          if (result.success) {
            resultsCache.set(node.id, result);
            updateNode(node.id, { 
              status: 'completed', 
              output: result.data 
            });
            addLog(`✅ Completed: ${node.data.label || node.type}`);
          } else {
            throw new Error(result.error || 'Execution failed');
          }
        } catch (error) {
          updateNode(node.id, { status: 'error' });
          addLog(`❌ Error in ${node.data.label}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      }
      
      addLog('🎉 Workflow completed successfully!');
    } catch (error) {
      addLog(`❌ Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      set({ isExecuting: false });
    }
  },
  
  addLog: (message) => {
    set({ executionLog: [...get().executionLog, `[${new Date().toLocaleTimeString()}] ${message}`] });
  },
  
  clearLog: () => {
    set({ executionLog: [] });
  },
  
  // Workflow Management
  workflowName: 'Untitled Workflow',
  setWorkflowName: (name) => set({ workflowName: name }),
  
  savedWorkflows: typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('creative-ai-workflows') || '[]')
    : [],
  
  saveWorkflow: () => {
    const { nodes, edges, workflowName, activeCategory, savedWorkflows } = get();
    
    const workflow: SavedWorkflow = {
      id: Date.now().toString(),
      name: workflowName,
      category: activeCategory,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updated = [...savedWorkflows, workflow];
    set({ savedWorkflows: updated });
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('creative-ai-workflows', JSON.stringify(updated));
    }
    
    get().addLog(`💾 Workflow saved: ${workflowName}`);
  },
  
  loadWorkflow: (id) => {
    const workflow = get().savedWorkflows.find((w) => w.id === id);
    if (workflow) {
      set({
        nodes: JSON.parse(JSON.stringify(workflow.nodes)),
        edges: JSON.parse(JSON.stringify(workflow.edges)),
        workflowName: workflow.name,
        activeCategory: workflow.category,
      });
      get().addLog(`📂 Workflow loaded: ${workflow.name}`);
    }
  },
  
  deleteWorkflow: (id) => {
    const updated = get().savedWorkflows.filter((w) => w.id !== id);
    set({ savedWorkflows: updated });
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('creative-ai-workflows', JSON.stringify(updated));
    }
  },
  
  // UI State
  isSidebarCollapsed: false,
  toggleSidebar: () => set({ isSidebarCollapsed: !get().isSidebarCollapsed }),
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));

// Helper function for topological sort
function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const visited = new Set<string>();
  const result: Node[] = [];
  
  const visit = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    const incomingEdges = edges.filter((e) => e.target === nodeId);
    incomingEdges.forEach((edge) => visit(edge.source));
    
    const node = nodes.find((n) => n.id === nodeId);
    if (node) result.push(node);
  };
  
  nodes.forEach((node) => visit(node.id));
  
  return result;
}
