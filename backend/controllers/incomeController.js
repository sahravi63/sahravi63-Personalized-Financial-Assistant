const User = require('../db/User');

// Add income
exports.addIncome = async (req, res) => {
  const { userId, description, amount } = req.body;

  if (!userId || !description || !amount) {
    return res.status(400).json({ error: 'All fields (userId, description, amount) are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newIncome = {
      description,
      amount,
      date: Date.now(),
    };

    user.incomes.push(newIncome);
    await user.save();

    res.status(201).json({ message: 'Income added successfully', income: newIncome });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all incomes
exports.getIncomes = async (req, res) => {
  const { userId } = req.query; // Assuming userId is passed as a query parameter

  if (!userId) {
    return res.status(400).json({ error: 'UserId is required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update income
exports.updateIncome = async (req, res) => {
  const { userId, incomeId } = req.params;
  const { description, amount } = req.body;

  if (!userId || !incomeId) {
    return res.status(400).json({ error: 'UserId and IncomeId are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const income = user.incomes.id(incomeId);
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    income.description = description || income.description;
    income.amount = amount || income.amount;

    await user.save();

    res.status(200).json({ message: 'Income updated successfully', income });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  const { userId, incomeId } = req.params;

  if (!userId || !incomeId) {
    return res.status(400).json({ error: 'UserId and IncomeId are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const income = user.incomes.id(incomeId);
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    income.remove();
    await user.save();

    res.status(200).json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
