const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['todo', 'inProgress', 'completed'],
        default: 'todo'
    },
    tags: [{
        type: String,
        trim: true
    }],
    labels: [{
        type: String,
        trim: true
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Update the updatedAt timestamp before saving
taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better search performance
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });

module.exports = mongoose.model('Task', taskSchema); 