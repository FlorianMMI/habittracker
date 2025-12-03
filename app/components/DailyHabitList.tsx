import React from "react";
import { getHabitsByUser } from "@/lib/habits";
import { getProgressForHabits } from "@/lib/progress";
import DailyHabitCard from "./DailyHabitCard";

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Formate une date en YYYY-MM-DD en utilisant le fuseau horaire local
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ============================================================================
// COMPOSANT
// ============================================================================

export default async function DailyHabitList({ userId }: { userId: string }) {
  const allHabits = await getHabitsByUser(userId);

  // Récupérer les progressions pour aujourd'hui
  const habitIds = allHabits.map((h) => h.id);
  const progressMap = await getProgressForHabits(habitIds);

  if (allHabits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune habitude pour aujourd'hui.</p>
        <p className="text-sm text-muted-foreground mt-2">Créez votre première habitude pour commencer !</p>
      </div>
    );
  }

  // Date d'aujourd'hui au format YYYY-MM-DD (local)
  const todayKey = formatLocalDate(new Date());

  return (
    <div className="space-y-3">
      {allHabits.map((habit) => {
        const progress = progressMap.get(habit.id);
        return (
          <DailyHabitCard
            key={habit.id}
            habitId={habit.id}
            habitName={habit.name}
            frequency={habit.frequency as "daily" | "weekly"}
            tags={(habit.tags || []).map((t) => ({
              id: t.id,
              name: t.name,
              emoji: t.emoji ?? undefined,
            }))}
            initialCompleted={!!progress}
            date={todayKey}
            isFuture={false}
          />
        );
      })}
    </div>
  );
}
