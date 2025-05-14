const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get all tasks for a user with filtering
router.get('/', auth, async (req, res) => {
    try {
        const { status, priority, label, search } = req.query;
        const query = { user: req.user._id };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (label) query.labels = label;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const tasks = await Task.find(query).sort({ dueDate: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new task
router.post('/', [
    auth,
    body('title').trim().notEmpty(),
    body('dueDate').isISO8601(),
    body('priority').isIn(['low', 'medium', 'high']),
    body('status').isIn(['todo', 'inProgress', 'completed'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const task = new Task({
            ...req.body,
            user: req.user._id
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'description', 'dueDate', 'priority', 'status', 'labels'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        // Validate status if it's being updated
        if (updates.includes('status') && !['todo', 'inProgress', 'completed'].includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 