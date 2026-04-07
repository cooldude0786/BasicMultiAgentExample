// Database-based rate limiter
import { prisma } from '@/lib/prisma';

/**
 * Check if user has attempts left and consume one
 * Returns true if user can proceed, false if rate limited
 */
export async function checkAndUseAttempt(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { attemptsUsed: true }
  });

  if (!user) {
    return false; // User not found
  }

  if (user.attemptsUsed >= 1) {
    return false; // Already used attempt
  }

  // Increment attempts used
  await prisma.user.update({
    where: { id: userId },
    data: { attemptsUsed: { increment: 1 } }
  });

  return true;
}

/**
 * Get remaining attempts for a user
 */
export async function getAttempts(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { attemptsUsed: true }
  });

  if (!user) {
    return 1;
  }

  return Math.max(0, 1 - user.attemptsUsed);
}

/**
 * Check attempt status without consuming
 */
export async function checkAttempt(userId) {
  const attempts = await getAttempts(userId);
  return attempts > 0;
}
