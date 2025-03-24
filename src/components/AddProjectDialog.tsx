
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Project } from '@/utils/projectService';

interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: { name: string; url: string }) => void;
  projectToEdit?: Project | null;
  onUpdateProject?: (id: string, updates: Partial<Pick<Project, 'name' | 'url'>>) => void;
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ 
  isOpen, 
  onClose, 
  onAddProject,
  projectToEdit,
  onUpdateProject
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isEditMode = !!projectToEdit;
  
  // Reset form when dialog opens/closes or when editing a project
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setName(projectToEdit.name);
        setUrl(projectToEdit.url);
      } else {
        setName('');
        setUrl('');
      }
    }
  }, [isOpen, projectToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Basic validation
      if (!name.trim() || !url.trim()) {
        toast({
          title: "Validation error",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
        return;
      }
      
      // URL validation and formatting
      let formattedUrl = url.trim();
      
      // Add https:// if protocol is missing
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      
      try {
        new URL(formattedUrl);
      } catch (e) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL.",
          variant: "destructive",
        });
        return;
      }
      
      if (isEditMode && projectToEdit && onUpdateProject) {
        onUpdateProject(projectToEdit.id, { name: name.trim(), url: formattedUrl });
      } else {
        onAddProject({ name: name.trim(), url: formattedUrl });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the project.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Project' : 'Add Project'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update your project details below.'
                : 'Add a new project to be automatically pinged.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Project"
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="url">Project URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://my-project.vercel.app"
              />
              <p className="text-xs text-muted-foreground">
                The URL to ping. Make sure it's the full URL including https://.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing || !name.trim() || !url.trim()}
            >
              {isProcessing 
                ? isEditMode ? 'Updating...' : 'Adding...' 
                : isEditMode ? 'Update Project' : 'Add Project'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
