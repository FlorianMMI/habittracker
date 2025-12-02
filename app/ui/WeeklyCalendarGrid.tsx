"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { CalendarDayData, CalendarDaySummary } from "@/types/calendar";

interface WeeklyCalendarGridProps {
  days: CalendarDayData[];
  onDayClick: (day: CalendarDaySummary) => void;
  selectedDate: string;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/**
 * Grille hebdomadaire (7 jours en ligne)
 */
export default function WeeklyCalendarGrid({
  days,
  onDayClick,
  selectedDate,
}: WeeklyCalendarGridProps) {
  // Déterminer le statut basé sur le taux de complétion
  const getStatus = (day: CalendarDayData) => {
    if (day.isFuture) return "future";
    if (day.totalHabits === 0) return "empty";
    if (day.completionRate === 100) return "done";
    if (day.completionRate > 0) return "partial";
    return "missed";
  };

  // Couleurs basées sur le statut
  const statusStyles = {
    done: "bg-chart-1/20 hover:bg-chart-1/30 border-chart-1/50 text-foreground",
    partial: "bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-900 dark:bg-amber-900/30 dark:hover:bg-amber-900/40 dark:border-amber-600 dark:text-amber-100",
    missed: "bg-destructive/20 hover:bg-destructive/30 border-destructive/50 text-foreground",
    future: "bg-muted/50 border-border text-muted-foreground cursor-default",
    empty: "bg-secondary/50 hover:bg-secondary border-border text-muted-foreground",
  };

  // Indicateur de statut
  const statusIndicator = {
    done: "bg-chart-1",
    partial: "bg-amber-400 dark:bg-amber-500",
    missed: "bg-destructive",
    future: "bg-muted-foreground/30",
    empty: "bg-muted-foreground/20",
  };

  return (
    <div className="w-full">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs sm:text-sm font-medium text-muted-foreground py-2",
              (index === 5 || index === 6) && "text-primary/70"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours de la semaine */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const status = getStatus(day);
          const isSelected = day.date === selectedDate;
          const isClickable = !day.isFuture;

          return (
            <motion.button
              key={day.date}
              onClick={isClickable ? () => onDayClick(day) : undefined}
              whileHover={isClickable ? { scale: 1.05 } : undefined}
              whileTap={isClickable ? { scale: 0.95 } : undefined}
              disabled={!isClickable}
              className={cn(
                "relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                "flex flex-col items-center justify-center gap-1",
                statusStyles[status],
                isSelected && "ring-2 ring-primary ring-offset-2 shadow-lg border-primary",
                day.isToday && !isSelected && "ring-1 ring-primary/50"
              )}
              aria-label={`${day.dayNumber} - ${day.completedHabits} sur ${day.totalHabits} habitudes complétées`}
            >
              {/* Date */}
              <span
                className={cn(
                  "text-lg sm:text-xl font-bold",
                  day.isToday && "text-primary",
                  isSelected && "text-primary"
                )}
              >
                {day.dayNumber}
              </span>

              {/* Indicateur de progression */}
              {day.totalHabits > 0 && !day.isFuture && (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-medium">
                    {day.completedHabits}/{day.totalHabits}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {day.completionRate}%
                  </span>
                </div>
              )}

              {/* Point indicateur de statut */}
              <div
                className={cn(
                  "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full",
                  statusIndicator[status]
                )}
                aria-hidden
              />

              {/* Badge Aujourd'hui */}
              {day.isToday && (
                <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                  Auj.
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-chart-1" />
          <span>Toutes faites</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500" />
          <span>Partiel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span>Aucune</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          <span>Futur</span>
        </div>
      </div>
    </div>
  );
}
