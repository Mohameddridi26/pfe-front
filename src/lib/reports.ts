export type TypeReport = "probleme_technique" | "probleme_seance" | "probleme_coach" | "probleme_equipement" | "autre";

export type StatutReport = "en_attente" | "en_cours" | "resolu" | "rejete";

export interface Report {
  id: string;
  auteurId: string; // ID de l'utilisateur qui a créé le rapport
  auteurNom: string;
  auteurEmail: string;
  auteurRole: "membre" | "coach";
  type: TypeReport;
  titre: string;
  description: string;
  dateCreation: string; // Format YYYY-MM-DD
  statut: StatutReport;
  reponseAdmin?: string; // Réponse de l'admin
  dateReponse?: string; // Date de la réponse
}

export const typesReportConfig: Record<TypeReport, { label: string; description: string }> = {
  probleme_technique: {
    label: "Problème technique",
    description: "Problème avec le site web, l'application ou les systèmes",
  },
  probleme_seance: {
    label: "Problème avec une séance",
    description: "Problème lié à une séance spécifique (annulation, horaire, etc.)",
  },
  probleme_coach: {
    label: "Problème avec un coach",
    description: "Signalement concernant un coach",
  },
  probleme_equipement: {
    label: "Problème d'équipement",
    description: "Équipement défectueux ou manquant",
  },
  autre: {
    label: "Autre",
    description: "Autre type de problème",
  },
};

export const statutReportConfig: Record<StatutReport, { label: string; className: string }> = {
  en_attente: {
    label: "En attente",
    className: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  },
  en_cours: {
    label: "En cours",
    className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  },
  resolu: {
    label: "Résolu",
    className: "bg-green-500/20 text-green-500 border-green-500/30",
  },
  rejete: {
    label: "Rejeté",
    className: "bg-red-500/20 text-red-500 border-red-500/30",
  },
};

// Mock data pour les rapports existants
export const reportsMock: Report[] = [];
