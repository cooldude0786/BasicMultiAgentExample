import { Orchestrator } from '@/core/orchestrator.js';
import { checkAndUseAttempt } from '@/lib/rateLimit.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { task } = await request.json();

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return new Response(
        JSON.stringify({ message: 'Invalid task provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Check rate limit - 1 attempt per user
    const canProceed = await checkAndUseAttempt(userId);

    if (!canProceed) {
      return new Response(
        JSON.stringify({
          message: 'You have already used your 1 allowed attempt',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create orchestrator
    const orchestrator = new Orchestrator();

    // Use streaming response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          // Override console.log to capture agent outputs
          const originalLog = console.log;
          const outputs = [];

          console.log = (...args) => {
            outputs.push(args.join(' '));
            originalLog(...args);
          };

          // Run orchestration
          await orchestrator.run(task, (stepData) => {
            // Send step data as SSE
            const data = {
              type: 'step',
              payload: stepData,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          });

          // Restore console.log
          console.log = originalLog;

          // Send completion event
          const completeData = { type: 'complete', payload: null };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`)
          );

          controller.close();
        } catch (error) {
          const errorData = {
            type: 'error',
            payload: error.message,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
