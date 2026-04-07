import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAttempts } from '@/lib/rateLimit.js';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user.id;
    const attemptsLeft = await getAttempts(userId);

    return new Response(
      JSON.stringify({ attemptsLeft }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching attempts:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}