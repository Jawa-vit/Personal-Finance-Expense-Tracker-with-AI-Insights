const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getTrend,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(protect); // All transaction routes require auth

router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/summary', getMonthlySummary);
router.get('/trend', getTrend);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
