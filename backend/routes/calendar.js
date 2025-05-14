const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get tasks for a specific month
router.get('/month/:year/:month', auth, async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const tasks = await Task.find({
            user: req.user._id,
            dueDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ dueDate: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get tasks for a specific date
router.get('/date/:year/:month/:day', auth, async (req, res) => {
    try {
        const { year, month, day } = req.params;
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day, 23, 59, 59);

        const tasks = await Task.find({
            user: req.user._id,
            dueDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ dueDate: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task due date (for drag and drop functionality)
router.put('/:taskId/due-date', auth, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { dueDate } = req.body;

        const task = await Task.findOne({ _id: taskId, user: req.user._id });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.dueDate = new Date(dueDate);
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 