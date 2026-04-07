'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { QueryForm } from '@/components/QueryForm';
import { ResultsPanel } from '@/components/ResultsPanel';

export default function Home() {
  const { data: session, status } = useSession();
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(1);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [querySubmitted, setQuerySubmitted] = useState(false);

  // Fetch attempts left on load
  useEffect(() => {
    if (session) {
      fetch('/api/attempts')
        .then(res => res.json())
        .then(data => {
          if (data.attemptsLeft !== undefined) {
            setAttemptsLeft(data.attemptsLeft);
          }
        })
        .catch(err => console.error('Failed to fetch attempts:', err));
    }
  }, [session]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
    return null;
  }

  const handleQuerySubmit = async (query) => {
    if (attemptsLeft === 0) {
      setError('You have used your 1 attempt. Please try again later.');
      return;
    }

    setLoading(true);
    setError(null);
    setSteps([]);
    setCurrentAgent(null);
    setCompleted(false);
    setQuerySubmitted(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: query }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to process query');
        setLoading(false);
        return;
      }

      // Attempt consumed successfully
      setAttemptsLeft(attemptsLeft - 1);

      // Handle server-sent events for streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processEvents = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'step') {
                    // Set current agent
                    setCurrentAgent(data.payload);
                    
                    // Add to steps after a small delay to show live status
                    setTimeout(() => {
                      setSteps((prev) => [...prev, data.payload]);
                      setCurrentAgent(null);
                    }, 500);
                  } else if (data.type === 'complete') {
                    setAttemptsLeft(0);
                    setCurrentAgent(null);
                    setCompleted(true);
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        } catch (err) {
          setError(err.message || 'Connection error');
        } finally {
          setLoading(false);
        }
      };

      await processEvents();
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
                🚀 Multi-Agent Universe
              </h1>
              <p className="text-slate-400 text-lg">
                Submit your query and watch AI agents collaborate to solve it
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{session.user.name}</p>
                <p className="text-slate-400 text-sm">{session.user.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          {attemptsLeft === 0 && (
            <p className="text-red-400 mt-4 font-semibold">❌ You've used your 1 allowed attempt</p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <QueryForm 
            onSubmit={handleQuerySubmit} 
            disabled={loading || attemptsLeft === 0} 
            loading={loading}
            completed={completed}
            attemptsLeft={attemptsLeft}
          />
          <ResultsPanel
            steps={steps}
            loading={loading}
            error={error}
            currentAgent={currentAgent}
            completed={completed}
          />
        </div>
      </div>
    </main>
  );
}
