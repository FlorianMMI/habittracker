import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Représentation minimale d'un utilisateur telle qu'utilisée côté application.
 * - `password` contient le hash (ne jamais stocker de mot de passe en clair).
 * - `isValidated` indique si l'utilisateur a confirmé son e‑mail.
 */
export interface User {
  id: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  createdAt: Date;
  isValidated?: boolean;
  verifyToken?: string | null;
  verifyTokenExpires?: Date | null;
}

/**
 * Récupère un utilisateur par email (normalisé en minuscules).
 *
 * @param {string} email - Adresse e‑mail (sera transformée en minuscules).
 * @returns {Promise<User|null>} L'utilisateur ou `null` si non trouvé.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

/**
 * Crée un nouvel utilisateur.
 * - Vérifie qu'aucun utilisateur n'existe déjà pour cet e‑mail.
 * - Hash le mot de passe avec bcrypt (10 rounds).
 * - Initialise `isValidated` à `false` (requiert vérification e‑mail).
 *
 * @param {{ email: string; password: string; firstName: string; lastName: string }} data
 * @returns {Promise<User>} L'utilisateur créé.
 * @throws {Error} Si l'e‑mail existe déjà.
 */
export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<User> {
  // Check if user exists (email normalisé)
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  
  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      isValidated: false,
    },
  });

  return newUser;
}

/**
 * Associe un token de vérification à un utilisateur (utilisé pour l'email de confirmation).
 * Met à jour la date d'expiration et force `isValidated` à `false`.
 *
 * @param {string} userId - ID de l'utilisateur.
 * @param {string} token - Token de vérification (généré côté service d'envoi d'email).
 * @param {Date} expiresAt - Date d'expiration du token.
 * @returns {Promise<void>}
 */
export async function setUserVerificationToken(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      verifyToken: token,
      verifyTokenExpires: expiresAt,
      isValidated: false,
    },
  });
}

/**
 * Vérifie un utilisateur par e‑mail et token de validation.
 * - Normalise l'e‑mail en minuscules.
 * - Vérifie la correspondance du token et la non‑expiraton.
 * - Si validé, met à jour `isValidated` et supprime le token.
 *
 * @param {string} email - Adresse e‑mail.
 * @param {string} token - Token envoyé par e‑mail.
 * @returns {Promise<boolean>} `true` si vérification réussie, sinon `false`.
 */
export async function verifyUserByEmailAndToken(
  email: string,
  token: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) return false;
  if (!user.verifyToken || user.verifyToken !== token) return false;
  if (user.verifyTokenExpires && user.verifyTokenExpires < new Date()) {
    return false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isValidated: true,
      verifyToken: null,
      verifyTokenExpires: null,
    },
  });

  return true;
}
