import React from "react";
import { getHabitsByUser } from "@/lib/habits";
import { getProgressForHabits } from "@/lib/progress";
import DailyHabitCard from "./DailyHabitCard";

/**
 * Filtre les habitudes en fonction du jour actuel
 * - Daily: toujours affichées
 * - Weekly: affichées uniquement si le jour correspond
 */
function filterHabitsForToday(habits: any[]) {
  const today = new Date().getDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  
  return habits.filter((habit) => {
    if (habit.frequency === "daily") {
      return true;
    }
    
    if (habit.frequency === "weekly") {
      return true;
    }
    
    return true;
  });
}

export default async function DailyHabitList({ userId }: { userId: string }) {
  const allHabits = await getHabitsByUser(userId);
  const todayHabits = filterHabitsForToday(allHabits);
  
  // Récupérer les progressions pour aujourd'hui
  const habitIds = todayHabits.map((h) => h.id);
  const progressMap = await getProgressForHabits(habitIds);

  if (todayHabits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune habitude pour aujourd'hui.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Créez votre première habitude pour commencer !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todayHabits.map((habit) => {
        const progress = progressMap.get(habit.id);
        return (
          <DailyHabitCard
            key={habit.id}
            habit={{
              id: habit.id,
              userId: habit.userId,
              name: habit.name,
              description: habit.description ?? undefined,
              frequency: habit.frequency,
              createdAt: habit.createdAt.toISOString(),
            }}
            initialCompleted={!!progress}
          />
        );
      })}
    </div>
  );
}
