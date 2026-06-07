import { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useFinance } from '../context/FinanceContext';
import TransactionItem from '../components/TransactionItem';
import { fmt, MONTH_NAMES, CAT_COLORS, CAT_ICONS } from '../utils/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Reports() {
  const { summary, transactions, loading, month, year, changeMonth } = useFinance();

  useEffect(() => {}, []);

  const goPrev = () => {
    if (month === 0) changeMonth(11, year - 1);
    else changeMonth(month - 1, year);
  };
  const goNext = () => {
    if (month === 11) changeMonth(0, year + 1);
    else changeMonth(month + 1, year);
  };

  const catEntries = Object.entries(summary.byCategory || {})
    .filter(([, v]) => v.expense > 0)
    .sort((a, b) => b[1].expense - a[1].expense);

  const barData = {
    labels: catEntries.map(([k]) => k),
    datasets: [{
      label: 'Spent',
      data: catEntries.map(([, v]) => v.expense),
      backgroundColor: CAT_COLORS.slice(0, catEntries.length),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const stats = [
    { label: 'Income', value: fmt(summary.income), color: 'text-green-600' },
    { label: 'Expenses', value: fmt(summary.expense), color: 'text-red-500' },
    { label: 'Savings', value: fmt(summary.savings), color: 'text-blue-600' },
    { label: 'Savings Rate', value: `${summary.savingsRate || 0}%`, color: 'text-purple-600' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Monthly Report</h1>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={goPrev}><i className="ti ti-chevron-left" aria-hidden="true" /></button>
          <span className="text-sm font-medium min-w-32 text-center">{MONTH_NAMES[month]} {year}</span>
          <button className="btn" onClick={goNext}><i className="ti ti-chevron-right" aria-hidden="true" /></button>
        </div>
      </div>

      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, color }) => (
              <div key={label} className="stat-card">
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className={`text-xl font-semibold font-mono ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {catEntries.length > 0 && (
            <div className="card mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Spending by Category</h3>
              <div className="h-48">
                <Bar data={barData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { ticks: { callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.05)' } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                  }
                }} />
              </div>

              <div className="mt-4 space-y-3">
                {catEntries.map(([cat, v], i) => {
                  const pct = summary.expense > 0 ? Math.round((v.expense / summary.expense) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{CAT_ICONS[cat]} {cat}</span>
                        <span className="font-mono text-gray-500">{fmt(v.expense)} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CAT_COLORS[i % CAT_COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">All Transactions</h3>
            {transactions.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {[...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => <TransactionItem key={t._id} txn={t} />)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-300 text-sm">No transactions this month</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
