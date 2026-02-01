export type GradeLevel = 'upper-primary' | 'junior-secondary' | 'senior-school';
export type Grade = 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type CompetencyLevel = 'exceeding' | 'meeting' | 'approaching' | 'below';

export interface Competency {
  id: string;
  name: string;
  shortName: string;
  level: CompetencyLevel;
  score: number;
  icon: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'pdf' | 'document';
  uploadDate: string;
  subject: string;
  competencies: string[];
  thumbnail?: string;
  size: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  grade: Grade;
  questions: number;
  duration: number;
  points: number;
  completed?: boolean;
  score?: number;
}

export interface VideoLesson {
  id: string;
  title: string;
  subject: string;
  duration: string;
  thumbnail: string;
  kicdAligned: boolean;
  grade: Grade;
}

export interface ServiceProject {
  id: string;
  title: string;
  description: string;
  hours: number;
  status: 'planned' | 'in-progress' | 'completed';
  impact: string;
  date: string;
}

export interface VirtualLab {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'biology' | 'mathematics';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
}

export interface DownloadableContent {
  id: string;
  title: string;
  type: 'curriculum' | 'notes' | 'worksheet';
  subject: string;
  grade: Grade;
  size: string;
  downloaded: boolean;
}

export interface Student {
  id: string;
  name: string;
  grade: Grade;
  school: string;
  avatar?: string;
  points: number;
  streak: number;
  level: number;
}
