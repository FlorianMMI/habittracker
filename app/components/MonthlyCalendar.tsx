"use client";

import React, { useState, useEffect, useCallback } from "react";
import CalendarGrid from "@/app/ui/CalendarGrid";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { CheckIcon } from "@/lib/Icon";
import type { CalendarDayData, CalendarMonthData, CalendarDaySummary } from "@/types/calendar";

interface MonthlyCalendarProps {
  userId?: string;
}

export default function MonthlyCalendar({ userId }: MonthlyCalendarProps) {
  const [calendarData, setCalendarData] = useState<CalendarMonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);
  
  // État pour le mois/année actuellement affiché
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  const fetchCalendarData = useCallback(async (month: number, year: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/habits/calendar?month=${month}&year=${year}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du calendrier");
      }

      const data = await response.json();
      setCalendarData(data);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger le calendrier");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchCalendarData]);

  // Navigation vers le mois précédent
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  // Navigation vers le mois suivant
  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Revenir au mois actuel
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth() + 1);
    setCurrentYear(now.getFullYear());
  };

  // Gérer le clic sur un jour
  const handleDayClick = (day: CalendarDaySummary) => {
    // Récupérer les données complètes du jour (avec les habitudes)
    const fullDayData = calendarData?.days.find((d) => d.date === day.date);
    if (fullDayData) {
      setSelectedDay(fullDayData);
    }
  };

  // Fermer le modal
  const closeModal = () => {
    setSelectedDay(null);
  };

  // Vérifier si on affiche le mois actuel
  const isCurrentMonthDisplayed = () => {
    const now = new Date();
    return currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();
  };

  // Skeleton de chargement
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => fetchCalendarData(currentMonth, currentYear)}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground capitalize">
            {calendarData?.monthName} {currentYear}
          </h3>

          <div className="flex items-center gap-2">
            {/* Bouton "Aujourd'hui" */}
            {!isCurrentMonthDisplayed() && (
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
              >
                Aujourd'hui
              </button>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Mois précédent"
              >
                <ChevronLeftIcon className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Mois suivant"
              >
                <ChevronRightIcon className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Grille du calendrier */}
        {calendarData && (
          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            days={calendarData.days}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      {/* Modal de détails du jour */}
      <AnimatePresence>
        {selectedDay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {new Date(selectedDay.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDay.completedHabits} sur {selectedDay.totalHabits} habitudes complétées (
                      {selectedDay.completionRate}%)
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-muted-foreground hover:text-foreground text-2xl leading-none p-1"
                    aria-label="Fermer"
                  >
                    ×
                  </button>
                </div>

                {/* Barre de progression */}
                <div className="mt-3">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        selectedDay.completionRate === 100
                          ? "bg-chart-1"
                          : selectedDay.completionRate > 0
                          ? "bg-amber-400 dark:bg-amber-500"
                          : "bg-destructive"
                      )}
                      style={{ width: `${selectedDay.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Liste des habitudes */}
              <div className="p-4 space-y-2">
                {selectedDay.habits.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune habitude pour ce jour
                  </p>
                ) : (
                  selectedDay.habits.map((habit) => (
                    <div
                      key={habit.habitId}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        habit.status === "done"
                          ? "bg-chart-1/20 border-chart-1/30"
                          : "bg-background border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center",
                          habit.status === "done"
                            ? "bg-chart-1 border-chart-1 text-white"
                            : "bg-background border-muted"
                        )}
                      >
                        {habit.status === "done" && (
                          <CheckIcon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-medium flex-1",
                          habit.status === "done"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {habit.habitName}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-1 rounded-full",
                          habit.status === "done"
                            ? "text-chart-1 bg-chart-1/20"
                            : "text-muted-foreground bg-muted"
                        )}
                      >
                        {habit.status === "done" ? "Fait" : "Non fait"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border p-4">
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Icônes de navigation
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
