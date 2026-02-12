const express = require('express');
const router = express.Router();
const { getAllInscriptions, createInscription, validateInscription, rejectInscription } = require('../controllers/inscriptionsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// CrÃ©er une inscription (public)
router.post('/', createInscription);

// Toutes les autres routes nÃ©cessitent une authentification admin
router.use(authenticateToken);
router.use(requireRole('admin'));

// Obtenir toutes les inscriptions
router.get('/', getAllInscriptions);

// Valider une inscription
router.put('/:id/validate', validateInscription);

// Rejeter une inscription
router.put('/:id/reject', rejectInscription);

module.exports = router;
