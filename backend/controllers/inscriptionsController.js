const pool = require('../config/database');
const { generateId, formatDate } = require('../utils/helpers');

// Obtenir toutes les inscriptions (admin)
const getAllInscriptions = async (req, res) => {
  try {
    const [inscriptions] = await pool.execute(`
      SELECT i.*, 
        GROUP_CONCAT(ipm.piece) as pieces_manquantes_list
      FROM inscriptions i
      LEFT JOIN inscription_pieces_manquantes ipm ON i.id = ipm.inscription_id
      GROUP BY i.id
      ORDER BY i.date_soumission DESC
    `);

    // Parser les pièces manquantes
    const inscriptionsWithPieces = inscriptions.map(ins => ({
      ...ins,
      piecesManquantes: ins.pieces_manquantes_list 
        ? ins.pieces_manquantes_list.split(',') 
        : []
    }));

    res.json({
      success: true,
      inscriptions: inscriptionsWithPieces
    });
  } catch (error) {
    console.error('Erreur getAllInscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer une inscription
const createInscription = async (req, res) => {
  try {
    const {
      nom, prenom, email, telephone, cin,
      certificat_medical, assurance, photo,
      type_abonnement_demande, methode_paiement,
      photo_path, certificat_medical_path, assurance_path
    } = req.body;

    const id = generateId('ins');
    const dateSoumission = formatDate(new Date());

    // Déterminer le statut initial
    let statut = 'en_attente_validation';
    const piecesManquantes = [];

    if (!certificat_medical) piecesManquantes.push('Certificat médical');
    if (!assurance) piecesManquantes.push('Assurance');
    if (!photo) piecesManquantes.push('Photo');

    if (piecesManquantes.length > 0) {
      statut = 'en_attente_pieces';
    }

    // Insérer l'inscription
    await pool.execute(
      `INSERT INTO inscriptions (
        id, nom, prenom, email, telephone, cin,
        date_soumission, statut,
        certificat_medical, assurance, photo,
        type_abonnement_demande, methode_paiement,
        photo_path, certificat_medical_path, assurance_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, nom, prenom, email, telephone, cin,
        dateSoumission, statut,
        certificat_medical || false, assurance || false, photo || false,
        type_abonnement_demande, methode_paiement,
        photo_path, certificat_medical_path, assurance_path
      ]
    );

    // Insérer les pièces manquantes
    if (piecesManquantes.length > 0) {
      const values = piecesManquantes.map(piece => [id, piece]);
      await pool.query(
        'INSERT INTO inscription_pieces_manquantes (inscription_id, piece) VALUES ?',
        [values]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Inscription créée avec succès',
      inscription: { id, statut, piecesManquantes }
    });
  } catch (error) {
    console.error('Erreur createInscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Valider une inscription (admin)
const validateInscription = async (req, res) => {
  try {
    const { id } = req.params;

    const [inscriptions] = await pool.execute(
      'SELECT * FROM inscriptions WHERE id = ?',
      [id]
    );

    if (inscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inscription non trouvée'
      });
    }

    const inscription = inscriptions[0];

    // Vérifier le certificat médical
    if (!inscription.certificat_medical) {
      await pool.execute(
        'UPDATE inscriptions SET statut = ?, pieces_manquantes = ? WHERE id = ?',
        ['en_attente_pieces', 'Certificat médical', id]
      );
      return res.status(400).json({
        success: false,
        message: 'Le certificat médical est obligatoire'
      });
    }

    // Valider l'inscription
    await pool.execute(
      'UPDATE inscriptions SET statut = ? WHERE id = ?',
      ['valide', id]
    );

    // Supprimer les pièces manquantes
    await pool.execute(
      'DELETE FROM inscription_pieces_manquantes WHERE inscription_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Inscription validée avec succès'
    });
  } catch (error) {
    console.error('Erreur validateInscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Rejeter une inscription (admin)
const rejectInscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { raison } = req.body;

    await pool.execute(
      'UPDATE inscriptions SET statut = ? WHERE id = ?',
      ['rejete', id]
    );

    res.json({
      success: true,
      message: 'Inscription rejetée'
    });
  } catch (error) {
    console.error('Erreur rejectInscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  getAllInscriptions,
  createInscription,
  validateInscription,
  rejectInscription
};
