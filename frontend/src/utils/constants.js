export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'Entertainment', 'Rent', 'Education', 'Others'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Others'];

export const CAT_ICONS = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Utilities: '⚡',
  Health: '🏥', Entertainment: '🎬', Rent: '🏠', Education: '📚',
  Others: '📦', Salary: '💼', Freelance: '💻', Business: '🏢',
  Investment: '📈', Gift: '🎁',
};

export const CAT_COLORS = [
  '#378ADD', '#1D9E75', '#E24B4A', '#BA7517', '#D4537E',
  '#7F77DD', '#639922', '#D85A30', '#888780', '#185FA5', '#0F6E56',
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const fmt = (n) =>
  '₹' + Math.round(n || 0).toLocaleString('en-IN');

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
