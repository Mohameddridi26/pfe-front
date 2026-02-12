const pool = require('../config/database');
const { generateId, formatDate, timeOverlaps } = require('../utils/helpers');

// Obtenir toutes les réservations
const getAllReservations = async (req, res) => {
  try {
    const { user_id, seance_id } = req.query;

    let query = `
      SELECT r.*,
        CONCAT(u.prenom, ' ', u.nom) as membre_nom,
        u.email as membre_email,
        s.activite, s.date as date_seance, s.heure_debut, s.heure_fin, s.salle,
        CONCAT(coach_u.prenom, ' ', coach_u.nom) as coach_nom
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN seances s ON r.seance_id = s.id
      JOIN coaches c ON s.coach_id = c.id
      JOIN users coach_u ON c.user_id = coach_u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND r.user_id = ?';
      params.push(user_id);
    }

    if (seance_id) {
      query += ' AND r.seance_id = ?';
      params.push(seance_id);
    }

    query += ' ORDER BY r.date_reservation DESC';

    const [reservations] = await pool.execute(query, params);

    res.json({
      success: true,
      reservations
    });
  } catch (error) {
    console.error('Erreur getAllReservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer une réservation
const createReservation = async (req, res) => {
  try {
    const { seance_id } = req.body;
    const user_id = req.user.id;

    // Vérifier que la séance existe
    const [seances] = await pool.execute(
      'SELECT * FROM seances WHERE id = ?',
      [seance_id]
    );

    if (seances.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Séance non trouvée'
      });
    }

    const seance = seances[0];

    // Vérifier la capacité
    if (seance.inscrits >= seance.capacite_max) {
      return res.status(400).json({
        success: false,
        message: 'La séance est complète'
      });
    }

    // Vérifier les conflits de réservation
    const [userReservations] = await pool.execute(
      `SELECT s.* FROM reservations r
      JOIN seances s ON r.seance_id = s.id
      WHERE r.user_id = ? AND s.date = ?`,
      [user_id, seance.date]
    );

    for (const reservation of userReservations) {
      if (reservation.id !== seance_id && 
          timeOverlaps(seance.heure_debut, seance.heure_fin, reservation.heure_debut, reservation.heure_fin)) {
        return res.status(400).json({
          success: false,
          message: `Vous avez déjà une réservation le ${seance.date} de ${reservation.heure_debut} à ${reservation.heure_fin}` 
        });
      }
    }

    // Vérifier si déjà réservé
    const [existing] = await pool.execute(
      'SELECT * FROM reservations WHERE user_id = ? AND seance_id = ?',
      [user_id, seance_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà réservé cette séance'
      });
    }

    // Créer la réservation
    const id = generateId('res');
    await pool.execute(
      `INSERT INTO reservations (id, user_id, seance_id, date_reservation)
      VALUES (?, ?, ?, ?)`,
      [id, user_id, seance_id, formatDate(new Date())]
    );

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      reservation: { id }
    });
  } catch (error) {
    console.error('Erreur createReservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Annuler une réservation
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Vérifier que la réservation appartient à l'utilisateur
    const [reservations] = await pool.execute(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    await pool.execute('DELETE FROM reservations WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Réservation annulée avec succès'
    });
  } catch (error) {
    console.error('Erreur cancelReservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  getAllReservations,
  createReservation,
  cancelReservation
};
