const express = require('express');
const router = express.Router();
const { getAllReports, createReport, respondToReport } = require('../controllers/reportsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Obtenir tous les reports (admin)
router.get('/', requireRole('admin'), getAllReports);

// CrÃ©er un report (membre ou coach)
router.post('/', createReport);

// RÃ©pondre Ã  un report (admin)
router.put('/:id/respond', requireRole('admin'), respondToReport);

module.exports = router;
