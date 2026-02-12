const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { generateId } = require('../utils/helpers');

// Obtenir tous les coaches
const getAllCoaches = async (req, res) => {
  try {
    const [coaches] = await pool.execute(`
      SELECT c.*, u.nom, u.prenom, u.email,
        GROUP_CONCAT(cs.specialite) as specialites_list,
        GROUP_CONCAT(cs2.salle) as salles_list
      FROM coaches c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN coach_specialites cs ON c.id = cs.coach_id
      LEFT JOIN coach_salles cs2 ON c.id = cs2.coach_id
      GROUP BY c.id
    `);

    const coachesWithArrays = coaches.map(coach => ({
      ...coach,
      specialites: coach.specialites_list ? coach.specialites_list.split(',') : [],
      sallesAssignees: coach.salles_list ? coach.salles_list.split(',') : []
    }));

    res.json({
      success: true,
      coaches: coachesWithArrays
    });
  } catch (error) {
    console.error('Erreur getAllCoaches:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer un coach (admin)
const createCoach = async (req, res) => {
  try {
    const { nom, prenom, email, password, tel, specialites, sallesAssignees } = req.body;

    // Vérifier que l'email n'existe pas
    const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userId = generateId('user');
    await pool.execute(
      `INSERT INTO users (id, nom, prenom, email, password, role)
      VALUES (?, ?, ?, ?, ?, 'coach')`,
      [userId, nom, prenom, email, hashedPassword]
    );

    // Créer le coach
    const coachId = generateId('coach');
    await pool.execute(
      `INSERT INTO coaches (id, user_id, tel)
      VALUES (?, ?, ?)`,
      [coachId, userId, tel]
    );

    // Ajouter les spécialités (max 2)
    if (specialites && specialites.length > 0) {
      const specialitesToAdd = specialites.slice(0, 2);
      for (const specialite of specialitesToAdd) {
        await pool.execute(
          `INSERT INTO coach_specialites (coach_id, specialite)
          VALUES (?, ?)`,
          [coachId, specialite]
        );
      }
    }

    // Ajouter les salles
    if (sallesAssignees && sallesAssignees.length > 0) {
      for (const salle of sallesAssignees) {
        await pool.execute(
          `INSERT INTO coach_salles (coach_id, salle)
          VALUES (?, ?)`,
          [coachId, salle]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Coach créé avec succès',
      coach: { id: coachId }
    });
  } catch (error) {
    console.error('Erreur createCoach:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Obtenir les disponibilités d'un coach
const getDisponibilites = async (req, res) => {
  try {
    const { coachId } = req.params;

    const [disponibilites] = await pool.execute(
      `SELECT * FROM disponibilites
      WHERE coach_id = ?
      ORDER BY jour_semaine, heure_debut`,
      [coachId]
    );

    res.json({
      success: true,
      disponibilites
    });
  } catch (error) {
    console.error('Erreur getDisponibilites:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  getAllCoaches,
  createCoach,
  getDisponibilites
};
