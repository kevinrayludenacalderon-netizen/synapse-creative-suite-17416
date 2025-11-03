import { ReactFlowProvider } from 'reactflow';
import { Header } from '@/components/studio/Header';
import { NodeSidebar } from '@/components/studio/NodeSidebar';
import { Canvas } from '@/components/studio/Canvas';
import { Console } from '@/components/studio/Console';

const Index = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <NodeSidebar />
        
        <div className="flex-1 flex flex-col">
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
          
          <Console />
        </div>
      </div>
    </div>
  );
};

export default Index;
