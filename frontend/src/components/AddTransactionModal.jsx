import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function AddTransactionModal({ onClose }) {
  const { addTransaction } = useFinance();
  const [type, setType] = useState('expense');
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleTypeChange = (t) => {
    setType(t);
    setForm((f) => ({ ...f, category: (t === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[0] }));
  };

  const submit = async () => {
    if (!form.description.trim() || !form.amount || !form.date) {
      return toast.error('Please fill in all required fields');
    }
    setSaving(true);
    try {
      await addTransaction({ ...form, type, amount: parseFloat(form.amount) });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  type === t ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Description *</label>
              <input name="description" value={form.description} onChange={handle} className="input" placeholder="e.g. Swiggy order" />
            </div>
            <div>
              <label className="label">Amount (₹) *</label>
              <input name="amount" type="number" value={form.amount} onChange={handle} className="input" placeholder="0" min="0" />
            </div>
            <div>
              <label className="label">Category</label>
              <select name="category" value={form.category} onChange={handle} className="input">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input name="date" type="date" value={form.date} onChange={handle} className="input" />
            </div>
            <div>
              <label className="label">Notes</label>
              <input name="notes" value={form.notes} onChange={handle} className="input" placeholder="Optional" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="btn flex-1">Cancel</button>
          <button onClick={submit} disabled={saving} className="btn btn-primary flex-1">
            {saving ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
