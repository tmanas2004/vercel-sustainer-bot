
import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/utils/projectService';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  MoreVertical, 
  Pencil, 
  RefreshCw, 
  Trash2 
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onPing: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

const StatusIndicator: React.FC<{ status: Project['status'] }> = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500 animate-pulse-subtle',
    error: 'bg-red-500'
  };

  const statusLabel = {
    active: 'Active',
    pending: 'Pending',
    error: 'Error'
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "inline-block w-2 h-2 rounded-full",
        statusStyles[status]
      )} />
      <span className="text-xs font-medium">{statusLabel[status]}</span>
    </div>
  );
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPing, onEdit, onRemove }) => {
  const [isPinging, setIsPinging] = useState(false);
  
  const handlePing = async () => {
    setIsPinging(true);
    await onPing(project.id);
    setIsPinging(false);
  };
  
  const handleOpenUrl = () => {
    try {
      window.open(project.url, '_blank');
    } catch (error) {
      toast({
        title: "Error opening URL",
        description: "The URL couldn't be opened. Please check if it's valid.",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  
  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Overdue';
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `In ${diffInDays} days`;
    
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? 'In 1 week' : `In ${weeks} weeks`;
  };

  return (
    <Card className="relative w-full overflow-hidden border bg-card transition-all duration-300 animate-slide-up">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold leading-none">
            {project.name}
          </CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleOpenUrl} className="cursor-pointer">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Visit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(project.id)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onRemove(project.id)}
                className="text-destructive cursor-pointer focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription className="mt-2 text-xs truncate max-w-full" title={project.url}>
          {project.url}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-3">
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              <span>Last ping:</span>
            </div>
            <span className="font-medium">
              {formatDate(project.lastPinged)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-3.5 w-3.5" />
              <span>Next ping:</span>
            </div>
            <span className="font-medium">
              {formatRelativeDate(project.nextPing)}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <StatusIndicator status={project.status} />
        
        <Button 
          onClick={handlePing} 
          disabled={isPinging || project.status === 'pending'} 
          size="sm"
          variant="outline"
          className="h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isPinging ? 'animate-spin' : ''}`} />
          Ping Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
