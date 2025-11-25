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
 * Pour les habitudes hebdomadaires (weekly), valide toute la semaine (lundi à dimanche)
 */
export async function toggleProgress(
  habitId: string,
  date: Date = new Date()
): Promise<{ completed: boolean; progress: Progress | null }> {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // Récupérer l'habitude pour vérifier la fréquence
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { frequency: true },
  });

  if (!habit) {
    throw new Error("Habitude non trouvée");
  }

  const existing = await getProgressByDate(habitId, normalizedDate);

  if (existing) {
    // Si c'est une habitude hebdomadaire, supprimer toute la semaine
    if (habit.frequency === "weekly") {
      const weekDates = getWeekDates(normalizedDate);
      await prisma.progress.deleteMany({
        where: {
          habitId,
          date: { in: weekDates },
        },
      });
    } else {
      // Supprimer uniquement l'entrée du jour
      await prisma.progress.delete({
        where: { id: existing.id },
      });
    }
    return { completed: false, progress: null };
  } else {
    // Si c'est une habitude hebdomadaire, créer toute la semaine
    if (habit.frequency === "weekly") {
      const weekDates = getWeekDates(normalizedDate);
      await prisma.progress.createMany({
        data: weekDates.map(weekDate => ({
          habitId,
          date: weekDate,
          status: "done",
        })),
        skipDuplicates: true, // Éviter les doublons si certains jours sont déjà validés
      });
      const progress = await getProgressByDate(habitId, normalizedDate);
      return { completed: true, progress };
    } else {
      // Créer uniquement l'entrée du jour
      const progress = await createProgress(habitId, normalizedDate);
      return { completed: true, progress };
    }
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
 * Obtient les dates de la semaine en cours (lundi à dimanche)
 */
function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const current = new Date(referenceDate);
  current.setHours(0, 0, 0, 0);
  
  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const dayOfWeek = current.getDay();
  // Calculer le décalage pour arriver au lundi (1)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  // Créer la date du lundi
  const monday = new Date(current);
  monday.setDate(current.getDate() + mondayOffset);
  
  // Générer les 7 jours de la semaine (lundi à dimanche)
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Récupère l'historique de la semaine en cours (lundi à dimanche) pour toutes les habitudes d'un utilisateur
 */
export async function getSevenDayHistory(userId: string): Promise<{
  dates: Date[];
  progressByHabit: Map<string, Map<string, Progress>>;
}> {
  // Générer les 7 jours de la semaine en cours (lundi à dimanche)
  const dates = getWeekDates();

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
