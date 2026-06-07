import { useFinance } from '../context/FinanceContext';
import { CAT_ICONS, fmt, fmtDate } from '../utils/constants';

export default function TransactionItem({ txn }) {
  const { deleteTransaction } = useFinance();
  const isIncome = txn.type === 'income';

  return (
    <div className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-gray-50 transition-all group">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
        {CAT_ICONS[txn.category] || '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{txn.description}</div>
        <div className="text-xs text-gray-400">{txn.category} · {fmtDate(txn.date)}</div>
      </div>
      <div className={`font-mono text-sm font-medium flex-shrink-0 ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{fmt(txn.amount)}
      </div>
      <button
        onClick={() => deleteTransaction(txn._id)}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all ml-1"
        aria-label="Delete transaction"
      >
        <i className="ti ti-trash text-base" aria-hidden="true" />
      </button>
    </div>
  );
}
