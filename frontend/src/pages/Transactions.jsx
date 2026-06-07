import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import TransactionItem from '../components/TransactionItem';
import AddTransactionModal from '../components/AddTransactionModal';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

const ALL_CATS = ['All', ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES.filter(c => !EXPENSE_CATEGORIES.includes(c))];

export default function Transactions() {
  const { transactions, loading, fetchAll } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const filtered = transactions.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (catFilter && catFilter !== 'All' && t.category !== catFilter) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Transactions</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" aria-hidden="true" /> Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-36">
          <option value="">All types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input w-40">
          {ALL_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filtered.map((t) => <TransactionItem key={t._id} txn={t} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-300">
            <i className="ti ti-receipt-off text-4xl block mb-2" aria-hidden="true" />
            No transactions found
          </div>
        )}
      </div>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
