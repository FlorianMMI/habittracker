import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

// Stub: simple JSON file storage for users (replace with real DB later)
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  createdAt: string;
  isValidated?: boolean;
  verifyToken?: string | null;
  verifyTokenExpires?: string | null;
}

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readUsers(): Promise<User[]> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<User> {
  const users = await readUsers();

  // Check if user exists
  const existing = users.find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );
  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    email: data.email,
    password: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    createdAt: new Date().toISOString(),
    isValidated: false,
    verifyToken: null,
    verifyTokenExpires: null,
  };

  users.push(newUser);
  await writeUsers(users);

  return newUser;
}

export async function setUserVerificationToken(
  userId: string,
  token: string,
  expiresAtISO: string
): Promise<void> {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");
  // @ts-ignore
  users[idx].verifyToken = token;
  // @ts-ignore
  users[idx].verifyTokenExpires = expiresAtISO;
  // @ts-ignore
  users[idx].isValidated = false;
  await writeUsers(users as User[]);
}

export async function verifyUserByEmailAndToken(
  email: string,
  token: string
): Promise<boolean> {
  const users = await readUsers();
  const idx = users.findIndex(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (idx === -1) return false;
  const user = users[idx] as any;
  if (!user.verifyToken || user.verifyToken !== token) return false;
  if (user.verifyTokenExpires && new Date(user.verifyTokenExpires) < new Date())
    return false;

  user.isValidated = true;
  user.verifyToken = null;
  user.verifyTokenExpires = null;

  users[idx] = user;
  await writeUsers(users as User[]);
  return true;
}
