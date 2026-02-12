const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/usersController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Toutes les routes nÃ©cessitent une authentification
router.use(authenticateToken);

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', requireRole('admin'), getAllUsers);

// Obtenir un utilisateur par ID
router.get('/:id', getUserById);

// Mettre Ã  jour un utilisateur
router.put('/:id', updateUser);

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;
