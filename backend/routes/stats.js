const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get overall statistics
router.get('/overview', auth, async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments({ user: req.user._id });
        const completedTasks = await Task.countDocuments({ user: req.user._id, status: 'completed' });
        const pendingTasks = await Task.countDocuments({ user: req.user._id, status: { $ne: 'completed' } });
        const overdueTasks = await Task.countDocuments({
            user: req.user._id,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });

        res.json({
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get tasks by status
router.get('/by-status', auth, async (req, res) => {
    try {
        const statusCounts = await Task.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json(statusCounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get tasks by priority
router.get('/by-priority', auth, async (req, res) => {
    try {
        const priorityCounts = await Task.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.json(priorityCounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get tasks by label
router.get('/by-label', auth, async (req, res) => {
    try {
        const labelCounts = await Task.aggregate([
            { $match: { user: req.user._id } },
            { $unwind: '$labels' },
            { $group: { _id: '$labels', count: { $sum: 1 } } }
        ]);

        res.json(labelCounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get weekly task trends
router.get('/weekly-trends', auth, async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const dailyTasks = await Task.aggregate([
            {
                $match: {
                    user: req.user._id,
                    dueDate: { $gte: oneWeekAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$dueDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.json(dailyTasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 