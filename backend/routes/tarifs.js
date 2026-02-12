const express = require('express');
const router = express.Router();
const { getAllTarifs, createTarif, updateTarif } = require('../controllers/tarifsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Obtenir tous les tarifs (public)
router.get('/', getAllTarifs);

// Routes protÃ©gÃ©es (admin)
router.use(authenticateToken);
router.use(requireRole('admin'));

// CrÃ©er un tarif
router.post('/', createTarif);

// Mettre Ã  jour un tarif
router.put('/:id', updateTarif);

module.exports = router;
