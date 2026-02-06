export type SportId = "musculation" | "crossfit" | "yoga" | "zumba" | "boxe" | "pilates";

export interface CoursDescription {
  id: SportId;
  nom: string;
  description: string;
  avantages: string[];
  duree: string;
  intensite: string;
  coach: string;
  salle: string;
}

export const coursData: Record<SportId, CoursDescription> = {
  musculation: {
    id: "musculation",
    nom: "Musculation",
    description:
      "La musculation permet de développer votre force musculaire, votre endurance et votre masse musculaire grâce à des équipements de pointe. Nos coachs vous accompagnent pour des séances personnalisées adaptées à vos objectifs.",
    avantages: [
      "Développement de la force et de la masse musculaire",
      "Renforcement des articulations et de la posture",
      "Amélioration de la condition physique globale",
      "Équipements professionnels dernier cri",
    ],
    duree: "45 à 90 min",
    intensite: "Modérée à intense",
    coach: "Jean P.",
    salle: "Salle 3",
  },
  crossfit: {
    id: "crossfit",
    nom: "CrossFit",
    description:
      "Le CrossFit combine cardio, haltérophilie et gymnastique pour un entraînement complet et varié. Chaque séance est un défi différent qui sollicite l'ensemble du corps. Idéal pour ceux qui cherchent la performance et la variété.",
    avantages: [
      "Entraînement complet du corps",
      "Séances variées, jamais monotones",
      "Amélioration de la condition physique globale",
      "Esprit d'équipe et dépassement de soi",
    ],
    duree: "60 min",
    intensite: "Intense",
    coach: "Marc D.",
    salle: "Salle 2",
  },
  yoga: {
    id: "yoga",
    nom: "Yoga",
    description:
      "Le yoga allie postures, respiration et méditation pour un équilibre entre le corps et l'esprit. Nos cours conviennent à tous les niveaux, du débutant au pratiquant confirmé. Une parenthèse de sérénité dans votre semaine.",
    avantages: [
      "Souplesse et flexibilité accrues",
      "Réduction du stress et meilleure gestion des émotions",
      "Amélioration de la posture et du tonus",
      "Respiration et concentration optimisées",
    ],
    duree: "60 à 75 min",
    intensite: "Douce à modérée",
    coach: "Sarah M.",
    salle: "Salle 1",
  },
  zumba: {
    id: "zumba",
    nom: "Zumba",
    description:
      "La Zumba fusionne danse latine et fitness pour des séances rythmées et fun. En musique, vous travaillez cardio et coordination sans voir le temps passer. Accessible à tous, c'est le cours idéal pour se dépenser en s'amusant.",
    avantages: [
      "Cardio ludique et efficace",
      "Bonne humeur garantie",
      "Amélioration de la coordination et du rythme",
      "Brule des calories sans compter",
    ],
    duree: "60 min",
    intensite: "Modérée",
    coach: "Amina K.",
    salle: "Salle 1",
  },
  boxe: {
    id: "boxe",
    nom: "Boxe",
    description:
      "La boxe fitness développe votre explosivité, votre endurance et votre coordination. Techniques de frappe sur sac, shadow boxing et renforcement musculaire : une discipline complète pour se défouler et se renforcer.",
    avantages: [
      "Cardio intense et explosivité",
      "Défoulement et gestion du stress",
      "Renforcement du haut du corps",
      "Coordination et réflexes améliorés",
    ],
    duree: "60 min",
    intensite: "Intense",
    coach: "Ahmed B.",
    salle: "Salle 2",
  },
  pilates: {
    id: "pilates",
    nom: "Pilates",
    description:
      "Le Pilates renforce les muscles profonds, améliore la posture et la souplesse. Sur tapis ou avec accessoires, les exercices ciblent le gainage et le contrôle du corps. Parfait pour un dos en forme et un ventre plat.",
    avantages: [
      "Renforcement du centre (abdos, dos)",
      "Posture et alignement améliorés",
      "Souplesse et mobilité",
      "Prévention des douleurs dorsales",
    ],
    duree: "55 min",
    intensite: "Modérée",
    coach: "Marie L.",
    salle: "Salle 3",
  },
};
