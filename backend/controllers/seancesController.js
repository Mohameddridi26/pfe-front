const pool = require('../config/database');
const { generateId, formatDate, formatTime, isPastDate, timeOverlaps } = require('../utils/helpers');

// Obtenir toutes les séances
const getAllSeances = async (req, res) => {
  try {
    const { date, coach_id } = req.query;

    let query = `
      SELECT s.*, 
        CONCAT(u.prenom, ' ', u.nom) as coach_nom,
        u.email as coach_email
      FROM seances s
      JOIN coaches c ON s.coach_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ' AND s.date = ?';
      params.push(date);
    }

    if (coach_id) {
      query += ' AND s.coach_id = ?';
      params.push(coach_id);
    }

    query += ' ORDER BY s.date ASC, s.heure_debut ASC';

    const [seances] = await pool.execute(query, params);

    res.json({
      success: true,
      seances
    });
  } catch (error) {
    console.error('Erreur getAllSeances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer une séance (admin)
const createSeance = async (req, res) => {
  try {
    const { activite, coach_id, salle, date, heure_debut, heure_fin, capacite_max } = req.body;

    // Vérifier que la date n'est pas dans le passé
    if (isPastDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de créer une séance dans le passé'
      });
    }

    // Vérifier les conflits de coach
    const [existingSeances] = await pool.execute(
      `SELECT * FROM seances 
      WHERE coach_id = ? AND date = ?`,
      [coach_id, date]
    );

    for (const seance of existingSeances) {
      if (timeOverlaps(heure_debut, heure_fin, seance.heure_debut, seance.heure_fin)) {
        return res.status(400).json({
          success: false,
          message: `Conflit : Le coach est déjà assigné à une séance de ${seance.heure_debut} à ${seance.heure_fin}` 
        });
      }
    }

    const id = generateId('s');
    await pool.execute(
      `INSERT INTO seances (
        id, activite, coach_id, salle, date, heure_debut, heure_fin, capacite_max
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, activite, coach_id, salle, formatDate(date), formatTime(heure_debut), formatTime(heure_fin), capacite_max || 20]
    );

    res.status(201).json({
      success: true,
      message: 'Séance créée avec succès',
      seance: { id }
    });
  } catch (error) {
    console.error('Erreur createSeance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Marquer une séance comme complétée (admin)
const completeSeance = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE seances SET completee = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Séance marquée comme complétée'
    });
  } catch (error) {
    console.error('Erreur completeSeance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  getAllSeances,
  createSeance,
  completeSeance
};
