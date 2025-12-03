import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getHabitsByUser } from "@/lib/habits";
import { prisma } from "@/lib/prisma";

// ============================================================================
// UTILITAIRES DE DATE
// ============================================================================

/**
 * Formate une date en YYYY-MM-DD sans conversion UTC
 * Utilise les composants locaux de la date
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Crée une date à minuit pour un jour spécifique
 */
function createMidnightDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

// ============================================================================
// TYPES
// ============================================================================

interface Tag {
  id: string;
  name: string;
  emoji?: string;
}

export interface CalendarDayData {
  date: string;
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  habits: {
    habitId: string;
    habitName: string;
    status: "done" | "pending";
    frequency: "daily" | "weekly";
    tags: Tag[];
  }[];
}

export interface CalendarMonthResponse {
  month: number;
  year: number;
  monthName: string;
  days: CalendarDayData[];
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les paramètres de requête (mois et année)
    const searchParams = request.nextUrl.searchParams;
    const now = new Date();
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()));

    // Valider les paramètres
    if (month < 1 || month > 12 || year < 2020 || year > 2100) {
      return NextResponse.json({ error: "Paramètres de date invalides" }, { status: 400 });
    }

    // Récupérer les habitudes de l'utilisateur
    const habits = await getHabitsByUser(userId);

    if (habits.length === 0) {
      return NextResponse.json({
        month,
        year,
        monthName: new Date(year, month - 1).toLocaleDateString("fr-FR", { month: "long" }),
        days: [],
      });
    }

    // Calculer les dates du mois
    const firstDayOfMonth = createMidnightDate(year, month, 1);
    const lastDayOfMonth = new Date(year, month, 0); // Dernier jour du mois
    const daysInMonth = lastDayOfMonth.getDate();

    // Récupérer la progression du mois entier
    const habitIds = habits.map((h) => h.id);
    const startDate = createMidnightDate(year, month, 1);
    const endDate = createMidnightDate(year, month, daysInMonth);
    endDate.setHours(23, 59, 59, 999);

    const progressList = await prisma.progress.findMany({
      where: {
        habitId: { in: habitIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Organiser les progressions par date puis par habitId
    // Utiliser formatDateKey pour avoir des clés cohérentes
    const progressByDate = new Map<string, Map<string, boolean>>();
    progressList.forEach((p) => {
      const dateKey = formatDateKey(p.date);
      if (!progressByDate.has(dateKey)) {
        progressByDate.set(dateKey, new Map());
      }
      progressByDate.get(dateKey)!.set(p.habitId, true);
    });

    // Aujourd'hui pour comparaison
    const today = new Date();
    const todayKey = formatDateKey(today);

    // Générer les données pour chaque jour du mois
    const days: CalendarDayData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = createMidnightDate(year, month, day);
      const dateKey = formatDateKey(currentDate);

      // Comparer les dates correctement
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isFuture = currentDate > todayMidnight;
      const isToday = dateKey === todayKey;

      const dayProgress = progressByDate.get(dateKey) || new Map();

      const habitsForDay = habits.map((habit) => ({
        habitId: habit.id,
        habitName: habit.name,
        status: (dayProgress.has(habit.id) ? "done" : "pending") as "done" | "pending",
        frequency: habit.frequency as "daily" | "weekly",
        tags: (habit.tags || []).map((t) => ({
          id: t.id,
          name: t.name,
          emoji: t.emoji ?? undefined,
        })),
      }));

      const completedCount = habitsForDay.filter((h) => h.status === "done").length;
      const totalCount = habitsForDay.length;
      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      days.push({
        date: dateKey,
        dayNumber: day,
        isToday,
        isFuture,
        isCurrentMonth: true,
        totalHabits: totalCount,
        completedHabits: completedCount,
        completionRate,
        habits: habitsForDay,
      });
    }

    const monthName = firstDayOfMonth.toLocaleDateString("fr-FR", { month: "long" });

    return NextResponse.json({
      month,
      year,
      monthName,
      days,
    } as CalendarMonthResponse);
  } catch (error) {
    console.error("Erreur lors de la récupération du calendrier:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du calendrier" },
      { status: 500 }
    );
  }
}
