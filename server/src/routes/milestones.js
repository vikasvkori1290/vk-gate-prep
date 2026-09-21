import express from 'express';
import { dbService, getDBStatus } from '../config/db.js';

const router = express.Router();

// Helper to get active password
const getActivePassword = () => {
  return process.env.GATE_TRACKER_PASSWORD || 'gate2027';
};

// GET /api/milestones - Get all milestones
router.get('/', async (req, res) => {
  try {
    const milestones = await dbService.getAll();
    res.json({
      success: true,
      count: milestones.length,
      data: milestones
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve milestones' });
  }
});

// GET /api/milestones/stats - Get overall stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await dbService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve statistics' });
  }
});

// GET /api/milestones/status - Get DB status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: getDBStatus()
  });
});

// POST /api/milestones/:id/toggle - Toggle milestone with password verification
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { password, completed } = req.body;

    const expectedPassword = getActivePassword();
    if (!password || password !== expectedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Confirmation required to check/uncheck milestone.'
      });
    }

    const updated = await dbService.toggleMilestone(id, completed);
    res.json({
      success: true,
      message: completed ? 'Milestone marked as completed' : 'Milestone marked as pending',
      data: updated
    });
  } catch (error) {
    console.error('Error toggling milestone:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update milestone'
    });
  }
});

// POST /api/milestones/password/update - Change password
router.post('/password/update', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const expectedPassword = getActivePassword();

    if (!currentPassword || currentPassword !== expectedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    if (!newPassword || newPassword.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be empty.'
      });
    }

    process.env.GATE_TRACKER_PASSWORD = newPassword.trim();
    res.json({
      success: true,
      message: 'Password successfully updated.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

export default router;
