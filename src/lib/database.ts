import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Grade, PortfolioItem, ServiceProject, DownloadableContent } from '../types';

// Database Schema
interface ElimuPlusDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      name: string;
      school: string;
      grade: Grade;
      avatar?: string;
      points: number;
      streak: number;
      level: number;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-name': string };
  };
  settings: {
    key: string;
    value: {
      id: string;
      userId: string;
      openaiApiKey?: string;
      theme: 'light' | 'dark';
      language: string;
      offlineMode: boolean;
      notificationsEnabled: boolean;
      updatedAt: string;
    };
  };
  portfolio: {
    key: string;
    value: PortfolioItem & { userId: string };
    indexes: { 'by-user': string; 'by-subject': string };
  };
  serviceProjects: {
    key: string;
    value: ServiceProject & { userId: string };
    indexes: { 'by-user': string };
  };
  downloads: {
    key: string;
    value: DownloadableContent & { userId: string };
    indexes: { 'by-user': string };
  };
  competencies: {
    key: string;
    value: {
      id: string;
      userId: string;
      name: string;
      shortName: string;
      level: 'exceeding' | 'meeting' | 'approaching' | 'below';
      score: number;
      icon: string;
      updatedAt: string;
    };
    indexes: { 'by-user': string };
  };
  quizResults: {
    key: string;
    value: {
      id: string;
      userId: string;
      quizId: string;
      score: number;
      totalQuestions: number;
      completedAt: string;
    };
    indexes: { 'by-user': string };
  };
  chatHistory: {
    key: string;
    value: {
      id: string;
      oduserId: string;
      role: 'user' | 'assistant';
      content: string;
      timestamp: string;
    };
    indexes: { 'by-user': string };
  };
}

const DB_NAME = 'elimu-plus-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ElimuPlusDB> | null = null;

export async function initDatabase(): Promise<IDBPDatabase<ElimuPlusDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ElimuPlusDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-name', 'name');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      // Portfolio store
      if (!db.objectStoreNames.contains('portfolio')) {
        const portfolioStore = db.createObjectStore('portfolio', { keyPath: 'id' });
        portfolioStore.createIndex('by-user', 'userId');
        portfolioStore.createIndex('by-subject', 'subject');
      }

      // Service Projects store
      if (!db.objectStoreNames.contains('serviceProjects')) {
        const serviceStore = db.createObjectStore('serviceProjects', { keyPath: 'id' });
        serviceStore.createIndex('by-user', 'userId');
      }

      // Downloads store
      if (!db.objectStoreNames.contains('downloads')) {
        const downloadsStore = db.createObjectStore('downloads', { keyPath: 'id' });
        downloadsStore.createIndex('by-user', 'userId');
      }

      // Competencies store
      if (!db.objectStoreNames.contains('competencies')) {
        const competenciesStore = db.createObjectStore('competencies', { keyPath: 'id' });
        competenciesStore.createIndex('by-user', 'userId');
      }

      // Quiz Results store
      if (!db.objectStoreNames.contains('quizResults')) {
        const quizStore = db.createObjectStore('quizResults', { keyPath: 'id' });
        quizStore.createIndex('by-user', 'userId');
      }

      // Chat History store
      if (!db.objectStoreNames.contains('chatHistory')) {
        const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id' });
        chatStore.createIndex('by-user', 'userId');
      }
    },
  });

  return dbInstance;
}

// User Operations
export async function saveUser(user: ElimuPlusDB['users']['value']): Promise<void> {
  const db = await initDatabase();
  await db.put('users', { ...user, updatedAt: new Date().toISOString() });
}

export async function getUser(id: string): Promise<ElimuPlusDB['users']['value'] | undefined> {
  const db = await initDatabase();
  return db.get('users', id);
}

export async function getCurrentUser(): Promise<ElimuPlusDB['users']['value'] | undefined> {
  const db = await initDatabase();
  const allUsers = await db.getAll('users');
  return allUsers[0]; // Return first user for single-user mode
}

export async function deleteUser(id: string): Promise<void> {
  const db = await initDatabase();
  await db.delete('users', id);
}

// Settings Operations
export async function saveSettings(settings: ElimuPlusDB['settings']['value']): Promise<void> {
  const db = await initDatabase();
  await db.put('settings', { ...settings, updatedAt: new Date().toISOString() });
}

export async function getSettings(userId: string): Promise<ElimuPlusDB['settings']['value'] | undefined> {
  const db = await initDatabase();
  const allSettings = await db.getAll('settings');
  return allSettings.find(s => s.userId === userId);
}

export async function updateApiKey(userId: string, apiKey: string): Promise<void> {
  const db = await initDatabase();
  const existing = await getSettings(userId);
  if (existing) {
    await db.put('settings', { ...existing, openaiApiKey: apiKey, updatedAt: new Date().toISOString() });
  } else {
    await db.put('settings', {
      id: `settings-${userId}`,
      userId,
      openaiApiKey: apiKey,
      theme: 'light',
      language: 'en',
      offlineMode: false,
      notificationsEnabled: true,
      updatedAt: new Date().toISOString(),
    });
  }
}

// Portfolio Operations
export async function savePortfolioItem(item: ElimuPlusDB['portfolio']['value']): Promise<void> {
  const db = await initDatabase();
  await db.put('portfolio', item);
}

export async function getUserPortfolio(userId: string): Promise<ElimuPlusDB['portfolio']['value'][]> {
  const db = await initDatabase();
  return db.getAllFromIndex('portfolio', 'by-user', userId);
}

// Competencies Operations
export async function saveCompetency(competency: ElimuPlusDB['competencies']['value']): Promise<void> {
  const db = await initDatabase();
  await db.put('competencies', competency);
}

export async function getUserCompetencies(userId: string): Promise<ElimuPlusDB['competencies']['value'][]> {
  const db = await initDatabase();
  return db.getAllFromIndex('competencies', 'by-user', userId);
}

// Quiz Results Operations
export async function saveQuizResult(result: ElimuPlusDB['quizResults']['value']): Promise<void> {
  const db = await initDatabase();
  await db.put('quizResults', result);
}

export async function getUserQuizResults(userId: string): Promise<ElimuPlusDB['quizResults']['value'][]> {
  const db = await initDatabase();
  return db.getAllFromIndex('quizResults', 'by-user', userId);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
