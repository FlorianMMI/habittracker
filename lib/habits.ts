import { prisma } from "./prisma";

export type Frequency = "daily" | "weekly";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  frequency: Frequency;
  createdAt: Date;
}

export async function getHabitsByUser(userId: string): Promise<Habit[]> {
  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return habits as Habit[];
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const habit = await prisma.habit.findUnique({
    where: { id },
  });
  return habit as Habit | null;
}

export async function createHabit(
  userId: string,
  data: { name: string; description?: string; frequency?: Frequency }
): Promise<Habit> {
  const habit = await prisma.habit.create({
    data: {
      userId,
      name: data.name,
      description: data.description || "",
      frequency: data.frequency || "daily",
    },
  });
  return habit as Habit;
}

export async function updateHabit(
  id: string,
  userId: string,
  data: { name?: string; description?: string; frequency?: Frequency }
): Promise<Habit | null> {
  // Check ownership
  const habit = await prisma.habit.findUnique({
    where: { id },
  });

  if (!habit || habit.userId !== userId) {
    return null;
  }

  const updated = await prisma.habit.update({
    where: { id },
    data: {
      name: data.name ?? habit.name,
      description: data.description ?? habit.description,
      frequency: data.frequency ?? habit.frequency,
    },
  });
  return updated as Habit;
}

export async function deleteHabit(
  id: string,
  userId: string
): Promise<boolean> {
  // Check ownership
  const habit = await prisma.habit.findUnique({
    where: { id },
  });

  if (!habit || habit.userId !== userId) {
    return false;
  }

  await prisma.habit.delete({
    where: { id },
  });

  return true;
}
