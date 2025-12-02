"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Habit from "../ui/Habit";

type Tag = {
  id: string;
  name: string;
  emoji: string;
};

type HabitType = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  createdAt: string;
  tags?: Tag[];
};

export default function HabitList({ userId, refreshKey }: { userId: string; refreshKey?: number }) {
  const [habits, setHabits] = useState<HabitType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function fetchHabits() {
    setLoading(true);
    try {
      const res = await fetch(`/api/habits?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (res.ok) setHabits(data.habits || []);
      else setError(data.error || "Erreur lors de la récupération");
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, [userId, refreshKey]);

  return (
    <div>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : habits.length === 0 ? (
        <p>Aucune habitude pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <Habit
              key={h.id}
              habit={h}
              userId={userId}
              onNavigate={() => router.push(`/habits/${h.id}`)}
              onEditClick={() => router.push(`/habits/${h.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}