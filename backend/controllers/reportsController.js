const pool = require('../config/database');
const { generateId, formatDate } = require('../utils/helpers');

// Obtenir tous les reports
const getAllReports = async (req, res) => {
  try {
    const { statut } = req.query;

    let query = `
      SELECT r.*,
        CONCAT(u.prenom, ' ', u.nom) as auteur_nom,
        u.email as auteur_email
      FROM reports r
      JOIN users u ON r.auteur_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (statut) {
      query += ' AND r.statut = ?';
      params.push(statut);
    }

    query += ' ORDER BY r.date_creation DESC';

    const [reports] = await pool.execute(query, params);

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Erreur getAllReports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer un report
const createReport = async (req, res) => {
  try {
    const { type, titre, description } = req.body;
    const auteur_id = req.user.id;
    const auteur_role = req.user.role === 'membre' ? 'membre' : 'coach';

    const id = generateId('rep');
    await pool.execute(
      `INSERT INTO reports (
        id, auteur_id, auteur_role, type, titre, description, date_creation
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, auteur_id, auteur_role, type, titre, description, formatDate(new Date())]
    );

    res.status(201).json({
      success: true,
      message: 'Report créé avec succès',
      report: { id }
    });
  } catch (error) {
    console.error('Erreur createReport:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Répondre à un report (admin)
const respondToReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reponse_admin, statut } = req.body;

    await pool.execute(
      `UPDATE reports 
      SET reponse_admin = ?, statut = ?, date_reponse = ?
      WHERE id = ?`,
      [reponse_admin, statut, formatDate(new Date()), id]
    );

    res.json({
      success: true,
      message: 'Réponse envoyée avec succès'
    });
  } catch (error) {
    console.error('Erreur respondToReport:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  getAllReports,
  createReport,
  respondToReport
};
