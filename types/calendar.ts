/**
 * Types pour le calendrier mensuel (US-014)
 */

export interface HabitStatus {
  habitId: string;
  habitName: string;
  status: "done" | "pending";
}

export interface CalendarDayData {
  date: string;
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  habits: HabitStatus[];
}

export interface CalendarMonthData {
  month: number;
  year: number;
  monthName: string;
  days: CalendarDayData[];
}

/**
 * Type simplifié pour la grille (sans les détails des habitudes)
 */
export interface CalendarDaySummary {
  date: string;
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
}
