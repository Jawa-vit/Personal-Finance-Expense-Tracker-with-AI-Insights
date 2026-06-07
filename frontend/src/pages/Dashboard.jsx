import { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { useFinance } from '../context/FinanceContext';
import TransactionItem from '../components/TransactionItem';
import AddTransactionModal from '../components/AddTransactionModal';
import { fmt, MONTH_NAMES, CAT_COLORS, CAT_ICONS } from '../utils/constants';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { summary, transactions, loading, fetchAll, month, year } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [trend, setTrend] = useState([]);

  useEffect(() => { fetchAll(); loadTrend(); }, []);

  const loadTrend = async () => {
    try {
      const { data } = await axios.get('/api/transactions/trend?months=6');
      setTrend(data.trend);
    } catch {}
  };

  // Build trend chart data
  const trendLabels = [];
  const trendIncome = [];
  const trendExpense = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mo = d.getMonth() + 1;
    const yr = d.getFullYear();
    trendLabels.push(MONTH_NAMES[d.getMonth()].slice(0, 3));
    trendIncome.push(trend.find(t => t._id.month === mo && t._id.year === yr && t._id.type === 'income')?.total || 0);
    trendExpense.push(trend.find(t => t._id.month === mo && t._id.year === yr && t._id.type === 'expense')?.total || 0);
  }

  const lineData = {
    labels: trendLabels,
    datasets: [
      { label: 'Income', data: trendIncome, borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 },
      { label: 'Expenses', data: trendExpense, borderColor: '#E24B4A', backgroundColor: 'rgba(226,75,74,.07)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 },
    ],
  };

  // Donut data
  const catEntries = Object.entries(summary.byCategory || {})
    .filter(([, v]) => v.expense > 0)
    .sort((a, b) => b[1].expense - a[1].expense);

  const donutData = {
    labels: catEntries.map(([k]) => k),
    datasets: [{ data: catEntries.map(([, v]) => v.expense), backgroundColor: CAT_COLORS, borderWidth: 0, hoverOffset: 4 }],
  };

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const stats = [
    { label: 'Total Income', value: fmt(summary.income), color: 'text-green-600', icon: 'ti-trending-up' },
    { label: 'Total Expenses', value: fmt(summary.expense), color: 'text-red-500', icon: 'ti-trending-down' },
    { label: 'Net Savings', value: fmt(summary.savings), color: 'text-blue-600', icon: 'ti-piggy-bank' },
    { label: 'Savings Rate', value: `${summary.savingsRate || 0}%`, color: 'text-purple-600', icon: 'ti-percentage' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400">{MONTH_NAMES[month]} {year}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" aria-hidden="true" /> Add Transaction
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, color, icon }) => (
              <div key={label} className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{label}</span>
                  <i className={`ti ${icon} text-base text-gray-300`} aria-hidden="true" />
                </div>
                <div className={`text-2xl font-semibold font-mono ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 mb-4">6-Month Trend</h3>
              <div className="h-44">
                <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => v >= 1000 ? (v / 1000) + 'k' : v, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.05)' } }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } } }} />
              </div>
              <div className="flex gap-4 mt-3">
                {['Income', 'Expenses'].map((l, i) => (
                  <span key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: i === 0 ? '#1D9E75' : '#E24B4A' }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Spending by Category</h3>
              {catEntries.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {catEntries.slice(0, 5).map(([cat], i) => (
                      <span key={cat} className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[i] }} />{cat}
                      </span>
                    ))}
                  </div>
                  <div className="h-36">
                    <Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } }} />
                  </div>
                </>
              ) : (
                <div className="h-44 flex items-center justify-center text-gray-300 text-sm">No expense data</div>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Transactions</h3>
            {recent.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recent.map((t) => <TransactionItem key={t._id} txn={t} />)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-300 text-sm">No transactions yet</div>
            )}
          </div>
        </>
      )}

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
