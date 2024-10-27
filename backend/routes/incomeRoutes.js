const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../db/User'); // Ensure this imports your User model

// Add a new income (Authenticated route)
router.post('/income', authenticateToken, async (req, res) => {
    try {
        const { description, amount } = req.body;

        // Validation check for description and amount
        if (!description || amount === undefined) {
            return res.status(400).json({ error: 'Description and amount are required' });
        }

        const userId = req.user.id; // Get userId from authenticated user

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newIncome = { description, amount, date: new Date() }; // Add date
        user.incomes.push(newIncome); // Add to user's incomes

        await user.save(); // Save the updated user document

        res.status(201).json({ incomes: user.incomes });
    } catch (error) {
        console.error('Error adding income:', error); // Log the error for debugging
        res.status(500).json({ error: 'Failed to add income' });
    }
});

// Get all incomes for the logged-in user (Authenticated route)
router.get('/income', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get userId from authenticated user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user.incomes || []); // Return empty array if no incomes
    } catch (error) {
        console.error('Error fetching incomes:', error); // Log the error for debugging
        res.status(500).json({ error: 'Failed to fetch incomes' });
    }
});

// Update an income (Authenticated route)
router.put('/income/:id', authenticateToken, async (req, res) => {
    try {
        const { description, amount } = req.body;
        const userId = req.user.id; // Get userId from authenticated user
        const { id } = req.params; // ID of the income to update

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the income to update
        const incomeIndex = user.incomes.findIndex(income => income._id.toString() === id);
        if (incomeIndex === -1) {
            return res.status(404).json({ error: 'Income not found' });
        }

        // Update the income
        user.incomes[incomeIndex] = { ...user.incomes[incomeIndex], description, amount };
        await user.save(); // Save the updated user document

        res.status(200).json(user.incomes[incomeIndex]);
    } catch (error) {
        console.error('Error updating income:', error);
        res.status(500).json({ error: 'Failed to update income' });
    }
});

// Delete an income (Authenticated route)
router.delete('/income/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get userId from authenticated user
        const { id } = req.params; // ID of the income to delete

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter the incomes array to remove the income with the specified ID
        const updatedIncomes = user.incomes.filter(income => income._id.toString() !== id);
        
        // Update the user's incomes
        user.incomes = updatedIncomes;
        await user.save(); // Save the updated user document

        res.status(200).json({ message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ error: 'Failed to delete income' });
    }
});

module.exports = router;
