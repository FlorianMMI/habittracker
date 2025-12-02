"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import CalendarGrid from "@/app/ui/CalendarGrid";
import WeeklyCalendarGrid from "@/app/ui/WeeklyCalendarGrid";
import DailyHabitCard from "./DailyHabitCard";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import type { CalendarDayData, CalendarMonthData, CalendarDaySummary } from "@/types/calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/Icon";

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = "weekly" | "monthly";

interface DashboardClientProps {
  userId: string;
}

// ============================================================================
// UTILITAIRES DE DATE (utilise les dates locales, pas UTC)
// ============================================================================

/**
 * Formate une date en YYYY-MM-DD en utilisant le fuseau horaire local
 * Évite les problèmes de décalage causés par toISOString() qui utilise UTC
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Crée une date à minuit en local à partir d'une chaîne YYYY-MM-DD
 */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Retourne la date d'aujourd'hui à minuit (local)
 */
function getTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Calcule le lundi de la semaine contenant la date donnée
 */
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = d.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, reculer de 6 jours
  d.setDate(d.getDate() + diff);
  return d;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DashboardClient({ userId }: DashboardClientProps) {
  // ---- États ----
  const [calendarData, setCalendarData] = useState<CalendarMonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right");

  // Cache des données par mois
  const cacheRef = useRef<Map<string, CalendarMonthData>>(new Map());
  const cacheKey = `${currentYear}-${currentMonth}`;

  // Initialiser la date sélectionnée côté client uniquement (évite les problèmes d'hydratation)
  useEffect(() => {
    if (!selectedDate) {
      const today = formatLocalDate(getTodayLocal());
      setSelectedDate(today);
    }
  }, [selectedDate]);

  // Fetch des données du calendrier avec cache
  const fetchCalendarData = useCallback(async (month: number, year: number, forceRefresh = false) => {
    const key = `${year}-${month}`;
    
    // Utiliser le cache si disponible et pas de forceRefresh
    if (!forceRefresh && cacheRef.current.has(key)) {
      setCalendarData(cacheRef.current.get(key)!);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/habits/calendar?month=${month}&year=${year}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du calendrier");
      }

      const data: CalendarMonthData = await response.json();
      
      // Mettre en cache
      cacheRef.current.set(key, data);
      setCalendarData(data);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger le calendrier");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage et quand le mois change
  useEffect(() => {
    fetchCalendarData(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchCalendarData]);

  // Précharger les mois adjacents pour une navigation fluide
  useEffect(() => {
    const preloadAdjacentMonths = async () => {
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      
      // Précharger sans bloquer l'UI
      const prevKey = `${prevYear}-${prevMonth}`;
      const nextKey = `${nextYear}-${nextMonth}`;
      
      if (!cacheRef.current.has(prevKey)) {
        fetch(`/api/habits/calendar?month=${prevMonth}&year=${prevYear}`)
          .then(res => res.json())
          .then(data => cacheRef.current.set(prevKey, data))
          .catch(() => {});
      }
      
      if (!cacheRef.current.has(nextKey)) {
        fetch(`/api/habits/calendar?month=${nextMonth}&year=${nextYear}`)
          .then(res => res.json())
          .then(data => cacheRef.current.set(nextKey, data))
          .catch(() => {});
      }
    };
    
    preloadAdjacentMonths();
  }, [currentMonth, currentYear]);

  // Navigation mois précédent
  const goToPreviousMonth = () => {
    setAnimationDirection("left");
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  // Navigation mois suivant
  const goToNextMonth = () => {
    setAnimationDirection("right");
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Navigation semaine précédente
  const goToPreviousWeek = () => {
    setAnimationDirection("left");
    const current = parseLocalDate(selectedDate);
    current.setDate(current.getDate() - 7);
    setSelectedDate(formatLocalDate(current));

    if (current.getMonth() + 1 !== currentMonth || current.getFullYear() !== currentYear) {
      setCurrentMonth(current.getMonth() + 1);
      setCurrentYear(current.getFullYear());
    }
  };

  // Navigation semaine suivante
  const goToNextWeek = () => {
    setAnimationDirection("right");
    const current = parseLocalDate(selectedDate);
    current.setDate(current.getDate() + 7);
    setSelectedDate(formatLocalDate(current));

    if (current.getMonth() + 1 !== currentMonth || current.getFullYear() !== currentYear) {
      setCurrentMonth(current.getMonth() + 1);
      setCurrentYear(current.getFullYear());
    }
  };

  // Revenir à aujourd'hui
  const goToToday = () => {
    const today = getTodayLocal();
    setSelectedDate(formatLocalDate(today));
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  };

  // Gérer le clic sur un jour
  const handleDayClick = (day: CalendarDaySummary) => {
    if (!day.isFuture) {
      setSelectedDate(day.date);
    }
  };

  // Mettre à jour une habitude dans le cache (temps réel)
  const updateHabitInCache = useCallback(
    (habitId: string, date: string, completed: boolean) => {
      const dateObj = parseLocalDate(date);
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      const key = `${year}-${month}`;

      const cached = cacheRef.current.get(key);
      if (!cached) return;

      const updatedDays = cached.days.map((day) => {
        if (day.date === date) {
          const updatedHabits = day.habits.map((h) => {
            if (h.habitId === habitId) {
              return { ...h, status: completed ? ("done" as const) : ("pending" as const) };
            }
            return h;
          });

          const completedCount = updatedHabits.filter((h) => h.status === "done").length;
          const totalCount = updatedHabits.length;

          return {
            ...day,
            habits: updatedHabits,
            completedHabits: completedCount,
            completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
          };
        }
        return day;
      });

      const updatedData = { ...cached, days: updatedDays };
      cacheRef.current.set(key, updatedData);

      // Mettre à jour l'état si c'est le mois affiché
      if (month === currentMonth && year === currentYear) {
        setCalendarData(updatedData);
      }
    },
    [currentMonth, currentYear]
  );

  // Vérifier si c'est aujourd'hui
  const isToday = useMemo(() => {
    return selectedDate === formatLocalDate(getTodayLocal());
  }, [selectedDate]);

  
  // Obtenir les données du jour sélectionné
  const selectedDayData = useMemo(() => {
    return calendarData?.days.find((d) => d.date === selectedDate) || null;
  }, [calendarData, selectedDate]);

  // Obtenir les jours de la semaine actuelle pour la vue hebdo
  const weekDays = useMemo(() => {
    if (!calendarData || !selectedDate) return [];

    const selected = parseLocalDate(selectedDate);
    const monday = getMondayOfWeek(selected);
    const today = getTodayLocal();
    const todayKey = formatLocalDate(today);

    const days: CalendarDayData[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateKey = formatLocalDate(d);

      const dayData = calendarData.days.find((day) => day.date === dateKey);
      if (dayData) {
        days.push(dayData);
      } else {
        // Jour hors du mois actuel - créer données vides
        days.push({
          date: dateKey,
          dayNumber: d.getDate(),
          isToday: dateKey === todayKey,
          isFuture: d > today,
          isCurrentMonth: false,
          totalHabits: 0,
          completedHabits: 0,
          completionRate: 0,
          habits: [],
        });
      }
    }

    return days;
  }, [calendarData, selectedDate]);

  // Formater la date pour l'affichage
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "";
    const d = parseLocalDate(dateString);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Skeleton de chargement (aussi affiché pendant l'initialisation de selectedDate)
  if ((loading && !calendarData) || !selectedDate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
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
          onClick={() => fetchCalendarData(currentMonth, currentYear, true)}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation et toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground capitalize">
            {viewMode === "monthly"
              ? `${calendarData?.monthName} ${currentYear}`
              : `Semaine du ${formatDisplayDate(weekDays[0]?.date || selectedDate)}`}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Hebdo/Mensuel */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("weekly")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                viewMode === "weekly"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                viewMode === "monthly"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mois
            </button>
          </div>

          {/* Bouton Aujourd'hui */}
          {!isToday && (
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
              onClick={viewMode === "monthly" ? goToPreviousMonth : goToPreviousWeek}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={viewMode === "monthly" ? "Mois précédent" : "Semaine précédente"}
            >
              <ChevronLeftIcon className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={viewMode === "monthly" ? goToNextMonth : goToNextWeek}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={viewMode === "monthly" ? "Mois suivant" : "Semaine suivante"}
            >
              <ChevronRightIcon className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendrier avec animation */}
      <AnimatePresence mode="wait">
        <div
          
        >
          {viewMode === "monthly" && calendarData && (
            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              days={calendarData.days}
              onDayClick={handleDayClick}
              selectedDate={selectedDate}
            />
          )}
          
          {viewMode === "weekly" && (
            <WeeklyCalendarGrid
              days={weekDays}
              onDayClick={handleDayClick}
              selectedDate={selectedDate}
            />
          )}
        </div>
      </AnimatePresence>

      {/* Section des habitudes du jour sélectionné */}
      <div className="border-t border-border pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">
                {isToday ? "Mes habitudes d'aujourd'hui" : `Mes habitudes du ${formatDisplayDate(selectedDate)}`}
              </h3>
              
              {selectedDayData && selectedDayData.totalHabits > 0 && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {selectedDayData.completedHabits}/{selectedDayData.totalHabits}
                  </div>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        selectedDayData.completionRate === 100
                          ? "bg-chart-1"
                          : selectedDayData.completionRate > 0
                          ? "bg-amber-400"
                          : "bg-destructive"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedDayData.completionRate}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Liste des habitudes */}
            {selectedDayData && selectedDayData.habits.length > 0 ? (
              <div className="space-y-3">
                {selectedDayData.habits.map((habit) => (
                  <DailyHabitCard
                    key={habit.habitId}
                    habitId={habit.habitId}
                    habitName={habit.habitName}
                    initialCompleted={habit.status === "done"}
                    date={selectedDate}
                    isFuture={selectedDayData.isFuture}
                    onToggle={(completed: boolean) => updateHabitInCache(habit.habitId, selectedDate, completed)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {selectedDayData?.isFuture 
                    ? "Ce jour n'est pas encore arrivé" 
                    : "Aucune habitude pour ce jour."}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


