// Générer un ID unique
const generateId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

// Formater une date pour MySQL (YYYY-MM-DD)
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Formater une heure pour MySQL (HH:MM:SS)
const formatTime = (time) => {
  if (!time) return null;
  // Si c'est déjà au format HH:MM, ajouter :00
  if (time.length === 5) return `${time}:00`;
  return time;
};

// Calculer la date de fin d'un abonnement
const calculateEndDate = (startDate, type) => {
  const start = new Date(startDate);
  const end = new Date(start);

  switch (type) {
    case 'Mensuel':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'Trimestriel':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'Annuel':
      end.setFullYear(end.getFullYear() + 1);
      break;
    default:
      end.setMonth(end.getMonth() + 1);
  }

  return formatDate(end);
};

// Vérifier si une date est dans le passé
const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

// Vérifier si deux créneaux horaires se chevauchent
const timeOverlaps = (start1, end1, start2, end2) => {
  const [h1, m1] = start1.split(':').map(Number);
  const [h2, m2] = end1.split(':').map(Number);
  const [h3, m3] = start2.split(':').map(Number);
  const [h4, m4] = end2.split(':').map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = h2 * 60 + m2;
  const start2Minutes = h3 * 60 + m3;
  const end2Minutes = h4 * 60 + m4;

  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
};

module.exports = {
  generateId,
  formatDate,
  formatTime,
  calculateEndDate,
  isPastDate,
  timeOverlaps
};
