import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project } from '../types';

const KEY = 'vaultcode_projects';

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function loadProjects(): Promise<Project[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(projects));
}

export async function addProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const projects = await loadProjects();
  const project: Project = {
    ...data,
    id: genId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveProjects([project, ...projects]);
  return project;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
  const projects = await loadProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...data, updatedAt: Date.now() };
    await saveProjects(projects);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await loadProjects();
  await saveProjects(projects.filter(p => p.id !== id));
}

export async function exportData(): Promise<string> {
  const projects = await loadProjects();
  return JSON.stringify(projects, null, 2);
}
