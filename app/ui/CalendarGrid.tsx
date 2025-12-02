"use client";

import React from "react";
import CalendarCell from "./CalendarCell";
import { cn } from "@/lib/utils";
import type { CalendarDaySummary, CalendarDayData } from "@/types/calendar";

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  days: CalendarDayData[];
  onDayClick: (day: CalendarDaySummary) => void;
  selectedDate?: string;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/**
 * Grille du calendrier mensuel avec en-têtes de jours
 */
export default function CalendarGrid({
  year,
  month,
  days,
  onDayClick,
  selectedDate,
}: CalendarGridProps) {
  // Calculer le jour de la semaine du premier jour du mois (0 = dimanche, 1 = lundi, etc.)
  const firstDayOfMonth = new Date(year, month - 1, 1);
  let startingDayOfWeek = firstDayOfMonth.getDay();
  // Convertir pour commencer la semaine le lundi (0 = lundi, 6 = dimanche)
  startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Créer des cellules vides pour les jours avant le premier du mois
  const emptyDays = Array(startingDayOfWeek).fill(null);

  return (
    <div className="w-full">
      {/* En-têtes des jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs sm:text-sm font-medium text-muted-foreground py-2",
              (day === "Sam" || day === "Dim") && "text-primary/70"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Cellules vides pour l'alignement */}
        {emptyDays.map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-square w-full rounded-lg bg-transparent"
            aria-hidden
          />
        ))}

        {/* Cellules des jours du mois */}
        {days.map((day: CalendarDayData) => (
          <CalendarCell
            key={day.date}
            dayNumber={day.dayNumber}
            isToday={day.isToday}
            isFuture={day.isFuture}
            isCurrentMonth={day.isCurrentMonth}
            completionRate={day.completionRate}
            totalHabits={day.totalHabits}
            completedHabits={day.completedHabits}
            isSelected={day.date === selectedDate}
            onClick={() => onDayClick(day)}
          />
        ))}
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
