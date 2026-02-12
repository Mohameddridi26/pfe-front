const pool = require('../config/database');
const { generateId } = require('../utils/helpers');

// Obtenir tous les tarifs
const getAllTarifs = async (req, res) => {
  try {
    const [tarifs] = await pool.execute(`
      SELECT t.*,
        GROUP_CONCAT(tf.feature) as features_list
      FROM tarifs t
      LEFT JOIN tarif_features tf ON t.id = tf.tarif_id
      GROUP BY t.id
      ORDER BY t.price ASC
    `);

    const tarifsWithFeatures = tarifs.map(tarif => ({
      ...tarif,
      features: tarif.features_list ? tarif.features_list.split(',') : []
    }));

    res.json({
      success: true,
      tarifs: tarifsWithFeatures
    });
  } catch (error) {
    console.error('Erreur getAllTarifs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer un tarif (admin)
const createTarif = async (req, res) => {
  try {
    const { name, price, period, description, popular, features } = req.body;

    const id = name.toLowerCase().replace(/\s+/g, '_');

    await pool.execute(
      `INSERT INTO tarifs (id, name, price, period, description, popular, actif)
      VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [id, name, price, period, description, popular || false]
    );

    // Ajouter les features
    if (features && features.length > 0) {
      for (const feature of features) {
        await pool.execute(
          `INSERT INTO tarif_features (tarif_id, feature)
          VALUES (?, ?)`,
          [id, feature]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Tarif créé avec succès',
      tarif: { id }
    });
  } catch (error) {
    console.error('Erreur createTarif:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Mettre à jour un tarif (admin)
const updateTarif = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, period, description, popular, actif, features } = req.body;

    await pool.execute(
      `UPDATE tarifs 
      SET name = ?, price = ?, period = ?, description = ?, popular = ?, actif = ?
      WHERE id = ?`,
      [name, price, period, description, popular, actif, id]
    );

    // Mettre à jour les features
    if (features) {
      await pool.execute('DELETE FROM tarif_features WHERE tarif_id = ?', [id]);
      for (const feature of features) {
        await pool.execute(
          `INSERT INTO tarif_features (tarif_id, feature)
          VALUES (?, ?)`,
          [id, feature]
        );
      }
    }

    res.json({
      success: true,
      message: 'Tarif mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur updateTarif:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  getAllTarifs,
  createTarif,
  updateTarif
};
