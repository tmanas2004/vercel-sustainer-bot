
import React, { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import EmptyState from '@/components/EmptyState';
import AddProjectDialog from '@/components/AddProjectDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Project } from '@/utils/projectService';

const Index = () => {
  const { 
    projects, 
    isLoading, 
    addProject, 
    removeProject, 
    editProject, 
    pingProject,
    pingAllProjects 
  } = useProjects();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Check for projects needing pings on initial load
  useEffect(() => {
    // This will be empty on first load, but will check LocalStorage
    const now = new Date();
    const hasProjectsNeedingPings = projects.some(p => p.nextPing < now);
    
    if (hasProjectsNeedingPings) {
      handlePingAllProjects();
    }
    
    // Register service worker for background operation
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
          console.error('Service worker registration failed:', error);
        });
      });
    }
  }, []);

  const handleOpenAddDialog = () => {
    setProjectToEdit(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectToEdit(project);
      setIsAddDialogOpen(true);
    }
  };

  const handleOpenDeleteDialog = (id: string) => {
    setProjectToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      removeProject(projectToDelete);
      setProjectToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePingAllProjects = async () => {
    setIsPinging(true);
    await pingAllProjects();
    setIsPinging(false);
  };

  const handlePingProject = async (id: string) => {
    await pingProject(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        projectCount={projects.length} 
        onAddProject={handleOpenAddDialog}
        onPingAllProjects={handlePingAllProjects}
        isPinging={isPinging}
      />
      
      <main className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-pulse-subtle space-y-4">
              <div className="h-8 w-64 bg-muted rounded-md mx-auto"></div>
              <div className="h-4 w-40 bg-muted rounded-md mx-auto"></div>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onAddProject={handleOpenAddDialog} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map(project => (
              <ProjectCard 
                key={project.id}
                project={project}
                onPing={handlePingProject}
                onEdit={handleOpenEditDialog}
                onRemove={handleOpenDeleteDialog}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Add/Edit Project Dialog */}
      <AddProjectDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddProject={addProject}
        projectToEdit={projectToEdit}
        onUpdateProject={editProject}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and stop automated pinging.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
