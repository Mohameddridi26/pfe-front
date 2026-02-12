const express = require('express');
const router = express.Router();
const { getAllReservations, createReservation, cancelReservation } = require('../controllers/reservationsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Obtenir toutes les rÃ©servations
router.get('/', getAllReservations);

// CrÃ©er une rÃ©servation (membre)
router.post('/', requireRole('membre', 'admin'), createReservation);

// Annuler une rÃ©servation
router.delete('/:id', cancelReservation);

module.exports = router;
