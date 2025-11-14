import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

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

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<User> {
  // Check if user exists
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
