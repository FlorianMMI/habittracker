import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// UTILITAIRES DE DATE (dates locales, pas UTC)
// ============================================================================

/**
 * Formate une date en YYYY-MM-DD en utilisant le fuseau horaire local
 * Évite les problèmes de décalage causés par toISOString() qui utilise UTC
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Crée une date à minuit en local à partir d'une chaîne YYYY-MM-DD
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Retourne la date d'aujourd'hui à minuit (local)
 */
export function getTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Calcule le lundi de la semaine contenant la date donnée
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = d.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, reculer de 6 jours
  d.setDate(d.getDate() + diff);
  return d;
}
