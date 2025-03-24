
import { useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  loadProjects, 
  saveProjects, 
  addProject as addProjectService,
  removeProject as removeProjectService,
  editProject as editProjectService,
  pingProject as pingProjectService,
  setupAutomaticPinging
} from '@/utils/projectService';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects on initial render
  useEffect(() => {
    setIsLoading(true);
    const loadedProjects = loadProjects();
    setProjects(loadedProjects);
    setIsLoading(false);
    
    // Set up automatic pinging
    const cleanup = setupAutomaticPinging();
    
    return () => {
      cleanup();
    };
  }, []);

  // Add project
  const addProject = useCallback((project: { name: string; url: string }) => {
    const updatedProjects = addProjectService(project);
    setProjects(updatedProjects);
  }, []);

  // Remove project
  const removeProject = useCallback((id: string) => {
    const updatedProjects = removeProjectService(id);
    setProjects(updatedProjects);
  }, []);

  // Edit project
  const editProject = useCallback((id: string, updates: Partial<Pick<Project, 'name' | 'url'>>) => {
    const updatedProjects = editProjectService(id, updates);
    setProjects(updatedProjects);
  }, []);

  // Ping project
  const pingProject = useCallback(async (id: string) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === id ? { ...p, status: 'pending' } : p
      )
    );
    
    const updatedProjects = await pingProjectService(id);
    setProjects(updatedProjects);
  }, []);

  // Ping all projects
  const pingAllProjects = useCallback(async () => {
    if (projects.length === 0) return;
    
    // Set all projects to pending status
    setProjects(prevProjects => 
      prevProjects.map(p => ({ ...p, status: 'pending' }))
    );
    
    // Ping each project sequentially
    let updatedProjects = [...projects];
    for (const project of projects) {
      updatedProjects = await pingProjectService(project.id);
    }
    
    setProjects(updatedProjects);
  }, [projects]);

  return {
    projects,
    isLoading,
    addProject,
    removeProject,
    editProject,
    pingProject,
    pingAllProjects
  };
};
