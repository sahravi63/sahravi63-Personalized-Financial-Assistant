const User = require('../db/User');

// Add a new expense to a user
const addExpense = async (req, res) => {
  try {
    const { description, amount } = req.body;
    const userId = req.user.id; // Get userId from authenticated user

    if (!description || amount === undefined) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newExpense = { description, amount, date: Date.now() }; // Add date
    user.expenses.push(newExpense);

    await user.save(); // Save the updated user document

    res.status(201).json({ expenses: user.expenses });
  } catch (error) {
    console.error('Error adding expense:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

// Get all expenses for a specific user
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated user

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.expenses); // Return the user's embedded expenses
  } catch (error) {
    console.error('Error fetching expenses:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Update an existing expense for a user
const updateExpense = async (req, res) => {
  try {
    const { id: expenseId } = req.params;
    const { description, amount } = req.body;
    const userId = req.user.id; // Get userId from authenticated user

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expense = user.expenses.id(expenseId); // Get the specific expense by its ID
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update expense details
    if (description) expense.description = description;
    if (amount !== undefined) expense.amount = amount;

    await user.save(); // Save the updated user document

    res.status(200).json(expense);
  } catch (error) {
    console.error('Error updating expense:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// Delete an expense for a user
const deleteExpense = async (req, res) => {
  try {
    const { id: expenseId } = req.params;
    const userId = req.user.id; // Get userId from authenticated user

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expense = user.expenses.id(expenseId); // Find the expense by its ID
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    expense.remove(); // Remove the expense from the user's expenses array

    await user.save(); // Save the updated user document

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

module.exports = { addExpense, getExpenses, updateExpense, deleteExpense };
