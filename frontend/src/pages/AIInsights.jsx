import { useState } from 'react';
import axios from 'axios';
import { useFinance } from '../context/FinanceContext';

const TYPE_STYLES = {
  tip: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-700' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-700' },
  good: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-700' },
  info: { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-700' },
};

export default function AIInsights() {
  const { summary, month, year } = useFinance();
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const getInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data } = await axios.post('/api/ai/insights', { month, year });
      setInsights(data.insights);
    } catch {
      setInsights([{ icon: '⚠️', title: 'Error', insight: 'Failed to load insights. Check your API key.', type: 'warning' }]);
    } finally {
      setLoadingInsights(false);
    }
  };

  const askAI = async () => {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion('');
    setChatHistory((h) => [...h, { role: 'user', text: q }]);
    setChatLoading(true);
    try {
      const { data } = await axios.post('/api/ai/chat', {
        question: q,
        context: { income: summary.income, expense: summary.expense, savings: summary.savings, byCategory: summary.byCategory },
      });
      setChatHistory((h) => [...h, { role: 'ai', text: data.answer }]);
    } catch {
      setChatHistory((h) => [...h, { role: 'ai', text: 'Sorry, failed to get a response. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const suggestions = [
    'How can I reduce my food expenses?',
    'Am I saving enough for retirement?',
    'What categories should I cut back on?',
    'How do I build an emergency fund?',
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">AI Insights</h1>
          <p className="text-sm text-gray-400">Powered by Claude</p>
        </div>
        <button className="btn btn-primary" onClick={getInsights} disabled={loadingInsights}>
          <i className="ti ti-robot" aria-hidden="true" />
          {loadingInsights ? 'Analyzing...' : 'Get Insights'}
        </button>
      </div>

      {/* Insights */}
      {loadingInsights ? (
        <div className="card mb-6 flex items-center gap-3 text-gray-400">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          Analyzing your finances...
        </div>
      ) : insights.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {insights.map((ins, i) => {
            const s = TYPE_STYLES[ins.type] || TYPE_STYLES.info;
            return (
              <div key={i} className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
                <div className={`font-medium text-sm mb-1 ${s.title}`}>{ins.icon} {ins.title}</div>
                <p className="text-sm text-gray-700 leading-relaxed">{ins.insight}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card mb-6 text-center py-10 text-gray-300">
          <i className="ti ti-robot text-5xl block mb-3" aria-hidden="true" />
          <p className="text-sm">Click "Get Insights" to analyse your spending</p>
        </div>
      )}

      {/* Chat */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Ask AI anything about your finances</h3>

        {/* Suggestion chips */}
        {chatHistory.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuestion(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Chat history */}
        {chatHistory.length > 0 && (
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {chatHistory.map((m, i) => (
              <div key={i} className={`text-sm rounded-xl px-4 py-3 ${
                m.role === 'user'
                  ? 'bg-brand-500 text-white ml-8'
                  : 'bg-gray-50 text-gray-700 mr-8 border border-gray-100'
              }`}>
                {m.role === 'ai' && <span className="font-medium text-brand-600">AI: </span>}
                {m.text}
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mr-8 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
                Thinking...
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askAI()}
            placeholder="e.g. How can I save more on food?"
            className="input flex-1"
          />
          <button className="btn btn-primary px-4" onClick={askAI} disabled={chatLoading}>
            <i className="ti ti-send" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
