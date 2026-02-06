export type StatutAbonnement = "actif" | "expire" | "a_renouveler" | "suspendu";

export type TypeAbonnement = "Mensuel" | "Trimestriel" | "Annuel";

export type StatutDemandeAbonnement = "en_attente" | "acceptee" | "refusee";

export interface DemandeAbonnement {
  id: string;
  membreId: string;
  membreNom: string;
  membreEmail: string;
  membreTel: string;
  typeAbonnement: TypeAbonnement;
  prix: number;
  dateDemande: string;
  statut: StatutDemandeAbonnement;
  methodePaiement?: string;
  detailsPaiement?: any;
  raisonRefus?: string;
}

export interface Abonnement {
  id: string;
  membreId: string;
  membreNom: string;
  membreEmail: string;
  membreTel: string;
  type: TypeAbonnement;
  prix: number;
  dateDebut: string;
  dateFin: string;
  statut: StatutAbonnement;
  renouvellementAuto: boolean;
}

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const addMonths = (dateStr: string, months: number) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};

const today = new Date().toISOString().split("T")[0];

export const abonnementsMock: Abonnement[] = [
  {
    id: "1",
    membreId: "m1",
    membreNom: "Sophie Martin",
    membreEmail: "sophie.martin@email.com",
    membreTel: "06 12 34 56 78",
    type: "Trimestriel",
    prix: 420,
    dateDebut: addMonths(today, -2),
    dateFin: addMonths(today, 1),
    statut: "actif",
    renouvellementAuto: true,
  },
  {
    id: "2",
    membreId: "m2",
    membreNom: "Lucas Dubois",
    membreEmail: "lucas.dubois@email.com",
    membreTel: "06 98 76 54 32",
    type: "Mensuel",
    prix: 160,
    dateDebut: addMonths(today, 0),
    dateFin: addMonths(today, 1),
    statut: "actif",
    renouvellementAuto: false,
  },
  {
    id: "3",
    membreId: "m3",
    membreNom: "Emma Bernard",
    membreEmail: "emma.bernard@email.com",
    membreTel: "07 11 22 33 44",
    type: "Annuel",
    prix: 1460,
    dateDebut: addMonths(today, -10),
    dateFin: addMonths(today, 2),
    statut: "actif",
    renouvellementAuto: true,
  },
  {
    id: "4",
    membreId: "m4",
    membreNom: "Thomas Leroy",
    membreEmail: "thomas.leroy@email.com",
    membreTel: "06 55 66 77 88",
    type: "Mensuel",
    prix: 160,
    dateDebut: addMonths(today, -1),
    dateFin: addDays(today, 2),
    statut: "a_renouveler",
    renouvellementAuto: false,
  },
  {
    id: "5",
    membreId: "m5",
    membreNom: "Léa Petit",
    membreEmail: "lea.petit@email.com",
    membreTel: "06 99 88 77 66",
    type: "Trimestriel",
    prix: 420,
    dateDebut: addMonths(today, -4),
    dateFin: addDays(today, -5),
    statut: "expire",
    renouvellementAuto: false,
  },
  {
    id: "6",
    membreId: "m6",
    membreNom: "Hugo Moreau",
    membreEmail: "hugo.moreau@email.com",
    membreTel: "07 12 34 56 78",
    type: "Annuel",
    prix: 1460,
    dateDebut: addMonths(today, -12),
    dateFin: addDays(today, -1),
    statut: "expire",
    renouvellementAuto: false,
  },
  {
    id: "7",
    membreId: "m7",
    membreNom: "Chloé Laurent",
    membreEmail: "chloe.laurent@email.com",
    membreTel: "06 44 55 66 77",
    type: "Mensuel",
    prix: 160,
    dateDebut: addMonths(today, -1),
    dateFin: addDays(today, 4),
    statut: "a_renouveler",
    renouvellementAuto: false,
  },
  {
    id: "8",
    membreId: "m8",
    membreNom: "Nathan Simon",
    membreEmail: "nathan.simon@email.com",
    membreTel: "06 33 22 11 00",
    type: "Trimestriel",
    prix: 420,
    dateDebut: addMonths(today, -1),
    dateFin: addMonths(today, 2),
    statut: "actif",
    renouvellementAuto: true,
  },
];

// Demandes d'abonnement (renouvellement/changement)
export const demandesAbonnementMock: DemandeAbonnement[] = [];
