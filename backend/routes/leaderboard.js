const express = require('express');
const { body, validationResult } = require('express-validator');
const { getLeaderboard, postScore } = require('../controllers/leaderboardController');

const router = express.Router();

// Validation middleware runner
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join('. '),
    });
  }
  next();
};

// POST validation rules
const postRules = [
  body('playerName')
    .trim()
    .notEmpty().withMessage('playerName is required')
    .isLength({ max: 30 }).withMessage('playerName must be 30 chars or fewer'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard']).withMessage('difficulty must be easy, medium, or hard'),
  body('solveTime')
    .isInt({ min: 1, max: 86400 }).withMessage('solveTime must be an integer between 1 and 86400'),
  body('solvedByAI')
    .optional()
    .isBoolean().withMessage('solvedByAI must be a boolean'),
];

// Routes
router.get('/', getLeaderboard);
router.post('/', postRules, validate, postScore);

module.exports = router;
