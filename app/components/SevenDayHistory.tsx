"use client";

import React, { useState, useEffect } from "react";
import DayCell from "./DayCell";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { CheckIcon } from "@/lib/Icon";

interface HabitStatus {
  habitId: string;
  habitName: string;
  status: "done" | "pending";
}

interface DayHistory {
  date: string;
  displayDate: string;
  isToday: boolean;
  habits: HabitStatus[];
  completionRate: number;
}

interface SevenDayHistoryProps {
  userId?: string;
}

export default function SevenDayHistory({ userId }: SevenDayHistoryProps) {
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayHistory | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/habits/history");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'historique");
      }

      const data = await response.json();
      setHistory(data.history);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (day: DayHistory) => {
    setSelectedDay(day);
  };

  const closeModal = () => {
    setSelectedDay(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Historique des 7 derniers jours
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 sm:w-24 h-32  rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Historique des 7 derniers jours
          </h3>
          <button
            onClick={fetchHistory}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
            aria-label="Actualiser l'historique"
          >
            🔄 Actualiser
          </button>
        </div>

        {/* Calendrier horizontal avec scroll */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {history.map((day) => (
              <DayCell
                key={day.date}
                date={day.date}
                displayDate={day.displayDate}
                isToday={day.isToday}
                completionRate={day.completionRate}
                totalHabits={day.habits.length}
                completedHabits={
                  day.habits.filter((h) => h.status === "done").length
                }
                onClick={() => handleDayClick(day)}
              />
            ))}
          </div>

          {/* Gradient de fade sur les bords (mobile) */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none sm:hidden" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden" />
        </div>

        {/* Légende */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Toutes faites</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>Partiellement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/30" />
            <span>Aucune</span>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
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
                      {selectedDay.displayDate}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDay.habits.filter((h) => h.status === "done").length}{" "}
                      sur {selectedDay.habits.length} habitudes complétées (
                      {selectedDay.completionRate}%)
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-muted-foreground hover:text-foreground text-2xl leading-none"
                    aria-label="Fermer"
                  >
                    ×
                  </button>
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
                          ? "bg-success/50 border-success/30"
                          : ""
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center",
                          habit.status === "done"
                            ? "bg-success border-success text-white"
                            : "bg-background border-muted"
                        )}
                      >
                        {habit.status === "done" && (
                          <CheckIcon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-medium",
                          habit.status === "done"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {habit.habitName}
                      </span>
                      <span
                        className={cn(
                          "ml-auto text-xs font-semibold",
                          habit.status === "done"
                            ? "text-success"
                            : "text-muted-foreground"
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
