import { openDB, IDBPDatabase } from 'idb';
import { Project } from './types';

const DB_NAME = 'monter-ograj-pro';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('customerName', 'customerName');
          store.createIndex('status', 'status');
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB();
  const projects = await db.getAll(STORE_NAME);
  return projects.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getProject(id: number): Promise<Project | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function createProject(
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const db = await getDB();
  const now = new Date().toISOString();
  const entry = { ...project, createdAt: now, updatedAt: now };
  const id = await db.add(STORE_NAME, entry);
  return { ...entry, id: id as number };
}

export async function updateProject(
  project: Project
): Promise<Project> {
  const db = await getDB();
  const updated = { ...project, updatedAt: new Date().toISOString() };
  await db.put(STORE_NAME, updated);
  return updated;
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getActiveProjectCount(): Promise<number> {
  const db = await getDB();
  const projects = await db.getAllFromIndex(STORE_NAME, 'status', 'active');
  return projects.length;
}
