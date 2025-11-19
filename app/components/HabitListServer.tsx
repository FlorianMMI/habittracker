import React from "react";
import { getHabitsByUser } from "@/lib/habits";
import HabitCard from "./HabitCard";

export default async function HabitListServer({ userId }: { userId: string }) {
  const habits = await getHabitsByUser(userId);

  if (habits.length === 0) {
    return <p className="text-muted-foreground">Aucune habitude pour le moment.</p>;
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={{
            id: habit.id,
            userId: habit.userId,
            name: habit.name,
            description: habit.description ?? undefined,
            frequency: habit.frequency,
            createdAt: habit.createdAt.toISOString(),
          }}
        />
      ))}
    </div>
  );
}
