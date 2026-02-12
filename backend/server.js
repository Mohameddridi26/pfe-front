const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const inscriptionsRoutes = require('./routes/inscriptions');
const abonnementsRoutes = require('./routes/abonnements');
const seancesRoutes = require('./routes/seances');
const reservationsRoutes = require('./routes/reservations');
const coachesRoutes = require('./routes/coaches');
const reportsRoutes = require('./routes/reports');
const tarifsRoutes = require('./routes/tarifs');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/inscriptions', inscriptionsRoutes);
app.use('/api/abonnements', abonnementsRoutes);
app.use('/api/seances', seancesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/coaches', coachesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/tarifs', tarifsRoutes);
app.use('/api/upload', uploadRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API FITZONE Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      inscriptions: '/api/inscriptions',
      abonnements: '/api/abonnements',
      seances: '/api/seances',
      reservations: '/api/reservations',
      coaches: '/api/coaches',
      reports: '/api/reports',
      tarifs: '/api/tarifs',
      upload: '/api/upload'
    }
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvee'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur demarre sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}`);
});
