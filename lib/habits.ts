import fs from "fs/promises";
import path from "path";

const HABITS_FILE = path.join(process.cwd(), "data", "habits.json");

export type Frequency = "daily" | "weekly";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: Frequency;
  createdAt: string;
}

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readHabits(): Promise<Habit[]> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(HABITS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeHabits(habits: Habit[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(HABITS_FILE, JSON.stringify(habits, null, 2), "utf-8");
}

export async function getHabitsByUser(userId: string): Promise<Habit[]> {
  const habits = await readHabits();
  return habits.filter((h) => h.userId === userId);
}

export async function getHabitById(id: string): Promise<Habit | undefined> {
  const habits = await readHabits();
  return habits.find((h) => h.id === id);
}

export async function createHabit(userId: string, data: { name: string; description?: string; frequency?: Frequency; }): Promise<Habit> {
  const habits = await readHabits();

  const newHabit: Habit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    name: data.name,
    description: data.description || "",
    frequency: data.frequency || "daily",
    createdAt: new Date().toISOString(),
  };

  habits.push(newHabit);
  await writeHabits(habits);

  return newHabit;
}

export async function updateHabit(id: string, userId: string, data: { name?: string; description?: string; frequency?: Frequency; }): Promise<Habit | null> {
  const habits = await readHabits();

  const idx = habits.findIndex((h) => h.id === id);
  if (idx === -1) return null;

  const habit = habits[idx];
  if (habit.userId !== userId) return null; // simple ownership check for this demo

  const updated: Habit = {
    ...habit,
    name: data.name ?? habit.name,
    description: data.description ?? habit.description,
    frequency: data.frequency ?? habit.frequency,
  };

  habits[idx] = updated;
  await writeHabits(habits);

  return updated;
}
