const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Login (public)
router.post('/login', login);

// Obtenir l'utilisateur actuel (protÃ©gÃ©)
router.get('/me', authenticateToken, getMe);

module.exports = router;
