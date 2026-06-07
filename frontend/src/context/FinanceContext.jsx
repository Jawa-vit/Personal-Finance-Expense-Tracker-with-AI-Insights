import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, savings: 0, savingsRate: 0, byCategory: {} });
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async (m = month, y = year) => {
    setLoading(true);
    try {
      const [txnRes, sumRes, budRes] = await Promise.all([
        axios.get(`/api/transactions?month=${m}&year=${y}`),
        axios.get(`/api/transactions/summary?month=${m}&year=${y}`),
        axios.get(`/api/budgets?month=${m}&year=${y}`),
      ]);
      setTransactions(txnRes.data.transactions);
      setSummary(sumRes.data.summary);
      setBudget(budRes.data.budget);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const addTransaction = async (data) => {
    const { data: res } = await api.post('/api/transactions', data);
    toast.success('Transaction added!');
    await fetchAll();
    return res.transaction;
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/api/transactions/${id}`);
    toast.success('Transaction deleted');
    await fetchAll();
  };

  const saveBudget = async (categories) => {
    const { data: res } = await api.post('/api/budgets', { month, year, categories });
    setBudget(res.budget);
    toast.success('Budget saved!');
  };

  const changeMonth = (m, y) => {
    setMonth(m);
    setYear(y);
    fetchAll(m, y);
  };

  return (
    <FinanceContext.Provider value={{
      month, year, transactions, summary, budget, loading,
      fetchAll, addTransaction, deleteTransaction, saveBudget, changeMonth,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};
