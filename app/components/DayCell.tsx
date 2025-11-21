"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface DayCellProps {
  date: string;
  displayDate: string;
  isToday: boolean;
  completionRate: number;
  totalHabits: number;
  completedHabits: number;
  onClick: () => void;
}

export default function DayCell({
  date,
  displayDate,
  isToday,
  completionRate,
  totalHabits,
  completedHabits,
  onClick,
}: DayCellProps) {
  // Déterminer le statut basé sur le taux de complétion
  const getStatus = () => {
    if (totalHabits === 0) return "empty";
    if (completionRate === 100) return "done";
    if (completionRate > 0) return "partial";
    return "missed";
  };

  const status = getStatus();

  // Couleurs basées sur le statut — utilise les variables CSS définies dans `globals.css`
  const statusColors = {
    done: "bg-success border-success text-success-foreground",
    partial: "bg-chart-4 border-chart-4",
    missed: "bg-destructive/30 border-destructive/50 text-destructive",
    empty: "bg-secondary border-border text-muted-foreground",
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex-shrink-0 w-20 sm:w-24 p-3 rounded-lg border-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
        statusColors[status],
        isToday && "ring-2 ring-[var(--color-ring)] ring-offset-2 shadow-lg"
      )}
      aria-label={`${displayDate} - ${completedHabits} sur ${totalHabits} habitudes complétées`}
    >
      <div className="flex flex-col items-center gap-1">
        {/* Date */}
        <div className="text-xs font-medium uppercase">
          {displayDate.split(" ")[0]}
        </div>
        <div className={cn("text-lg font-bold", isToday && "text-[var(--color-primary)]")}>
          {displayDate.split(" ")[1]}
        </div>

        {/* Indicateur de complétion */}
        {totalHabits > 0 && (
          <div className="mt-1 flex flex-col items-center gap-1">
            <div className="text-xs font-semibold">
              {completionRate}%
            </div>
            <div className="text-xs opacity-75">
              {completedHabits}/{totalHabits}
            </div>
          </div>
        )}

        {/* Badge "Aujourd'hui" */}
        {isToday && (
          <div className="mt-1 px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
            Aujourd'hui
          </div>
        )}

        {/* Indicateur visuel du statut */}
        <div className="mt-2 flex items-center justify-center gap-1">
          {status === "done" && (
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden />
          )}

          {status === "partial" && (
            <div className="relative w-6 h-3" aria-hidden>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-chart-4" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-border)]" />
            </div>
          )}

          {status === "missed" && (
            <div className="w-2 h-2 rounded-full bg-destructive" aria-hidden />
          )}
        </div>
      </div>
    </motion.button>
  );
}
