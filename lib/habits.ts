import { prisma } from "./prisma";

/**
 * Périodicité d'une habitude.
 */
export type Frequency = "daily" | "weekly";

/**
 * Tag simple utilisable pour catégoriser les habitudes.
 */
export interface Tag {
  id: string;
  name: string;
  emoji: string;
}

/**
 * Représentation d'une habitude dans l'application.
 * `tags` est inclus lors des requêtes avec `include: { tags: true }`.
 */
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  frequency: Frequency;
  createdAt: Date;
  tags?: Tag[];
}

/**
 * Récupère toutes les habitudes d'un utilisateur, triées par date de création
 * (la plus récente en premier). Les tags associés sont inclus.
 *
 * @param {string} userId - ID de l'utilisateur.
 * @returns {Promise<Habit[]>} Liste des habitudes.
 */
export async function getHabitsByUser(userId: string): Promise<Habit[]> {
  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { tags: true },
  });
  return habits as Habit[];
}

/**
 * Récupère une habitude par son ID (inclut les tags).
 *
 * @param {string} id - ID de l'habitude.
 * @returns {Promise<Habit | null>} Habit ou `null` si non trouvé.
 */
export async function getHabitById(id: string): Promise<Habit | null> {
  const habit = await prisma.habit.findUnique({
    where: { id },
    include: { tags: true },
  });
  return habit as Habit | null;
}

/**
 * Récupère tous les tags disponibles (ordre alphabétique).
 *
 * @returns {Promise<Tag[]>} Liste des tags.
 */
export async function getAllTags(): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
  return tags as Tag[];
}

/**
 * Crée un nouveau tag simple.
 *
 * @param {{ name: string; emoji: string }} data - Données du tag.
 * @returns {Promise<Tag>} Tag créé.
 */
export async function createTag(data: { name: string; emoji: string }): Promise<Tag> {
  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      emoji: data.emoji,
    },
  });
  return tag as Tag;
}

/**
 * Trouve un tag existant avec le même `name` et `emoji`, ou le crée.
 * Utilisé pour éviter la duplication de tags lors de la création/édition d'habitudes.
 *
 * @param {{ name: string; emoji: string }} data - Données du tag.
 * @returns {Promise<Tag>} Tag existant ou nouvellement créé.
 */
export async function findOrCreateTag(data: { name: string; emoji: string }): Promise<Tag> {
  // Chercher un tag existant avec le même nom et emoji
  const existingTag = await prisma.tag.findFirst({
    where: {
      name: data.name,
      emoji: data.emoji,
    },
  });

  if (existingTag) {
    return existingTag as Tag;
  }

  // Créer un nouveau tag
  return createTag(data);
}

/**
 * Crée une habitude pour un utilisateur. Si des tags sont fournis, ils
 * sont trouvés ou créés puis connectés à l'habitude.
 *
 * @param {string} userId - ID de l'utilisateur propriétaire.
 * @param {{ name: string; description?: string; frequency?: Frequency; tags?: { name: string; emoji: string }[] }} data
 * @returns {Promise<Habit>} Habit créé (avec `tags` inclus si applicable).
 */
export async function createHabit(
  userId: string,
  data: { name: string; description?: string; frequency?: Frequency; tags?: { name: string; emoji: string }[] }
): Promise<Habit> {
  // D'abord, créer ou trouver les tags
  const tagConnections = data.tags 
    ? await Promise.all(data.tags.map(async (tag) => {
        const foundTag = await findOrCreateTag(tag);
        return { id: foundTag.id };
      }))
    : [];

  const habit = await prisma.habit.create({
    data: {
      userId,
      name: data.name,
      description: data.description || "",
      frequency: data.frequency || "daily",
      tags: {
        connect: tagConnections,
      },
    },
    include: { tags: true },
  });
  return habit as Habit;
}

/**
 * Met à jour une habitude si l'utilisateur en est propriétaire.
 * - Si `tags` est fourni, on *remplace* les tags existants par ceux fournis.
 * - Retourne `null` si l'habitude n'existe pas ou n'appartient pas à l'utilisateur.
 *
 * @param {string} id - ID de l'habitude à modifier.
 * @param {string} userId - ID de l'utilisateur demandant la modification.
 * @param {{ name?: string; description?: string; frequency?: Frequency; tags?: { name: string; emoji: string }[] }} data
 * @returns {Promise<Habit | null>} Habit mis à jour ou `null`.
 */
export async function updateHabit(
  id: string,
  userId: string,
  data: { name?: string; description?: string; frequency?: Frequency; tags?: { name: string; emoji: string }[] }
): Promise<Habit | null> {
  // Check ownership
  const habit = await prisma.habit.findUnique({
    where: { id },
  });

  if (!habit || habit.userId !== userId) {
    return null;
  }

  // Préparer les connexions de tags si fournis
  let tagOperations = {};
  if (data.tags !== undefined) {
    const tagConnections = await Promise.all(
      data.tags.map(async (tag) => {
        const foundTag = await findOrCreateTag(tag);
        return { id: foundTag.id };
      })
    );
    tagOperations = {
      tags: {
        set: [], // Déconnecter tous les tags existants
        connect: tagConnections, // Connecter les nouveaux tags
      },
    };
  }

  const updated = await prisma.habit.update({
    where: { id },
    data: {
      name: data.name ?? habit.name,
      description: data.description ?? habit.description,
      frequency: data.frequency ?? habit.frequency,
      ...tagOperations,
    },
    include: { tags: true },
  });
  return updated as Habit;
}

/**
 * Supprime une habitude.
 * - Vérifie l'existence (ne vérifie pas explicitement la propriété dans
 *   ce code — attention si l'appelant doit garantir l'ownership).
 * - Retourne `false` si l'habitude n'existe pas, `true` si supprimée.
 *
 * @param {string} id - ID de l'habitude à supprimer.
 * @returns {Promise<boolean>} `true` si supprimé, sinon `false`.
 */
export async function deleteHabit(
  id: string,
): Promise<boolean> {
  // Check ownership
  const habit = await prisma.habit.findUnique({
    where: { id },
  });

  if (!habit) {
    return false;
  }

  await prisma.habit.delete({
    where: { id },
  });

  return true;
}
