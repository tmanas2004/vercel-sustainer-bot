
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface HeaderProps {
  projectCount: number;
  onAddProject: () => void;
  onPingAllProjects: () => void;
  isPinging?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  projectCount, 
  onAddProject, 
  onPingAllProjects,
  isPinging = false 
}) => {
  return (
    <header className="w-full animate-fade-in">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight">
              Vercel Sustainer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Keep your Vercel projects alive by pinging them weekly
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {projectCount > 0 && (
              <Button 
                onClick={onPingAllProjects} 
                variant="outline" 
                size="sm"
                disabled={isPinging}
                className="font-medium transition-all duration-200 flex items-center"
              >
                <RefreshCw 
                  className={`h-4 w-4 mr-2 ${isPinging ? 'animate-spin' : ''}`} 
                />
                Ping All ({projectCount})
              </Button>
            )}
            
            <Button 
              onClick={onAddProject} 
              size="sm"
              className="font-medium transition-all duration-200 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
