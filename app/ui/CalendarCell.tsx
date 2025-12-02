"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface CalendarCellProps {
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
  completionRate: number;
  totalHabits: number;
  completedHabits: number;
  isSelected?: boolean;
  onClick: () => void;
}

/**
 * Cellule individuelle du calendrier mensuel
 * Codes couleur :
 * - Vert (toutes faites) : 100%
 * - Jaune (partiel) : 1-99%
 * - Rouge (aucune) : 0% (avec habitudes)
 * - Gris (futur) : jours dans le futur
 */
export default function CalendarCell({
  dayNumber,
  isToday,
  isFuture,
  isCurrentMonth,
  completionRate,
  totalHabits,
  completedHabits,
  isSelected = false,
  onClick,
}: CalendarCellProps) {
  // Déterminer le statut basé sur le taux de complétion
  const getStatus = () => {
    if (isFuture) return "future";
    if (totalHabits === 0) return "empty";
    if (completionRate === 100) return "done";
    if (completionRate > 0) return "partial";
    return "missed";
  };

  const status = getStatus();

  // Couleurs basées sur le statut
  const statusStyles = {
    done: "bg-chart-1/20 hover:bg-chart-1/30 border-chart-1/50 text-foreground",
    partial: "bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-900 dark:bg-amber-900/30 dark:hover:bg-amber-900/40 dark:border-amber-600 dark:text-amber-100",
    missed: "bg-destructive/20 hover:bg-destructive/30 border-destructive/50 text-foreground",
    future: "bg-muted/50 border-border text-muted-foreground cursor-default",
    empty: "bg-secondary/50 hover:bg-secondary border-border text-muted-foreground",
  };

  // Indicateur de statut (point coloré)
  const statusIndicator = {
    done: "bg-chart-1",
    partial: "bg-amber-400 dark:bg-amber-500",
    missed: "bg-destructive",
    future: "bg-muted-foreground/30",
    empty: "bg-muted-foreground/20",
  };

  const isClickable = !isFuture && isCurrentMonth;

  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { scale: 1.05 } : undefined}
      whileTap={isClickable ? { scale: 0.95 } : undefined}
      disabled={!isClickable}
      className={cn(
        "relative aspect-square w-full p-1 sm:p-2 rounded-lg border transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        "flex flex-col items-center justify-center gap-0.5",
        statusStyles[status],
        isSelected && "ring-2 ring-primary ring-offset-1 shadow-lg border-primary",
        isToday && !isSelected && "ring-1 ring-primary/50",
        !isCurrentMonth && "opacity-40"
      )}
      aria-label={`${dayNumber} - ${completedHabits} sur ${totalHabits} habitudes complétées`}
    >
      {/* Numéro du jour */}
      <span
        className={cn(
          "text-sm sm:text-base font-semibold",
          (isToday || isSelected) && "text-primary"
        )}
      >
        {dayNumber}
      </span>

      {/* Indicateur de progression (visible sur écrans plus grands) */}
      {totalHabits > 0 && !isFuture && (
        <div className="hidden sm:flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-medium">
            {completedHabits}/{totalHabits}
          </span>
        </div>
      )}

      {/* Point indicateur de statut (toujours visible) */}
      <div
        className={cn(
          "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
          statusIndicator[status]
        )}
        aria-hidden
      />

      {/* Badge "Aujourd'hui" */}
      {isToday && (
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </motion.button>
  );
}
