const Score = require('../models/Score');

/**
 * GET /api/leaderboard
 * Returns leaderboard entries sorted by solveTime ascending.
 * Optional query param: ?difficulty=easy|medium|hard  (filters by difficulty)
 * Optional query param: ?limit=20                      (max records, default 20, max 100)
 */
const getLeaderboard = async (req, res) => {
  try {
    const { difficulty, limit: rawLimit } = req.query;
    const limit = Math.min(parseInt(rawLimit) || 20, 100);

    const filter = {};
    if (difficulty) {
      const valid = ['easy', 'medium', 'hard'];
      if (!valid.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: `Invalid difficulty. Must be one of: ${valid.join(', ')}`,
        });
      }
      filter.difficulty = difficulty;
    }

    const scores = await Score.find(filter)
      .sort({ solveTime: 1, createdAt: 1 })
      .limit(limit)
      .select('playerName difficulty solveTime solvedByAI createdAt')
      .lean();

    // Add rank to each entry
    const ranked = scores.map((entry, idx) => ({
      rank: idx + 1,
      ...entry,
    }));

    return res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked,
    });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard',
    });
  }
};

/**
 * POST /api/leaderboard
 * Saves a new score entry.
 * Body: { playerName, difficulty, solveTime, solvedByAI? }
 */
const postScore = async (req, res) => {
  try {
    const { playerName, difficulty, solveTime, solvedByAI } = req.body;

    // Manual validation (express-validator runs first, but belt-and-suspenders)
    if (!playerName || typeof playerName !== 'string') {
      return res.status(400).json({ success: false, message: 'playerName is required' });
    }
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'difficulty must be easy, medium, or hard' });
    }
    if (!Number.isInteger(solveTime) || solveTime < 1 || solveTime > 86400) {
      return res.status(400).json({ success: false, message: 'solveTime must be an integer between 1 and 86400' });
    }

    const score = await Score.create({
      playerName: playerName.trim().slice(0, 30),
      difficulty,
      solveTime,
      solvedByAI: Boolean(solvedByAI),
    });

    // Return the persisted document plus its rank in the leaderboard
    const rank = await Score.countDocuments({ solveTime: { $lte: solveTime } });

    return res.status(201).json({
      success: true,
      message: 'Score saved!',
      data: {
        id: score._id,
        playerName: score.playerName,
        difficulty: score.difficulty,
        solveTime: score.solveTime,
        solvedByAI: score.solvedByAI,
        createdAt: score.createdAt,
        rank,
      },
    });
  } catch (err) {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('postScore error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving score' });
  }
};

module.exports = { getLeaderboard, postScore };
