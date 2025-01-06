// utils/generateUsername.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateUniqueUsername(email: string): Promise<string> {
  // Extract base username from email
  const baseUsername = email.split('@')[0].toLowerCase();
  
  // Try using just the base username first
  const existingBase = await prisma.auth_credentials.findFirst({
    where: { username: baseUsername }
  });

  if (!existingBase) {
    return baseUsername;
  }

  // If base username exists, try adding a random number
  for (let attempt = 1; attempt <= 3; attempt++) {
    // For each attempt, increase the number of digits
    const maxNum = Math.pow(10, attempt) - 1; // 9, 99, 999
    const randomNum = Math.floor(Math.random() * maxNum) + 1;
    const candidateUsername = `${baseUsername}${randomNum}`;

    const existing = await prisma.auth_credentials.findFirst({
      where: { username: candidateUsername }
    });

    if (!existing) {
      return candidateUsername;
    }
  }

  // If all attempts fail, use timestamp to ensure uniqueness
  const timestamp = Date.now();
  return `${baseUsername}${timestamp}`;
}