
import { toast } from "@/components/ui/use-toast";

export interface Project {
  id: string;
  name: string;
  url: string;
  lastPinged: Date | null;
  nextPing: Date;
  status: 'active' | 'pending' | 'error';
  createdAt: Date;
}

// Load projects from localStorage
export const loadProjects = (): Project[] => {
  try {
    const storedProjects = localStorage.getItem('vercel-sustainer-projects');
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects, (key, value) => {
        // Convert date strings back to Date objects
        if (key === 'lastPinged' && value !== null) return new Date(value);
        if (key === 'nextPing' || key === 'createdAt') return new Date(value);
        return value;
      });
      return projects;
    }
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
    toast({
      title: "Error loading projects",
      description: "There was an issue loading your projects. Your data might be corrupted.",
      variant: "destructive",
    });
  }
  return [];
};

// Save projects to localStorage
export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem('vercel-sustainer-projects', JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
    toast({
      title: "Error saving projects",
      description: "There was an issue saving your projects.",
      variant: "destructive",
    });
  }
};

// Add a new project
export const addProject = (project: Omit<Project, 'id' | 'lastPinged' | 'nextPing' | 'status' | 'createdAt'>): Project[] => {
  const projects = loadProjects();
  
  // Check if URL already exists
  if (projects.some(p => p.url === project.url)) {
    toast({
      title: "Project already exists",
      description: "A project with this URL already exists.",
      variant: "destructive",
    });
    return projects;
  }
  
  const newProject: Project = {
    ...project,
    id: crypto.randomUUID(),
    lastPinged: null,
    nextPing: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'pending',
    createdAt: new Date(),
  };
  
  const updatedProjects = [...projects, newProject];
  saveProjects(updatedProjects);
  
  toast({
    title: "Project added",
    description: `${project.name} has been added to your projects.`,
  });
  
  return updatedProjects;
};

// Remove a project
export const removeProject = (projectId: string): Project[] => {
  const projects = loadProjects();
  const projectToRemove = projects.find(p => p.id === projectId);
  
  if (!projectToRemove) {
    toast({
      title: "Project not found",
      description: "The project you're trying to remove doesn't exist.",
      variant: "destructive",
    });
    return projects;
  }
  
  const updatedProjects = projects.filter(p => p.id !== projectId);
  saveProjects(updatedProjects);
  
  toast({
    title: "Project removed",
    description: `${projectToRemove.name} has been removed from your projects.`,
  });
  
  return updatedProjects;
};

// Edit a project
export const editProject = (projectId: string, updates: Partial<Pick<Project, 'name' | 'url'>>): Project[] => {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) {
    toast({
      title: "Project not found",
      description: "The project you're trying to edit doesn't exist.",
      variant: "destructive",
    });
    return projects;
  }
  
  // Check if the new URL already exists in another project
  if (updates.url && projects.some((p, i) => i !== projectIndex && p.url === updates.url)) {
    toast({
      title: "URL already exists",
      description: "Another project with this URL already exists.",
      variant: "destructive",
    });
    return projects;
  }
  
  const updatedProjects = [...projects];
  updatedProjects[projectIndex] = {
    ...updatedProjects[projectIndex],
    ...updates,
  };
  
  saveProjects(updatedProjects);
  
  toast({
    title: "Project updated",
    description: `${updatedProjects[projectIndex].name} has been updated.`,
  });
  
  return updatedProjects;
};

// Ping a project
export const pingProject = async (projectId: string): Promise<Project[]> => {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) {
    toast({
      title: "Project not found",
      description: "The project you're trying to ping doesn't exist.",
      variant: "destructive",
    });
    return projects;
  }
  
  const project = projects[projectIndex];
  
  try {
    const startTime = Date.now();
    
    // Use fetch with timeout to ping the project
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    projects[projectIndex].status = 'pending';
    saveProjects(projects); // Update UI immediately to show pending state
    
    try {
      const response = await fetch(project.url, {
        method: 'GET',
        mode: 'no-cors', // To avoid CORS issues
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const endTime = Date.now();
      const pingTime = endTime - startTime;
      
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        lastPinged: new Date(),
        nextPing: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next ping in 7 days
        status: 'active',
      };
      
      saveProjects(updatedProjects);
      
      toast({
        title: "Project pinged successfully",
        description: `${project.name} was pinged in ${pingTime}ms.`,
      });
      
      return updatedProjects;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error(`Failed to ping project ${project.name}:`, error);
    
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = {
      ...updatedProjects[projectIndex],
      status: 'error',
    };
    
    saveProjects(updatedProjects);
    
    toast({
      title: "Failed to ping project",
      description: `Could not reach ${project.name}. Please check the URL and try again.`,
      variant: "destructive",
    });
    
    return updatedProjects;
  }
};

// Check for projects that need pinging
export const checkProjectsForPinging = async (): Promise<Project[]> => {
  let projects = loadProjects();
  const now = new Date();
  
  // Find projects that need pinging (next ping date is in the past)
  const projectsNeedingPings = projects.filter(project => 
    project.nextPing < now
  );
  
  // Ping each project that needs it
  for (const project of projectsNeedingPings) {
    projects = await pingProject(project.id);
  }
  
  return projects;
};

// Set up automatic pinging on page load and schedule regular checks
export const setupAutomaticPinging = () => {
  // Immediate check on startup
  checkProjectsForPinging();
  
  // Check every hour for projects that need pinging
  const intervalId = setInterval(() => {
    checkProjectsForPinging();
  }, 60 * 60 * 1000); // Every hour
  
  return () => clearInterval(intervalId); // Cleanup function
};
