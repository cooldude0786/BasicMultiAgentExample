'use client';

import { useState } from 'react';

// Simple markdown to React renderer
function MarkdownRenderer({ text }) {
  const lines = text.split('\n');
  const elements = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith('###')) {
      elements.push(
        <h3 key={i} className="text-sm font-semibold text-blue-300 mt-3 mb-2">
          {line.replace(/^#+\s/, '')}
        </h3>
      );
    } else if (line.startsWith('##')) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-blue-200 mt-4 mb-2">
          {line.replace(/^#+\s/, '')}
        </h2>
      );
    }
    // Bullet points
    else if (line.trim().startsWith('-')) {
      elements.push(
        <div key={i} className="ml-4 mb-1">
          <span className="text-slate-300">{line.replace(/^-\s/, '• ')}</span>
        </div>
      );
    }
    // Bold and italic text
    else if (line.trim()) {
      const processedLine = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');

      elements.push(
        <p key={i} className="text-slate-300 mb-2">
          {processedLine.split('strong').length > 1 ? (
            <span dangerouslySetInnerHTML={{ __html: processedLine }} />
          ) : (
            processedLine
          )}
        </p>
      );
    } else {
      elements.push(<div key={i} className="mb-2"></div>);
    }

    i++;
  }

  return <div className="text-sm space-y-1">{elements}</div>;
}

function AgentStep({ step, idx, isExpanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 hover:bg-slate-700/50 cursor-pointer transition-all"
    >
      {/* Collapsed view */}
      {!isExpanded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-purple-400">
              🤖 {step.agent.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">{step.task.substring(0, 50)}...</span>
          </div>
          <span className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded">
            ✅
          </span>
        </div>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-400">
              🤖 STEP {idx + 1}: {step.agent.toUpperCase()}
            </span>
            <span className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded">
              ✅ Complete
            </span>
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">📥 Input</p>
            <p className="text-xs text-slate-300 bg-slate-800 p-2 rounded border border-slate-600">
              {step.task}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">📤 Output</p>
            <div className="text-xs text-slate-300 bg-slate-800 p-3 rounded border border-slate-600 max-h-40 overflow-y-auto">
              <MarkdownRenderer text={step.result} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResultsPanel({ steps, loading, error, currentAgent, completed }) {
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleStep = (idx) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Find the last completed step (for final answer)
  const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;

  return (
    <div className="lg:col-span-2">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-700 rounded text-red-300">
            <p className="font-semibold">❌ Error: {error}</p>
          </div>
        )}

        {/* Currently Working */}
        {loading && currentAgent && (
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
              <p className="text-sm text-blue-300 font-semibold">
                🤖 {currentAgent.agent.toUpperCase()} is processing...
              </p>
            </div>
            <p className="text-xs text-blue-300">
              Task: {currentAgent.task}
            </p>
          </div>
        )}

        {/* Conclusion */}
        {completed && lastStep && (
          <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-700/50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-emerald-300 mb-3">✨ Conclusion</h3>
            <p className="text-xs uppercase tracking-wide text-emerald-200 mb-3">Shown after all agents complete</p>
            <div className="text-sm text-slate-200">
              <MarkdownRenderer text={lastStep.result} />
            </div>
          </div>
        )}

        {/* No results state */}
        {steps.length === 0 && !loading && (
          <div className="p-8 text-center text-slate-400">
            <p className="text-lg">📋 Waiting for your query...</p>
            <p className="text-sm mt-2">Submit a query to see agents in action</p>
          </div>
        )}

        {/* Agent Steps (Minimized) */}
        {steps.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">
              🔍 Agent Processing Details ({steps.length} steps)
            </h3>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <AgentStep
                  key={idx}
                  step={step}
                  idx={idx}
                  isExpanded={expandedSteps[idx] || false}
                  onToggle={() => toggleStep(idx)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block mb-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Processing with AI agents...</p>
          </div>
        )}
      </div>
    </div>
  );
}
