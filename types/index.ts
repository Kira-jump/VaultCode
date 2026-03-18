export type ProjectStatus = 'idea' | 'wip' | 'pause' | 'done';

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  text: string;
  date: number;
}

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  desc?: string;
  status: ProjectStatus;
  stack?: string;
  tags: string[];
  progress: number;
  tasks: Task[];
  notes: Note[];
  links: Link[];
  createdAt: number;
  updatedAt: number;
}
