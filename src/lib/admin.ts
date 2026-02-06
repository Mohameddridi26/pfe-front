export type StatutInscription =
  | "en_attente"
  | "en_attente_pieces"
  | "valide"
  | "refuse";

export interface InscriptionEnAttente {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  cin: string;
  dateSoumission: string;
  statut: StatutInscription;
  piecesManquantes: string[];
  photo: boolean;
  certificatMedical: boolean;
  assurance: boolean;
}

export const inscriptionsEnAttenteMock: InscriptionEnAttente[] = [
  {
    id: "ins1",
    nom: "Martin",
    prenom: "Sophie",
    email: "sophie.martin@email.com",
    telephone: "06 12 34 56 78",
    cin: "AB123456",
    dateSoumission: "2026-01-30",
    statut: "en_attente",
    piecesManquantes: [],
    photo: true,
    certificatMedical: true,
    assurance: true,
  },
  {
    id: "ins2",
    nom: "Durand",
    prenom: "Pierre",
    email: "pierre.durand@email.com",
    telephone: "06 99 88 77 66",
    cin: "CD789012",
    dateSoumission: "2026-01-29",
    statut: "en_attente_pieces",
    piecesManquantes: ["Certificat médical"],
    photo: true,
    certificatMedical: false,
    assurance: true,
  },
  {
    id: "ins3",
    nom: "Lefebvre",
    prenom: "Marie",
    email: "marie.lefebvre@email.com",
    telephone: "07 11 22 33 44",
    cin: "EF345678",
    dateSoumission: "2026-01-28",
    statut: "en_attente_pieces",
    piecesManquantes: ["Assurance"],
    photo: true,
    certificatMedical: true,
    assurance: false,
  },
];
