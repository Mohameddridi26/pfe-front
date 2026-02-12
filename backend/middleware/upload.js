const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers s'ils n'existent pas
const uploadDirs = {
  photos: path.join(__dirname, '../uploads/photos'),
  certificats: path.join(__dirname, '../uploads/certificats'),
  assurances: path.join(__dirname, '../uploads/assurances')
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '';
    
    // DÃ©terminer le dossier selon le type de fichier
    if (file.fieldname === 'photo') {
      uploadPath = uploadDirs.photos;
    } else if (file.fieldname === 'certificat_medical') {
      uploadPath = uploadDirs.certificats;
    } else if (file.fieldname === 'assurance') {
      uploadPath = uploadDirs.assurances;
    } else {
      uploadPath = uploadDirs.photos; // Par dÃ©faut
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique : timestamp-userId-originalname
    const userId = req.body.userId || (req.user && req.user.id) || 'anonymous';
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${userId}-${originalName}`;
    cb(null, filename);
  }
});

// Filtre pour accepter seulement certains types de fichiers
const fileFilter = (req, file, cb) => {
  // Types de fichiers acceptÃ©s
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisÃ© ! Seuls les fichiers JPEG, PNG, PDF, DOC, DOCX sont acceptÃ©s.'));
  }
};

// Configuration Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

// Middleware pour upload multiple (photo, certificat, assurance)
const uploadDocuments = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'certificat_medical', maxCount: 1 },
  { name: 'assurance', maxCount: 1 }
]);

// Middleware pour upload simple (un seul fichier)
const uploadSingle = upload.single('file');

module.exports = {
  uploadDocuments,
  uploadSingle,
  uploadDirs
};
