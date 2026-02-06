export interface PlanTarif {
  id: string;
  name: string;
  price: string; // Format "160" ou "1 460"
  period: string; // "/mois", "/3 mois", "/an"
  description: string;
  features: string[];
  popular: boolean;
  actif: boolean; // Pour activer/désactiver un plan
}

export const plansTarifsMock: PlanTarif[] = [
  {
    id: "mensuel",
    name: "Mensuel",
    price: "160",
    period: "/mois",
    description: "Accès flexible sans engagement",
    features: [
      "Accès illimité à la salle",
      "Cours collectifs inclus",
      "Vestiaires & Douches",
      "Application mobile",
    ],
    popular: false,
    actif: true,
  },
  {
    id: "trimestriel",
    name: "Trimestriel",
    price: "420",
    period: "/3 mois",
    description: "L'équilibre parfait",
    features: [
      "Tout du forfait Mensuel",
      "1 séance coaching offerte",
      "Programme IA personnalisé",
      "Accès heures creuses étendu",
      "Gel d'abonnement (7 jours)",
    ],
    popular: true,
    actif: true,
  },
  {
    id: "annuel",
    name: "Annuel",
    price: "1 460",
    period: "/an",
    description: "Le meilleur rapport qualité/prix",
    features: [
      "Tout du forfait Trimestriel",
      "4 séances coaching offertes",
      "Accès 24h/24",
      "Gel d'abonnement (30 jours)",
      "Invité gratuit 1x/mois",
      "Réduction partenaires",
    ],
    popular: false,
    actif: true,
  },
];
