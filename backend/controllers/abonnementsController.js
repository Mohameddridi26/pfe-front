const pool = require('../config/database');
const { generateId, formatDate, calculateEndDate } = require('../utils/helpers');

// Obtenir tous les abonnements
const getAllAbonnements = async (req, res) => {
  try {
    const [abonnements] = await pool.execute(`
      SELECT a.*, 
        CONCAT(u.prenom, ' ', u.nom) as membre_nom,
        u.email as membre_email,
        u.telephone as membre_tel
      FROM abonnements a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);

    res.json({
      success: true,
      abonnements
    });
  } catch (error) {
    console.error('Erreur getAllAbonnements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Obtenir l'abonnement d'un membre
const getAbonnementByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const [abonnements] = await pool.execute(
      `SELECT a.*, t.name as tarif_name, t.price as tarif_price
      FROM abonnements a
      JOIN tarifs t ON a.tarif_id = t.id
      WHERE a.user_id = ? AND a.statut = 'actif'
      ORDER BY a.date_fin DESC
      LIMIT 1`,
      [userId]
    );

    if (abonnements.length === 0) {
      return res.json({
        success: true,
        abonnement: null
      });
    }

    res.json({
      success: true,
      abonnement: abonnements[0]
    });
  } catch (error) {
    console.error('Erreur getAbonnementByUserId:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer un abonnement
const createAbonnement = async (req, res) => {
  try {
    const { user_id, tarif_id, type, prix, date_debut } = req.body;

    const id = generateId('ab');
    const dateDebut = date_debut || formatDate(new Date());
    const dateFin = calculateEndDate(dateDebut, type);

    await pool.execute(
      `INSERT INTO abonnements (
        id, user_id, tarif_id, type, prix, date_debut, date_fin, statut
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'actif')`,
      [id, user_id, tarif_id, type, prix, dateDebut, dateFin]
    );

    res.status(201).json({
      success: true,
      message: 'Abonnement créé avec succès',
      abonnement: { id, date_debut: dateDebut, date_fin: dateFin }
    });
  } catch (error) {
    console.error('Erreur createAbonnement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Renouveler un abonnement
const renewAbonnement = async (req, res) => {
  try {
    const { id } = req.params;
    const { nouveau_type, nouveau_prix } = req.body;

    const [abonnements] = await pool.execute(
      'SELECT * FROM abonnements WHERE id = ?',
      [id]
    );

    if (abonnements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Abonnement non trouvé'
      });
    }

    const abonnement = abonnements[0];
    const nouvelleDateFin = calculateEndDate(abonnement.date_fin, nouveau_type);

    await pool.execute(
      `UPDATE abonnements 
      SET type = ?, prix = ?, date_fin = ?, statut = 'actif'
      WHERE id = ?`,
      [nouveau_type, nouveau_prix, nouvelleDateFin, id]
    );

    res.json({
      success: true,
      message: 'Abonnement renouvelé avec succès'
    });
  } catch (error) {
    console.error('Erreur renewAbonnement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  getAllAbonnements,
  getAbonnementByUserId,
  createAbonnement,
  renewAbonnement
};
