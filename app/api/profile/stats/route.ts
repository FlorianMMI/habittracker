import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface DailyStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

interface ProfileStats {
  totalHabits: number;
  dailyHabits: number;
  weeklyHabits: number;
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  weeklyStats: DailyStats[];
  completionRate: number;
}

/**
 * Calcule le streak actuel et le meilleur streak pour un utilisateur
 * Un streak = jours consécutifs avec 100% de complétion de toutes les habitudes (quotidiennes + hebdomadaires)
 */
async function calculateStreaks(userId: string): Promise<{ currentStreak: number; bestStreak: number }> {
  // Récupérer toutes les habitudes quotidiennes et hebdomadaires de l'utilisateur
  const allHabits = await prisma.habit.findMany({
    where: { 
      userId,
      frequency: { in: ["daily", "weekly"] }
    },
    select: { id: true, createdAt: true },
  });

  if (allHabits.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const habitIds = allHabits.map((h) => h.id);
  const totalHabits = allHabits.length;

  // Récupérer toutes les progressions groupées par date
  const allProgress = await prisma.progress.findMany({
    where: { habitId: { in: habitIds } },
    orderBy: { date: "desc" },
    select: { date: true, habitId: true },
  });

  if (allProgress.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Grouper les progressions par date et compter combien d'habitudes ont été complétées chaque jour
  const dateCompletionMap = new Map<string, Set<string>>();
  
  for (const p of allProgress) {
    const d = new Date(p.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    if (!dateCompletionMap.has(dateStr)) {
      dateCompletionMap.set(dateStr, new Set());
    }
    dateCompletionMap.get(dateStr)!.add(p.habitId);
  }

  // Trouver les jours avec 100% de complétion
  const perfectDays: string[] = [];
  for (const [dateStr, completedHabits] of dateCompletionMap) {
    if (completedHabits.size >= totalHabits) {
      perfectDays.push(dateStr);
    }
  }

  // Trier les jours parfaits par ordre décroissant (plus récent en premier)
  perfectDays.sort().reverse();

  if (perfectDays.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Calculer le streak actuel (jours consécutifs avec 100% jusqu'à aujourd'hui ou hier)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  let currentStreak = 0;
  
  // Vérifier si le streak commence aujourd'hui ou hier
  const startFromToday = perfectDays[0] === todayStr;
  const startFromYesterday = perfectDays[0] === yesterdayStr;

  if (startFromToday || startFromYesterday) {
    let checkDate = new Date(perfectDays[0]);
    
    for (const dateStr of perfectDays) {
      const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
      
      if (dateStr === checkDateStr) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculer le meilleur streak
  let bestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 0; i < perfectDays.length - 1; i++) {
    const currentDate = new Date(perfectDays[i]);
    const nextDate = new Date(perfectDays[i + 1]);
    
    // Calculer la différence en jours
    const diffTime = currentDate.getTime() - nextDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

  return { currentStreak, bestStreak };
}

/**
 * Calcule les statistiques des 7 derniers jours
 * Inclut à la fois les habitudes quotidiennes et hebdomadaires
 */
async function getWeeklyStats(userId: string): Promise<DailyStats[]> {
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true, frequency: true },
  });

  // Inclure les habitudes quotidiennes ET hebdomadaires
  const allHabits = habits.filter((h) => h.frequency === "daily" || h.frequency === "weekly");
  const totalHabits = allHabits.length;

  if (totalHabits === 0) {
    return [];
  }

  const habitIds = allHabits.map((h) => h.id);
  const stats: DailyStats[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // Récupérer les habitudes uniques complétées pour ce jour
    const completedProgress = await prisma.progress.findMany({
      where: {
        habitId: { in: habitIds },
        date: {
          gte: date,
          lt: nextDate,
        },
      },
      select: {
        habitId: true,
      },
      distinct: ['habitId'], // Ne compter qu'une fois chaque habitude
    });

    const completedCount = completedProgress.length;

    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const dayName = dayNames[date.getDay()];

    stats.push({
      date: dayName,
      completed: completedCount,
      total: totalHabits,
      percentage: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0,
    });
  }

  return stats;
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les habitudes
    const habits = await prisma.habit.findMany({
      where: { userId },
      select: { id: true, frequency: true },
    });

    const totalHabits = habits.length;
    const dailyHabits = habits.filter((h) => h.frequency === "daily").length;
    const weeklyHabits = habits.filter((h) => h.frequency === "weekly").length;

    // Récupérer le nombre total de complétion
    const habitIds = habits.map((h) => h.id);
    const totalCompletions = await prisma.progress.count({
      where: { habitId: { in: habitIds } },
    });

    // Calculer les streaks
    const { currentStreak, bestStreak } = await calculateStreaks(userId);

    // Statistiques hebdomadaires
    const weeklyStats = await getWeeklyStats(userId);

    // Taux de complétion global (sur les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletions = await prisma.progress.count({
      where: {
        habitId: { in: habitIds },
        date: { gte: thirtyDaysAgo },
      },
    });

    const possibleCompletions = dailyHabits * 30 + weeklyHabits * 4;
    const completionRate = possibleCompletions > 0 
      ? Math.round((recentCompletions / possibleCompletions) * 100) 
      : 0;

    const stats: ProfileStats = {
      totalHabits,
      dailyHabits,
      weeklyHabits,
      totalCompletions,
      currentStreak,
      bestStreak,
      weeklyStats,
      completionRate: Math.min(completionRate, 100),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
