const express = require('express');
const router = express.Router();
const { uploadDocuments, uploadSingle } = require('../middleware/upload');
const path = require('path');

// Route pour uploader les documents d'inscription
router.post('/inscription', uploadDocuments, (req, res) => {
  try {
    const files = req.files;
    const filePaths = {};

    if (files.photo && files.photo[0]) {
      filePaths.photo = `/uploads/photos/${files.photo[0].filename}`;
    }

    if (files.certificat_medical && files.certificat_medical[0]) {
      filePaths.certificat_medical = `/uploads/certificats/${files.certificat_medical[0].filename}`;
    }

    if (files.assurance && files.assurance[0]) {
      filePaths.assurance = `/uploads/assurances/${files.assurance[0].filename}`;
    }

    res.json({
      success: true,
      message: 'Fichiers uploadÃ©s avec succÃ¨s',
      files: filePaths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload',
      error: error.message
    });
  }
});

// Route pour uploader un seul fichier
router.post('/single', uploadSingle, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadÃ©'
      });
    }

    const filePath = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Fichier uploadÃ© avec succÃ¨s',
      file: {
        path: filePath,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload',
      error: error.message
    });
  }
});

// Route pour servir les fichiers statiques
router.get('/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', type, filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: 'Fichier non trouvÃ©'
      });
    }
  });
});

module.exports = router;
