import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Compose et fusionne des classes Tailwind/HTML.
 * Utilise `clsx` pour composer conditionnellement et `tailwind-merge`
 * pour résoudre les conflits de classes Tailwind (par ex. `p-2 p-4`).
 *
 * @param {...ClassValue[]} inputs - Liste d'entrées acceptées par `clsx`.
 * @returns {string} - Chaîne finale de classes fusionnées.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// UTILITAIRES DE DATE (dates locales, pas UTC)
// ============================================================================

/**
 * Formate une date en `YYYY-MM-DD` en utilisant le fuseau horaire local.
 *
 * Important : ce format est utilisé comme clé/identifiant (ex. pour stocker
 * la progression d'une habitude par jour). On évite `toISOString()` car il
 * convertit en UTC et peut produire un jour décalé selon le fuseau.
 *
 * @param {Date} date - Objet Date en entrée (peut contenir heure).
 * @returns {string} Chaîne formatée `YYYY-MM-DD` (locale).
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse une chaîne `YYYY-MM-DD` et renvoie une `Date` positionnée à minuit
 * dans le fuseau local (heure 00:00:00.000).
 *
 * @param {string} dateString - Chaîne au format `YYYY-MM-DD`.
 * @returns {Date} Objet Date à minuit (locale).
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Retourne la date d'aujourd'hui positionnée à minuit (locale).
 * Utile pour normaliser les comparaisons journalières sans tenir compte de l'heure.
 *
 * @returns {Date} Date d'aujourd'hui à 00:00:00.000 (locale).
 */
export function getTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Calcule le lundi de la semaine contenant la date fournie.
 * Renvoie une `Date` à minuit (locale) correspondant au lundi.
 *
 * Règle : la semaine est considérée du lundi (1) au dimanche (0).
 * Si la date est un dimanche (`getDay() === 0`), on recule de 6 jours pour
 * obtenir le lundi précédent.
 *
 * @param {Date} date - Date de référence.
 * @returns {Date} Date du lundi de la même semaine (00:00 locale).
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = d.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, reculer de 6 jours
  d.setDate(d.getDate() + diff);
  return d;
}
