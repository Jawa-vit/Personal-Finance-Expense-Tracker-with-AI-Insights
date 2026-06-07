import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, CAT_ICONS, fmt } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Budget() {
  const { summary, budget, saveBudget, fetchAll, month, year } = useFinance();
  const [editing, setEditing] = useState(false);
  const [limits, setLimits] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const defaults = {};
    EXPENSE_CATEGORIES.forEach((c) => { defaults[c] = 5000; });
    if (budget?.categories) {
      budget.categories.forEach(({ name, limit }) => { defaults[name] = limit; });
    }
    setLimits(defaults);
  }, [budget]);

  const catSpending = summary.byCategory || {};

  const handleSave = async () => {
    const categories = Object.entries(limits).map(([name, limit]) => ({ name, limit: parseFloat(limit) || 0 }));
    await saveBudget(categories);
    setEditing(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Budget Planner</h1>
        {editing ? (
          <div className="flex gap-2">
            <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Budgets</button>
          </div>
        ) : (
          <button className="btn" onClick={() => setEditing(true)}>
            <i className="ti ti-settings" aria-hidden="true" /> Edit Budgets
          </button>
        )}
      </div>

      <div className="card space-y-1">
        {EXPENSE_CATEGORIES.map((cat) => {
          const limit = limits[cat] || 0;
          const spent = catSpending[cat]?.expense || 0;
          const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
          const color = pct > 90 ? '#E24B4A' : pct > 70 ? '#BA7517' : '#1D9E75';
          const badgeClass = pct > 90 ? 'bg-red-100 text-red-700' : pct > 70 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
          const badgeLabel = pct > 90 ? 'Over budget!' : pct > 70 ? 'Warning' : 'On track';

          return (
            <div key={cat} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
              <div className="text-xl w-7 text-center">{CAT_ICONS[cat]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                  <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{pct}% used</span>
                  <span className="text-xs font-mono text-gray-500">{fmt(spent)} / {fmt(limit)}</span>
                </div>
              </div>
              {editing && (
                <div className="flex-shrink-0">
                  <input
                    type="number"
                    value={limits[cat] || ''}
                    onChange={(e) => setLimits((l) => ({ ...l, [cat]: e.target.value }))}
                    className="input w-28 text-right font-mono"
                    placeholder="0"
                    min="0"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
