import type { MethodePaiement, DetailsPaiement } from "./paiement";
import type { TypeAbonnement } from "./abonnements";

export type StatutInscription = "en_attente_validation" | "en_attente_pieces" | "valide" | "rejete";

export interface Inscription {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  cin: string;
  dateSoumission: string;
  statut: StatutInscription;
  certificatMedical: boolean;
  assurance: boolean;
  photo: boolean;
  piecesManquantes?: string[];
  /** Type d'abonnement demandé (pour renouvellement/changement) */
  typeAbonnementDemande?: TypeAbonnement;
  /** Méthode de paiement affectée lors de la validation (inscription validée) */
  methodePaiement?: MethodePaiement;
  /** Détails du paiement selon la méthode (contraintes respectées) */
  detailsPaiement?: DetailsPaiement;
}

export const inscriptionsMock: Inscription[] = [
  {
    id: "ins1",
    nom: "Martin",
    prenom: "Julie",
    email: "julie.martin@email.com",
    telephone: "06 11 22 33 44",
    cin: "AB123456",
    dateSoumission: "2026-01-30",
    statut: "en_attente_validation",
    certificatMedical: true,
    assurance: true,
    photo: true,
  },
  {
    id: "ins2",
    nom: "Dupont",
    prenom: "Pierre",
    email: "pierre.dupont@email.com",
    telephone: "06 55 66 77 88",
    cin: "CD789012",
    dateSoumission: "2026-01-29",
    statut: "en_attente_pieces",
    certificatMedical: false,
    assurance: true,
    photo: true,
    piecesManquantes: ["Certificat médical"],
  },
  {
    id: "ins3",
    nom: "Bernard",
    prenom: "Marie",
    email: "marie.bernard@email.com",
    telephone: "07 99 88 77 66",
    cin: "EF345678",
    dateSoumission: "2026-01-31",
    statut: "en_attente_validation",
    certificatMedical: true,
    assurance: false,
    photo: true,
  },
  {
    id: "ins4",
    nom: "Roux",
    prenom: "Antoine",
    email: "antoine.roux@email.com",
    telephone: "06 12 34 56 78",
    cin: "GH901234",
    dateSoumission: "2026-01-28",
    statut: "en_attente_pieces",
    certificatMedical: true,
    assurance: false,
    photo: false,
    piecesManquantes: ["Assurance", "Photo d'identité"],
  },
];
