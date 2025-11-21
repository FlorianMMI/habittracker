import { prisma } from "./prisma";

export interface Progress {
  id: string;
  habitId: string;
  date: Date;
  status: string;
  createdAt: Date;
}

/**
 * Crée une entrée de progression pour une habitude à une date donnée
 */
export async function createProgress(
  habitId: string,
  date: Date = new Date()
): Promise<Progress> {
  // Normaliser la date à minuit (00:00:00) pour éviter les doublons
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const progress = await prisma.progress.create({
    data: {
      habitId,
      date: normalizedDate,
      status: "done",
    },
  });
  return progress as Progress;
}

/**
 * Récupère la progression pour une habitude à une date donnée
 */
export async function getProgressByDate(
  habitId: string,
  date: Date = new Date()
): Promise<Progress | null> {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const progress = await prisma.progress.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: normalizedDate,
      },
    },
  });
  return progress as Progress | null;
}

/**
 * Récupère toutes les progressions pour une habitude
 */
export async function getProgressByHabit(habitId: string): Promise<Progress[]> {
  const progress = await prisma.progress.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
  });
  return progress as Progress[];
}

/**
 * Toggle la progression : crée si n'existe pas, supprime si existe
 */
export async function toggleProgress(
  habitId: string,
  date: Date = new Date()
): Promise<{ completed: boolean; progress: Progress | null }> {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const existing = await getProgressByDate(habitId, normalizedDate);

  if (existing) {
    // Supprimer l'entrée existante
    await prisma.progress.delete({
      where: { id: existing.id },
    });
    return { completed: false, progress: null };
  } else {
    // Créer une nouvelle entrée
    const progress = await createProgress(habitId, normalizedDate);
    return { completed: true, progress };
  }
}

/**
 * Récupère les progressions pour plusieurs habitudes à une date donnée
 */
export async function getProgressForHabits(
  habitIds: string[],
  date: Date = new Date()
): Promise<Map<string, Progress>> {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const progressList = await prisma.progress.findMany({
    where: {
      habitId: { in: habitIds },
      date: normalizedDate,
    },
  });

  const progressMap = new Map<string, Progress>();
  progressList.forEach((p) => {
    progressMap.set(p.habitId, p as Progress);
  });

  return progressMap;
}

/**
 * Supprime toutes les progressions pour une habitude
 */
export async function deleteProgressByHabit(habitId: string): Promise<void> {
  await prisma.progress.deleteMany({
    where: { habitId },
  });
}

/**
 * Récupère l'historique des 7 derniers jours pour toutes les habitudes d'un utilisateur
 */
export async function getSevenDayHistory(userId: string): Promise<{
  dates: Date[];
  progressByHabit: Map<string, Map<string, Progress>>;
}> {
  // Générer les 7 derniers jours (de aujourd'hui à J-6)
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  dates.reverse(); // Pour avoir l'ordre chronologique (plus ancien → plus récent)

  // Récupérer toutes les habitudes de l'utilisateur
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true },
  });

  const habitIds = habits.map((h) => h.id);

  if (habitIds.length === 0) {
    return { dates, progressByHabit: new Map() };
  }

  // Récupérer toutes les progressions pour ces habitudes sur les 7 derniers jours
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const progressList = await prisma.progress.findMany({
    where: {
      habitId: { in: habitIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Organiser les données : habitId → date → Progress
  const progressByHabit = new Map<string, Map<string, Progress>>();

  habitIds.forEach((habitId) => {
    progressByHabit.set(habitId, new Map());
  });

  progressList.forEach((p: any) => {
    const dateKey = p.date.toISOString().split("T")[0];
    const habitMap = progressByHabit.get(p.habitId);
    if (habitMap) {
      habitMap.set(dateKey, p as Progress);
    }
  });

  return { dates, progressByHabit };
}
