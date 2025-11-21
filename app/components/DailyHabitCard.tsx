"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/lib/Icon";
import { motion } from "motion/react";

interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: string;
  createdAt: string;
}

interface DailyHabitCardProps {
  habit: Habit;
  initialCompleted: boolean;
}

export default function DailyHabitCard({
  habit,
  initialCompleted,
}: DailyHabitCardProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async () => {
    // Mise à jour optimiste de l'UI
    const previousState = completed;
    setCompleted(!completed);
    setIsAnimating(true);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/habits/${habit.id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      const data = await response.json();
      
      // Vérifier que l'état du serveur correspond à notre état optimiste
      if (data.completed !== !previousState) {
        setCompleted(data.completed);
      }
    } catch (err) {
      // Rollback en cas d'erreur
      setCompleted(previousState);
      setError("Erreur lors de la mise à jour");
      console.error("Erreur toggle progress:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <motion.div
        className={cn(
            "relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300",
            completed && "border-primary/30",
            isAnimating && "scale-[0.98]",
            "hover:shadow-md"
        )}
    >
        {/* Left-to-right fill background */}
        <motion.div
            initial={{ width: initialCompleted ? "100%" : "0%" }}
            animate={{ width: completed ? "100%" : "0%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-y-0 left-0 bg-primary/30"
            style={{ zIndex: 0 }}
        />

        <div className="flex items-start gap-4 relative z-10">
            {/* Checkbox/Toggle */}
            <button
                onClick={handleToggle}
                disabled={isLoading}
                aria-pressed={completed}
                className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-md border-2 transition-all duration-200",
                    "flex items-center justify-center",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    completed
                        ? "bg-success border-success text-white"
                        : "bg-background border-muted hover:border-primary",
                    isLoading && "opacity-50 cursor-not-allowed",
                    !isLoading && "hover:scale-110 active:scale-95"
                )}
                aria-label={completed ? "Marquer comme non fait" : "Marquer comme fait"}
            >
                {/* Animated check icon */}
                <motion.span
                    initial={{ scale: initialCompleted ? 1 : 0.8, opacity: initialCompleted ? 1 : 0 }}
                    animate={{ scale: completed ? 1 : 0.8, opacity: completed ? 1 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex items-center justify-center"
                >
                    {completed ? <CheckIcon /> : <span className="text-muted-foreground text-xl" />}
                </motion.span>
            </button>

            {/* Contenu de l'habitude */}
            <div className="flex-1 min-w-0">
                <h3
                    className={cn(
                        "font-semibold text-foreground transition-all duration-200",
                        completed && "text-muted-foreground line-through"
                    )}
                >
                    {habit.name}
                </h3>
                {habit.description && (
                    <p
                        className={cn(
                            "text-sm text-muted-foreground mt-1 transition-all duration-200",
                            completed && "opacity-60"
                        )}
                    >
                        {habit.description}
                    </p>
                )}
                {error && (
                    <p className="text-sm text-destructive mt-2 animate-fade-in">
                        {error}
                    </p>
                )}
            </div>
        </div>

        {/* Badge de fréquence */}
        <div className="mt-3 flex gap-2 relative z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs font-medium text-muted-foreground">
                {habit.frequency === "daily" ? "Quotidien" : "Hebdomadaire"}
            </span>
        </div>
    </motion.div>
  );
}
