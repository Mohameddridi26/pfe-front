const express = require('express');
const router = express.Router();
const { getAllCoaches, createCoach, getDisponibilites } = require('../controllers/coachesController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Obtenir tous les coaches (public pour le calendrier)
router.get('/', getAllCoaches);

// Routes protÃ©gÃ©es
router.use(authenticateToken);

// CrÃ©er un coach (admin)
router.post('/', requireRole('admin'), createCoach);

// Obtenir les disponibilitÃ©s d'un coach
router.get('/:coachId/disponibilites', getDisponibilites);

module.exports = router;
