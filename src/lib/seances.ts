import type { SportId } from "./cours";
import { coursData } from "./cours";

export interface Seance {
  id: string;
  activite: SportId;
  coach: string;
  salle: string;
  date: string; // Format YYYY-MM-DD
  heureDebut: string; // Format HH:MM
  heureFin: string; // Format HH:MM
  capaciteMax?: number;
  inscrits?: number;
  membresInscrits?: string[]; // IDs des membres inscrits
  completee?: boolean; // Indique si la séance a été complétée/marquée comme passée
}

export interface ConflitCoach {
  seanceId: string;
  message: string;
}

/**
 * Vérifie si un coach est déjà assigné à une autre séance au même moment
 * @param seances Liste de toutes les séances existantes
 * @param nouvelleSeance La nouvelle séance à vérifier
 * @param seanceIdExclue ID de la séance à exclure (pour la modification)
 * @returns null si pas de conflit, sinon un objet ConflitCoach
 */
export function detecterConflitCoach(
  seances: Seance[],
  nouvelleSeance: Omit<Seance, "id">,
  seanceIdExclue?: string
): ConflitCoach | null {
  const { coach, date, heureDebut, heureFin } = nouvelleSeance;

  // Convertir les heures en minutes pour faciliter la comparaison
  const [hDebut, mDebut] = heureDebut.split(":").map(Number);
  const [hFin, mFin] = heureFin.split(":").map(Number);
  const debutMinutes = hDebut * 60 + mDebut;
  const finMinutes = hFin * 60 + mFin;

  // Vérifier que début < fin
  if (debutMinutes >= finMinutes) {
    return {
      seanceId: "",
      message: "L'heure de début doit être antérieure à l'heure de fin.",
    };
  }

  // Parcourir toutes les séances existantes
  for (const seance of seances) {
    // Exclure la séance en cours de modification
    if (seanceIdExclue && seance.id === seanceIdExclue) {
      continue;
    }

    // Vérifier si c'est le même coach et la même date
    if (seance.coach === coach && seance.date === date) {
      const [sHDebut, sMDebut] = seance.heureDebut.split(":").map(Number);
      const [sHFin, sMFin] = seance.heureFin.split(":").map(Number);
      const sDebutMinutes = sHDebut * 60 + sMDebut;
      const sFinMinutes = sHFin * 60 + sMFin;

      // Vérifier si les horaires se chevauchent
      // Conflit si : (debut < sFin) ET (fin > sDebut)
      if (debutMinutes < sFinMinutes && finMinutes > sDebutMinutes) {
        return {
          seanceId: seance.id,
          message: `Conflit détecté : ${coach} est déjà assigné à une séance de ${seance.activite} le ${date} de ${seance.heureDebut} à ${seance.heureFin} (Salle ${seance.salle}).`,
        };
      }
    }
  }

  return null;
}

/**
 * Valide qu'une séance peut être créée/modifiée sans conflit
 */
export function validerSeance(
  seances: Seance[],
  nouvelleSeance: Omit<Seance, "id">,
  seanceIdExclue?: string
): { valide: true } | { valide: false; conflit: ConflitCoach } {
  const conflit = detecterConflitCoach(seances, nouvelleSeance, seanceIdExclue);
  if (conflit) {
    return { valide: false, conflit };
  }
  return { valide: true };
}

/**
 * Détecte si un membre a un conflit de réservation (deux séances qui se chevauchent)
 */
export function detecterConflitReservation(
  seances: Seance[],
  reservations: Array<{ seanceId: string; membreId: string }>,
  membreId: string,
  nouvelleSeanceId: string
): { conflit: true; message: string } | { conflit: false } {
  const nouvelleSeance = seances.find((s) => s.id === nouvelleSeanceId);
  if (!nouvelleSeance) {
    return { conflit: false };
  }

  // Récupérer toutes les réservations du membre
  const reservationsMembre = reservations.filter((r) => r.membreId === membreId && r.seanceId !== nouvelleSeanceId);

  // Pour chaque réservation existante, vérifier si elle chevauche avec la nouvelle
  for (const reservation of reservationsMembre) {
    const seanceExistante = seances.find((s) => s.id === reservation.seanceId);
    if (!seanceExistante) continue;

    // Vérifier si c'est le même jour
    if (seanceExistante.date === nouvelleSeance.date) {
      // Convertir les heures en minutes
      const [hDebutNouvelle, mDebutNouvelle] = nouvelleSeance.heureDebut.split(":").map(Number);
      const [hFinNouvelle, mFinNouvelle] = nouvelleSeance.heureFin.split(":").map(Number);
      const debutNouvelle = hDebutNouvelle * 60 + mDebutNouvelle;
      const finNouvelle = hFinNouvelle * 60 + mFinNouvelle;

      const [hDebutExistante, mDebutExistante] = seanceExistante.heureDebut.split(":").map(Number);
      const [hFinExistante, mFinExistante] = seanceExistante.heureFin.split(":").map(Number);
      const debutExistante = hDebutExistante * 60 + mDebutExistante;
      const finExistante = hFinExistante * 60 + mFinExistante;

      // Vérifier si les horaires se chevauchent
      if (debutNouvelle < finExistante && finNouvelle > debutExistante) {
        return {
          conflit: true,
          message: `Vous avez déjà une réservation le ${nouvelleSeance.date} de ${seanceExistante.heureDebut} à ${seanceExistante.heureFin} (${coursData[seanceExistante.activite]?.nom || seanceExistante.activite}).`,
        };
      }
    }
  }

  return { conflit: false };
}

// Données mock pour les séances existantes
// Générer des dates futures pour les séances
const aujourdhui = new Date();
const demain = new Date(aujourdhui);
demain.setDate(demain.getDate() + 1);
const apresDemain = new Date(aujourdhui);
apresDemain.setDate(apresDemain.getDate() + 2);
const dans3Jours = new Date(aujourdhui);
dans3Jours.setDate(dans3Jours.getDate() + 3);

const formatDateStr = (date: Date) => date.toISOString().split("T")[0];

export const seancesMock: Seance[] = [
  {
    id: "s1",
    activite: "yoga",
    coach: "Sarah M.",
    salle: "Salle 1",
    date: formatDateStr(demain),
    heureDebut: "08:00",
    heureFin: "09:00",
    capaciteMax: 20,
    inscrits: 15,
    membresInscrits: [],
  },
  {
    id: "s2",
    activite: "crossfit",
    coach: "Marc D.",
    salle: "Salle 2",
    date: formatDateStr(demain),
    heureDebut: "10:00",
    heureFin: "11:00",
    capaciteMax: 15,
    inscrits: 12,
    membresInscrits: [],
  },
  {
    id: "s3",
    activite: "musculation",
    coach: "Jean P.",
    salle: "Salle 3",
    date: formatDateStr(demain),
    heureDebut: "12:00",
    heureFin: "13:00",
    capaciteMax: 25,
    inscrits: 20,
    membresInscrits: [],
  },
  {
    id: "s4",
    activite: "boxe",
    coach: "Jean P.",
    salle: "Salle 1",
    date: formatDateStr(apresDemain),
    heureDebut: "14:00",
    heureFin: "15:30",
    capaciteMax: 20,
    inscrits: 8,
    membresInscrits: [],
  },
  {
    id: "s5",
    activite: "musculation",
    coach: "Jean P.",
    salle: "Salle 3",
    date: formatDateStr(dans3Jours),
    heureDebut: "16:00",
    heureFin: "17:00",
    capaciteMax: 25,
    inscrits: 12,
    membresInscrits: [],
  },
];

// Liste des coachs disponibles
export const coachsDisponibles = [
  "Jean P.",
  "Marc D.",
  "Sarah M.",
  "Amina K.",
  "Ahmed B.",
  "Marie L.",
  "Lisa R.",
];

// Liste des salles disponibles
export const sallesDisponibles = ["Salle 1", "Salle 2", "Salle 3", "Salle 4", "Salle 5"];
