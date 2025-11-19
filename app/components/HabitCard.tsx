"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/providers/ToastProvider";

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
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${habit.name}" ?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Habitude supprimée avec succès", "success");
        router.refresh();
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur lors de la suppression", "error");
      }
    } catch (err) {
      showToast("Erreur réseau", "error");
    } finally {
      setDeleting(false);
    }
  }

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
            aria-label="Delete"
            title="Supprimer"
            className="p-2 rounded hover:bg-destructive/10 text-destructive disabled:opacity-50"
            onClick={handleDelete}
            disabled={deleting}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
