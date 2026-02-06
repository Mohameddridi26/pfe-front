export interface Reservation {
  id: string;
  membreId: string;
  seanceId: string;
  dateReservation: string; // Date de la réservation (quand le membre a réservé)
  dateSeance: string; // Date de la séance réservée
  heureDebut: string;
  heureFin: string;
  activite: string;
  coach: string;
  salle: string;
  present?: boolean; // État de présence (undefined = pas encore marqué, true = présent, false = absent)
}

export const reservationsMock: Reservation[] = [];
