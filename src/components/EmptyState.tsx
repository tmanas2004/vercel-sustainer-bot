
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  onAddProject: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddProject }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="glass-panel rounded-xl p-8 max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <PlusCircle className="h-8 w-8 text-primary" />
        </div>
        
        <h2 className="text-xl font-semibold">No projects added yet</h2>
        
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          Add your first Vercel project to keep it alive with automatic weekly pings.
        </p>
        
        <Button 
          onClick={onAddProject} 
          className="mt-6"
        >
          Add Your First Project
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
