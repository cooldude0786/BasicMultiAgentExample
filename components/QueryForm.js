'use client';

import { useState } from 'react';

export function QueryForm({ onSubmit, disabled, loading, completed, attemptsLeft }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setQuery('');
    }
  };

  const getButtonText = () => {
    if (loading) return '⏳ Processing...';
    if (completed) return '✅ Query Completed';
    if (attemptsLeft === 0) return '❌ No Attempts Left';
    return '🚀 Submit Query';
  };

  const getButtonClass = () => {
    if (loading) return 'w-full bg-gradient-to-r from-slate-600 to-slate-600 text-white font-semibold py-3 rounded-lg transition-all';
    if (completed) return 'w-full bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all';
    if (attemptsLeft === 0) return 'w-full bg-gradient-to-r from-red-600 to-red-600 text-white font-semibold py-3 rounded-lg transition-all';
    return 'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all';
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 sticky top-8">
        <h2 className="text-xl font-semibold mb-4">📝 Your Query</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Analyze Tesla stock and suggest whether to invest"
            className="w-full h-32 bg-slate-700 border border-slate-600 rounded p-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            disabled={disabled}
          />

          <button
            type="submit"
            disabled={disabled || !query.trim()}
            className={getButtonClass()}
          >
            {getButtonText()}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded text-sm text-blue-300">
          <p className="font-semibold mb-2">💡 Info</p>
          <p>You get <strong>{attemptsLeft}</strong> attempt{attemptsLeft !== 1 ? 's' : ''} to use this system. Use it wisely!</p>
        </div>
      </div>
    </div>
  );
}
