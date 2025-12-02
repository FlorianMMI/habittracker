import { prisma } from "./prisma";

export type Frequency = "daily" | "weekly";

export interface Tag {
  id: string;
  name: string;
  emoji: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  frequency: Frequency;
  createdAt: Date;
  tags?: Tag[];
}

export async function getHabitsByUser(userId: string): Promise<Habit[]> {
  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { tags: true },
  });
  return habits as Habit[];
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const habit = await prisma.habit.findUnique({
    where: { id },
    include: { tags: true },
  });
  return habit as Habit | null;
}

export async function getAllTags(): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
  return tags as Tag[];
}

export async function createTag(data: { name: string; emoji: string }): Promise<Tag> {
  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      emoji: data.emoji,
    },
  });
  return tag as Tag;
}

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
