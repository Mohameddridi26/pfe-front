const express = require('express');
const router = express.Router();
const { getAllSeances, createSeance, completeSeance } = require('../controllers/seancesController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Obtenir toutes les sÃ©ances (public pour le calendrier)
router.get('/', getAllSeances);

// Routes protÃ©gÃ©es
router.use(authenticateToken);

// CrÃ©er une sÃ©ance (admin)
router.post('/', requireRole('admin'), createSeance);

// Marquer une sÃ©ance comme complÃ©tÃ©e (admin)
router.put('/:id/complete', requireRole('admin'), completeSeance);

module.exports = router;
