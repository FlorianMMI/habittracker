import { prisma } from "./prisma";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Représente une entrée de progression d'une habitude.
 */
export interface Progress {
  id: string;
  habitId: string;
  date: Date;
  status: string;
  createdAt: Date;
}

// ============================================================================
// UTILITAIRES DE DATE
// ============================================================================

/**
 * Formate une date en `YYYY-MM-DD` sans conversion UTC.
 * Utilisé principalement pour générer des clés lisibles ou comparer des jours.
 *
 * @param {Date} date - Date à formater.
 * @returns {string} Chaîne `YYYY-MM-DD`.
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Normalise une date à minuit (heure locale) en supprimant l'heure.
 * Cela évite les erreurs dues aux fuseaux horaires lors de comparaisons journalières.
 *
 * @param {Date} date - Date d'entrée (peut contenir une heure).
 * @returns {Date} Nouvelle Date positionnée à 00:00:00.000 (locale).
 */
function normalizeToMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

// ============================================================================
// FONCTIONS DE PROGRESSION (accès avec Prisma)
// ============================================================================

/**
 * Crée une entrée de progression pour une habitude à une date donnée.
 * La date est normalisée à minuit local avant la création.
 *
 * @param {string} habitId - Identifiant de l'habitude.
 * @param {Date} [date=new Date()] - Date cible (par défaut aujourd'hui).
 * @returns {Promise<Progress>} L'entrée créée.
 */
export async function createProgress(habitId: string, date: Date = new Date()): Promise<Progress> {
  const normalizedDate = normalizeToMidnight(date);

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
 * Récupère la progression pour une habitude à une date donnée.
 * Utilise l'index/contrainte unique composite `habitId_date` si défini dans Prisma.
 *
 * @param {string} habitId - Identifiant de l'habitude.
 * @param {Date} [date=new Date()] - Date cible.
 * @returns {Promise<Progress | null>} Progress si trouvée, sinon `null`.
 */
export async function getProgressByDate(habitId: string, date: Date = new Date()): Promise<Progress | null> {
  const normalizedDate = normalizeToMidnight(date);

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
 * Récupère toutes les progressions pour une habitude, triées par date décroissante.
 *
 * @param {string} habitId - Identifiant de l'habitude.
 * @returns {Promise<Progress[]>} Liste des progressions.
 */
export async function getProgressByHabit(habitId: string): Promise<Progress[]> {
  const progress = await prisma.progress.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
  });
  return progress as Progress[];
}

/**
 * Basculer l'état de progression pour une habitude à une date donnée.
 * - Si une entrée existe, elle est supprimée (ou toute la semaine si `weekly`).
 * - Si aucune entrée n'existe, elle est créée (ou la semaine complète si `weekly`).
 *
 * Retourne un objet `{ completed, progress }` où `completed` indique si
 * la progression est maintenant marquée comme faite, et `progress` est
 * l'entrée pour la date demandée (ou `null`).
 *
 * @param {string} habitId - Identifiant de l'habitude.
 * @param {Date} [date=new Date()] - Date cible.
 * @returns {Promise<{ completed: boolean; progress: Progress | null }>} Résultat de l'opération.
 */
export async function toggleProgress(
  habitId: string,
  date: Date = new Date()
): Promise<{ completed: boolean; progress: Progress | null }> {
  const normalizedDate = normalizeToMidnight(date);

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
        data: weekDates.map((weekDate) => ({
          habitId,
          date: weekDate,
          status: "done",
        })),
        skipDuplicates: true,
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
 * Récupère les progressions pour plusieurs habitudes à une date donnée.
 * Renvoie une Map `habitId -> Progress` pour accès rapide.
 *
 * @param {string[]} habitIds - Liste d'identifiants d'habitudes.
 * @param {Date} [date=new Date()] - Date cible.
 * @returns {Promise<Map<string, Progress>>} Map des progressions trouvées.
 */
export async function getProgressForHabits(
  habitIds: string[],
  date: Date = new Date()
): Promise<Map<string, Progress>> {
  const normalizedDate = normalizeToMidnight(date);

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
 * Supprime toutes les progressions pour une habitude (opération destructive).
 *
 * @param {string} habitId - Identifiant de l'habitude.
 * @returns {Promise<void>}
 */
export async function deleteProgressByHabit(habitId: string): Promise<void> {
  await prisma.progress.deleteMany({
    where: { habitId },
  });
}

/**
 * Obtient les dates de la semaine en cours (lundi à dimanche), chacune
 * normalisée à minuit (locale). Utile pour opérations en lot sur la semaine.
 *
 * @param {Date} [referenceDate=new Date()] - Date de référence.
 * @returns {Date[]} Tableau de 7 Date (lundi..dimanche) normalisées.
 */
function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const current = normalizeToMidnight(referenceDate);

  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const dayOfWeek = current.getDay();
  // Calculer le décalage pour arriver au lundi
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


