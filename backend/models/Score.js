const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
      minlength: [1, 'Name must be at least 1 character'],
      maxlength: [30, 'Name must be 30 characters or fewer'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be easy, medium, or hard',
      },
    },
    solveTime: {
      type: Number,
      required: [true, 'Solve time is required'],
      min: [1, 'Solve time must be at least 1 second'],
      max: [86400, 'Solve time cannot exceed 24 hours'],
    },
    solvedByAI: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Compound index: sort by difficulty then time for efficient leaderboard queries
scoreSchema.index({ difficulty: 1, solveTime: 1 });
// Index for global leaderboard (all difficulties sorted by time)
scoreSchema.index({ solveTime: 1, createdAt: -1 });

module.exports = mongoose.model('Score', scoreSchema);
