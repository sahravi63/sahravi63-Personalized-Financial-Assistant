const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

// Add a new expense (Authenticated route)
router.post('/expenses', authenticateToken, async (req, res) => {
    try {
        const { description, amount } = req.body;

        // Validation check for description and amount
        if (!description || amount === undefined) {
            return res.status(400).json({ error: 'Description and amount are required' });
        }

        // Check if expenses is defined, initialize if not
        if (!req.user.expenses) {
            req.user.expenses = [];
        }

        const newExpense = { description, amount, date: new Date() };
        req.user.expenses.push(newExpense); // Add to user's expenses

        await req.user.save(); // Save the user with new expense

        res.status(201).json({ expenses: req.user.expenses });
    } catch (error) {
        console.error(error); // Better error logging
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// Get all expenses for the logged-in user (Authenticated route)
router.get('/expenses', authenticateToken, async (req, res) => {
    try {
        res.status(200).json(req.user.expenses || []); // Return empty array if no expenses
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Update an expense (Authenticated route)
router.put('/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id: expenseId } = req.params;
        const { description, amount } = req.body;

        const expense = req.user.expenses.id(expenseId);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Update only fields provided
        if (description) expense.description = description;
        if (amount !== undefined) expense.amount = amount;

        await req.user.save(); // Save the updated document

        res.status(200).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

// Delete an expense (Authenticated route)
// Delete an expense (Authenticated route)
router.delete('/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id: expenseId } = req.params;

        // Find the index of the expense in the user's expenses array
        const expenseIndex = req.user.expenses.findIndex(expense => expense._id.toString() === expenseId);

        if (expenseIndex === -1) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Remove the expense using splice
        req.user.expenses.splice(expenseIndex, 1);
        await req.user.save(); // Save the updated user document

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});


module.exports = router;
