"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/lib/Icon";
import { motion } from "motion/react";

// ============================================================================
// TYPES
// ============================================================================

interface Tag {
  id: string;
  name: string;
  emoji?: string;
}

interface DailyHabitCardProps {
  habitId: string;
  habitName: string;
  initialCompleted: boolean;
  date: string; // Format YYYY-MM-DD
  isFuture?: boolean;
  frequency?: "daily" | "weekly";
  tags?: Tag[];
  onToggle?: (completed: boolean) => void;
}

// ============================================================================
// COMPOSANT
// ============================================================================

/**
 * Carte d'habitude quotidienne avec toggle
 * Permet de marquer une habitude comme complétée pour une date donnée
 */
export default function DailyHabitCard({
  habitId,
  habitName,
  initialCompleted,
  date,
  isFuture = false,
  frequency = "daily",
  tags = [],
  onToggle,
}: DailyHabitCardProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si la date est dans les 30 derniers jours (limite édition rétroactive)
  const canEdit = (() => {
    if (isFuture) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = date.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day);

    const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  })();

  const handleToggle = async () => {
    if (!canEdit || isLoading) return;

    // Mise à jour optimiste
    const previousState = completed;
    const newState = !completed;
    setCompleted(newState);
    setError(null);
    setIsLoading(true);

    // Notifier le parent immédiatement pour la mise à jour visuelle
    onToggle?.(newState);

    try {
      const response = await fetch(`/api/habits/${habitId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }), // Envoyer la date au format YYYY-MM-DD directement
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      const data = await response.json();

      // Vérifier la cohérence avec le serveur
      if (data.completed !== newState) {
        setCompleted(data.completed);
        onToggle?.(data.completed);
      }
    } catch (err) {
      // Rollback en cas d'erreur
      setCompleted(previousState);
      onToggle?.(previousState);
      setError("Erreur lors de la mise à jour");
      console.error("Erreur toggle progress:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        "relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300",
        completed && "border-primary/30",
        !canEdit && "opacity-60",
        "hover:shadow-md"
      )}
    >
      {/* Fond animé */}
      <motion.div
        initial={{ width: initialCompleted ? "100%" : "0%" }}
        animate={{ width: completed ? "100%" : "0%" }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="absolute inset-y-0 left-0 bg-primary/20"
        style={{ zIndex: 0 }}
      />

      <div className="flex items-center gap-4 relative z-10">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={!canEdit || isLoading}
          aria-pressed={completed}
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-md border-2 transition-all duration-200",
            "flex items-center justify-center",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            completed
              ? " text-white"
              : "bg-background border-muted hover:border-primary",
            isLoading && "opacity-50 cursor-not-allowed",
            !canEdit && "cursor-not-allowed",
            canEdit && !isLoading && "hover:scale-110 active:scale-95"
          )}
          aria-label={completed ? "Marquer comme non fait" : "Marquer comme fait"}
        >
          <motion.span
            initial={{ scale: initialCompleted ? 1 : 0.8, opacity: initialCompleted ? 1 : 0 }}
            animate={{ scale: completed ? 1 : 0.8, opacity: completed ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {completed && <CheckIcon />}
          </motion.span>
        </button>

        {/* Nom de l'habitude */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-semibold text-foreground transition-all duration-200",
                completed && "text-muted-foreground line-through"
              )}
            >
              {habitName}
            </h3>
            {/* Badge fréquence */}
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-medium",
                frequency === "daily"
                  ? "bg-chart-2/60"
                  : "bg-chart-3/60"
              )}
            >
              {frequency === "daily" ? "Quotidien" : "Hebdo"}
            </span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full"
                >
                  {tag.emoji && <span>{tag.emoji}</span>}
                  <span className="truncate max-w-[80px]">{tag.name}</span>
                </span>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-1 animate-fade-in">{error}</p>}

          {!canEdit && !isFuture && (
            <p className="text-xs text-muted-foreground mt-1">Modification impossible (plus de 30 jours)</p>
          )}
        </div>

        {/* Statut */}
        <span
          className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full transition-all duration-200",
            completed ? "text-chart-1 bg-chart-1/20" : "text-muted-foreground bg-muted"
          )}
        >
          {completed ? "Fait" : "Non fait"}
        </span>

       
        
      </div>
    </motion.div>
  );
}
