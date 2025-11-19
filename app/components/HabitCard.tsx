"use client";

import React from "react";
import { useRouter } from "next/navigation";

type HabitType = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  createdAt: string;
};

interface HabitCardProps {
  habit: HabitType;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const router = useRouter();

  return (
    <div
      className="p-4 bg-card border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => router.push(`/habits/${habit.id}`)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="font-medium">{habit.name}</h4>
            {habit.description && (
              <p className="text-sm text-muted-foreground">{habit.description}</p>
            )}
            <article className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <p className="flex items-center text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                  {habit.frequency}
                </p>
              </div>
              <p className="m-0">Créé le {new Date(habit.createdAt).toLocaleDateString("fr-FR")}</p>
            </article>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Edit"
            title="Modifier"
            className="p-2 rounded hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/habits/${habit.id}`);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
