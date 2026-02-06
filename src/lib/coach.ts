import type { SportId } from "./cours";
import type { Seance } from "./seances";

/**
 * Interface pour représenter une disponibilité d'un coach
 */
export interface Disponibilite {
  id: string;
  jourSemaine: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  heureDebut: string; // Format HH:MM
  heureFin: string; // Format HH:MM
}

/**
 * Interface complète pour un Coach selon le diagramme UML
 */
export interface Coach {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  mdp: string;
  specialites: string[]; // Array de spécialités selon le diagramme
  disponibilites: Disponibilite[];
  sallesAssignees: string[]; // Array de noms de salles
  tel: string;
}

/**
 * Interface pour représenter un client/membre assigné à un coach
 */
export interface ClientCoach {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateInscription: string;
  abonnementActif?: {
    type: string;
    dateFin: string;
  };
}

/**
 * Mock data pour les disponibilités d'un coach
 */
export const disponibilitesMock: Disponibilite[] = [
  { id: "d1", jourSemaine: 1, heureDebut: "08:00", heureFin: "12:00" }, // Lundi matin
  { id: "d2", jourSemaine: 1, heureDebut: "14:00", heureFin: "18:00" }, // Lundi après-midi
  { id: "d3", jourSemaine: 3, heureDebut: "08:00", heureFin: "12:00" }, // Mercredi matin
  { id: "d4", jourSemaine: 3, heureDebut: "14:00", heureFin: "18:00" }, // Mercredi après-midi
  { id: "d5", jourSemaine: 5, heureDebut: "08:00", heureFin: "12:00" }, // Vendredi matin
];

/**
 * Mock data pour les clients d'un coach
 */
export const clientsCoachMock: ClientCoach[] = [
  {
    id: "c1",
    nom: "Martin",
    prenom: "Sophie",
    email: "sophie.martin@example.com",
    telephone: "+216 12 345 678",
    dateInscription: "2024-11-15",
    abonnementActif: {
      type: "Trimestriel",
      dateFin: "2026-02-28",
    },
  },
  {
    id: "c2",
    nom: "Dubois",
    prenom: "Pierre",
    email: "pierre.dubois@example.com",
    telephone: "+216 98 765 432",
    dateInscription: "2024-12-01",
    abonnementActif: {
      type: "Mensuel",
      dateFin: "2026-02-01",
    },
  },
];

/**
 * Noms des jours de la semaine en français
 */
export const joursSemaine = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
