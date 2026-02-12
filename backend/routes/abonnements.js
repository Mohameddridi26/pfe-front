const express = require('express');
const router = express.Router();
const { getAllAbonnements, getAbonnementByUserId, createAbonnement, renewAbonnement } = require('../controllers/abonnementsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Obtenir tous les abonnements (admin)
router.get('/', requireRole('admin'), getAllAbonnements);

// Obtenir l'abonnement d'un membre
router.get('/user/:userId', getAbonnementByUserId);

// CrÃ©er un abonnement (admin)
router.post('/', requireRole('admin'), createAbonnement);

// Renouveler un abonnement
router.put('/:id/renew', renewAbonnement);

module.exports = router;
