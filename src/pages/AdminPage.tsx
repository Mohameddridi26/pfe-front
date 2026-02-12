import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck,
  Calendar,
  AlertTriangle,
  Check,
  X,
  FileWarning,
  Shield,
  CreditCard,
  Banknote,
  Building2,
  Landmark,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Dashboard from "@/components/Dashboard";
import { type Inscription, type StatutInscription } from "@/lib/inscriptions";
import { abonnementsMock } from "@/lib/abonnements";
import {
  type Seance,
  coachsDisponibles,
  sallesDisponibles,
  validerSeance,
  type ConflitCoach,
} from "@/lib/seances";
import { useSeances } from "@/contexts/SeancesContext";
import { useReservations } from "@/contexts/ReservationsContext";
import { useInscriptions } from "@/contexts/InscriptionsContext";
import { useReports } from "@/contexts/ReportsContext";
import { useAbonnements } from "@/contexts/AbonnementsContext";
import { coursData, type SportId } from "@/lib/cours";
import { domainesSpecialite, type Disponibilite } from "@/lib/coach";
import { useTarifs } from "@/contexts/TarifsContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { typesReportConfig, statutReportConfig, type StatutReport } from "@/lib/reports";
import { Textarea } from "@/components/ui/textarea";

const statutConfig: Record<StatutInscription, { label: string; className: string }> = {
  en_attente_validation: {
    label: "En attente de validation",
    className: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  },
  en_attente_pieces: {
    label: "En attente de pièces",
    className: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  },
  valide: { label: "Validé", className: "bg-green-500/20 text-green-500 border-green-500/30" },
  rejete: { label: "Rejeté", className: "bg-red-500/20 text-red-500 border-red-500/30" },
};

interface Coach {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  mdp: string;
  specialites: string[]; // 1 à 2 spécialités maximum
  tel: string;
  disponibilites?: Disponibilite[]; // Disponibilités du coach
}

// Mapping entre les activités et les spécialités
const mappingActiviteSpecialite: Record<SportId, string> = {
  musculation: "Musculation",
  crossfit: "CrossFit",
  yoga: "Yoga",
  zumba: "Zumba",
  boxe: "Boxe",
  pilates: "Pilates",
};

// Convertir les coachs disponibles initiaux en objets Coach
// Pour l'instant, on utilise des disponibilités mock par défaut
// Dans une vraie application, ces disponibilités seraient récupérées depuis la base de données
const initialCoachs: Coach[] = coachsDisponibles.map((nom, index) => ({
  id: `coach-${index + 1}`,
  nom: nom.split(" ")[0] || nom,
  prenom: nom.split(" ")[1] || "",
  email: `${nom.toLowerCase().replace(/\s/g, ".")}@fitzone.com`,
  mdp: "",
  specialites: ["Fitness général"], // Par défaut une seule spécialité
  tel: "",
  disponibilites: [
    { id: `d-${index}-1`, jourSemaine: 1, heureDebut: "08:00", heureFin: "12:00" }, // Lundi matin
    { id: `d-${index}-2`, jourSemaine: 1, heureDebut: "14:00", heureFin: "18:00" }, // Lundi après-midi
    { id: `d-${index}-3`, jourSemaine: 3, heureDebut: "08:00", heureFin: "12:00" }, // Mercredi matin
    { id: `d-${index}-4`, jourSemaine: 3, heureDebut: "14:00", heureFin: "18:00" }, // Mercredi après-midi
    { id: `d-${index}-5`, jourSemaine: 5, heureDebut: "08:00", heureFin: "12:00" }, // Vendredi matin
  ],
}));

// Ajouter le coach connecté (coach@fitzone.com) s'il n'existe pas déjà
const coachConnecte: Coach = {
  id: "coach-1",
  nom: "P.",
  prenom: "Jean",
  email: "coach@fitzone.com",
  mdp: "",
  specialites: ["Musculation", "Boxe"], // Exemple avec 2 spécialités
  tel: "",
  disponibilites: [
    { id: "d-coach-1", jourSemaine: 1, heureDebut: "08:00", heureFin: "12:00" },
    { id: "d-coach-2", jourSemaine: 1, heureDebut: "14:00", heureFin: "18:00" },
    { id: "d-coach-3", jourSemaine: 3, heureDebut: "08:00", heureFin: "12:00" },
    { id: "d-coach-4", jourSemaine: 3, heureDebut: "14:00", heureFin: "18:00" },
    { id: "d-coach-5", jourSemaine: 5, heureDebut: "08:00", heureFin: "12:00" },
  ],
};

// Vérifier si le coach connecté existe déjà, sinon l'ajouter
if (!initialCoachs.find((c) => c.email === "coach@fitzone.com")) {
  initialCoachs.unshift(coachConnecte);
}

const AdminPage = () => {
  const { toast } = useToast();
  const { inscriptions, setInscriptions } = useInscriptions();
  const { reservations } = useReservations();
  const { reports, modifierReport, getReportsEnAttente } = useReports();
  const { ajouterAbonnement } = useAbonnements();
  const { plans } = useTarifs();
  const [reportEnCours, setReportEnCours] = useState<string | null>(null);
  const [reponseReport, setReponseReport] = useState("");
  const [statutReport, setStatutReport] = useState<StatutReport>("en_attente");
  const { seances, setSeances } = useSeances();
  const [seanceDialogOpen, setSeanceDialogOpen] = useState(false);
  const [seanceEnEdition, setSeanceEnEdition] = useState<Seance | null>(null);
  const [nouvelleSeance, setNouvelleSeance] = useState<Omit<Seance, "id">>({
    activite: "musculation",
    coach: "",
    salle: "",
    date: format(new Date(), "yyyy-MM-dd"),
    heureDebut: "09:00",
    heureFin: "10:00",
    capaciteMax: 20,
    inscrits: 0,
  });
  const [conflitDetecte, setConflitDetecte] = useState<ConflitCoach | null>(null);
  const [coachs, setCoachs] = useState<Coach[]>(initialCoachs);
  const [coachDialogOpen, setCoachDialogOpen] = useState(false);
  const [coachEnEdition, setCoachEnEdition] = useState<Coach | null>(null);
  const [nouveauCoach, setNouveauCoach] = useState<Omit<Coach, "id">>({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    specialites: [],
    tel: "",
  });

  const aValider = inscriptions.filter((i) => i.statut === "en_attente_validation").length;
  const aPieces = inscriptions.filter((i) => i.statut === "en_attente_pieces").length;
  const abonnementsExpirant = abonnementsMock.filter((a) => a.statut === "a_renouveler").length;

  const getNomCompletCoach = (coach: Coach) => `${coach.prenom} ${coach.nom}`.trim();

  const ouvrirDialogCoach = (coach?: Coach) => {
    if (coach) {
      setCoachEnEdition(coach);
      setNouveauCoach({
        nom: coach.nom,
        prenom: coach.prenom,
        email: coach.email,
        mdp: "",
        specialites: [...coach.specialites],
        tel: coach.tel,
      });
    } else {
      setCoachEnEdition(null);
      setNouveauCoach({
        nom: "",
        prenom: "",
        email: "",
        mdp: "",
        specialites: [],
        tel: "",
      });
    }
    setCoachDialogOpen(true);
  };

  const fermerDialogCoach = () => {
    setCoachDialogOpen(false);
    setCoachEnEdition(null);
    setNouveauCoach({
      nom: "",
      prenom: "",
      email: "",
      mdp: "",
      specialites: [],
      tel: "",
    });
  };

  const handleSauvegarderCoach = () => {
    if (!nouveauCoach.nom.trim() || !nouveauCoach.prenom.trim() || !nouveauCoach.email.trim() || nouveauCoach.specialites.length === 0) {
      toast({
        variant: "destructive",
        title: "Champs requis manquants",
        description: "Veuillez remplir tous les champs obligatoires, y compris au moins une spécialité.",
      });
      return;
    }
    
    if (nouveauCoach.specialites.length > 2) {
      toast({
        variant: "destructive",
        title: "Trop de spécialités",
        description: "Un coach ne peut avoir qu'un maximum de 2 spécialités.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nouveauCoach.email)) {
      toast({
        variant: "destructive",
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
      });
      return;
    }

    // Vérifier si l'email existe déjà (sauf pour le coach en édition)
    const emailExiste = coachs.some(
      (c) => c.email === nouveauCoach.email && c.id !== coachEnEdition?.id
    );
    if (emailExiste) {
      toast({
        variant: "destructive",
        title: "Email déjà utilisé",
        description: "Un coach avec cet email existe déjà.",
      });
      return;
    }

    if (coachEnEdition) {
      // Modification
      const nomCompletAvant = getNomCompletCoach(coachEnEdition);
      const nomCompletApres = getNomCompletCoach({
        ...coachEnEdition,
        ...nouveauCoach,
      } as Coach);

      setCoachs((prev) =>
        prev.map((c) => (c.id === coachEnEdition.id ? { ...coachEnEdition, ...nouveauCoach } : c))
      );

      // Mettre à jour les séances si le nom complet a changé
      if (nomCompletAvant !== nomCompletApres) {
        setSeances((prev) =>
          prev.map((s) => (s.coach === nomCompletAvant ? { ...s, coach: nomCompletApres } : s))
        );
      }

      toast({
        title: "Coach modifié",
        description: `Les informations de ${nomCompletApres} ont été mises à jour.`,
      });
    } else {
      // Création
      const nouveauId = `coach-${Date.now()}`;
      const nouveauCoachComplet: Coach = {
        id: nouveauId,
        ...nouveauCoach,
      };
      const nomComplet = getNomCompletCoach(nouveauCoachComplet);

      setCoachs((prev) => [...prev, nouveauCoachComplet]);
      toast({
        title: "Coach ajouté",
        description: `${nomComplet} a été ajouté à la liste des coaches.`,
      });
    }

    fermerDialogCoach();
  };

  const handleSupprimerCoach = (coach: Coach) => {
    const nomComplet = getNomCompletCoach(coach);
    const ok = window.confirm(
      `Supprimer ${nomComplet} ? Les séances existantes garderont l'ancien nom.`
    );
    if (!ok) return;
    setCoachs((prev) => prev.filter((c) => c.id !== coach.id));
    toast({
      title: "Coach supprimé",
      description: `${nomComplet} a été supprimé de la liste.`,
    });
  };

  const handleValider = (inscription: Inscription) => {
    if (!inscription.certificatMedical) {
      toast({
        variant: "destructive",
        title: "Certificat manquant",
        description: "Le certificat médical est obligatoire. Statut reste « En attente de pièces ».",
      });
      setInscriptions((prev) =>
        prev.map((i) =>
          i.id === inscription.id
            ? {
                ...i,
                statut: "en_attente_pieces" as const,
                piecesManquantes: ["Certificat médical"],
              }
            : i
        )
      );
      return;
    }
    
    // Valider l'inscription
    setInscriptions((prev) =>
      prev.map((i) =>
        i.id === inscription.id
          ? {
              ...i,
              statut: "valide" as const,
            }
          : i
      )
    );
    
    // Créer un abonnement automatiquement si un type d'abonnement a été demandé
    if (inscription.typeAbonnementDemande) {
      const planSelectionne = plans.find((p) => p.name === inscription.typeAbonnementDemande);
      
      if (planSelectionne) {
        const aujourdhui = new Date().toISOString().split("T")[0];
        let dateFin: string;
        let prix: number;
        
        // Calculer la date de fin et le prix selon le type
        if (inscription.typeAbonnementDemande === "Mensuel") {
          const d = new Date(aujourdhui);
          d.setMonth(d.getMonth() + 1);
          dateFin = d.toISOString().split("T")[0];
          prix = parseInt(planSelectionne.price.replace(/\s/g, ""));
        } else if (inscription.typeAbonnementDemande === "Trimestriel") {
          const d = new Date(aujourdhui);
          d.setMonth(d.getMonth() + 3);
          dateFin = d.toISOString().split("T")[0];
          prix = parseInt(planSelectionne.price.replace(/\s/g, ""));
        } else {
          const d = new Date(aujourdhui);
          d.setMonth(d.getMonth() + 12);
          dateFin = d.toISOString().split("T")[0];
          prix = parseInt(planSelectionne.price.replace(/\s/g, ""));
        }
        
        // Générer un ID de membre basé sur l'inscription ou utiliser l'ID existant si déjà membre
        // Pour l'instant, on utilise l'email comme identifiant unique
        // Dans le backend, cela sera géré automatiquement
        const membreId = `m-${inscription.email.replace(/[^a-zA-Z0-9]/g, "-")}`;
        
        ajouterAbonnement({
          id: `ab-${Date.now()}`,
          membreId: membreId,
          membreNom: `${inscription.prenom} ${inscription.nom}`,
          membreEmail: inscription.email,
          membreTel: inscription.telephone,
          type: inscription.typeAbonnementDemande as any,
          prix: prix,
          dateDebut: aujourdhui,
          dateFin: dateFin,
          statut: "actif",
          renouvellementAuto: false,
        });
      }
    }
    
    toast({
      title: "Dossier validé",
      description: `${inscription.prenom} ${inscription.nom} a été validé avec succès${inscription.typeAbonnementDemande ? ` et un abonnement ${inscription.typeAbonnementDemande} a été créé.` : "."}`,
    });
  };


  const handleRejeter = (inscription: Inscription) => {
    setInscriptions((prev) =>
      prev.map((i) => (i.id === inscription.id ? { ...i, statut: "rejete" as const } : i))
    );
    toast({
      variant: "destructive",
      title: "Dossier rejeté",
      description: `Le dossier de ${inscription.prenom} ${inscription.nom} a été rejeté.`,
    });
  };

  // Gestion des séances
  const ouvrirDialogSeance = (seance?: Seance) => {
    if (seance) {
      setSeanceEnEdition(seance);
      setNouvelleSeance({
        activite: seance.activite,
        coach: seance.coach,
        salle: seance.salle,
        date: seance.date,
        heureDebut: seance.heureDebut,
        heureFin: seance.heureFin,
        capaciteMax: seance.capaciteMax ?? 20,
        inscrits: seance.inscrits ?? 0,
      });
    } else {
      setSeanceEnEdition(null);
      setNouvelleSeance({
        activite: "musculation",
        coach: "",
        salle: "",
        date: format(new Date(), "yyyy-MM-dd"),
        heureDebut: "09:00",
        heureFin: "10:00",
        capaciteMax: 20,
        inscrits: 0,
      });
    }
    setConflitDetecte(null);
    setSeanceDialogOpen(true);
  };

  const fermerDialogSeance = () => {
    setSeanceDialogOpen(false);
    setSeanceEnEdition(null);
    setConflitDetecte(null);
  };

  const verifierConflit = () => {
    const resultat = validerSeance(seances, nouvelleSeance, seanceEnEdition?.id);
    if (!resultat.valide) {
      const conflitResult = resultat as { valide: false; conflit: ConflitCoach };
      setConflitDetecte(conflitResult.conflit);
      return false;
    }
    setConflitDetecte(null);
    return true;
  };

  // Vérifier si le coach est spécialisé dans l'activité (vérifie parmi ses 1-2 spécialités)
  const verifierSpecialiteCoach = (coachNom: string, activite: SportId): boolean => {
    const coach = coachs.find((c) => getNomCompletCoach(c) === coachNom);
    if (!coach) return false;
    
    const specialiteRequise = mappingActiviteSpecialite[activite];
    if (!specialiteRequise) return true; // Si pas de mapping, on accepte
    
    // Vérifier si le coach a la spécialité requise parmi ses spécialités (1-2 max)
    return coach.specialites.includes(specialiteRequise);
  };

  // Vérifier si le coach est disponible au jour et à l'heure de la séance
  const verifierDisponibiliteCoach = (coachNom: string, date: string, heureDebut: string, heureFin: string): boolean => {
    const coach = coachs.find((c) => getNomCompletCoach(c) === coachNom);
    if (!coach || !coach.disponibilites || coach.disponibilites.length === 0) {
      // Si pas de disponibilités définies, on accepte (pour compatibilité)
      return true;
    }

    const dateSeance = new Date(date);
    const jourSemaine = dateSeance.getDay(); // 0 = Dimanche, 1 = Lundi, etc.

    // Vérifier si le coach a une disponibilité ce jour-là
    const disponibiliteJour = coach.disponibilites.find((d) => d.jourSemaine === jourSemaine);
    if (!disponibiliteJour) {
      return false; // Pas disponible ce jour
    }

    // Vérifier si les heures de la séance sont dans la plage de disponibilité
    const heureDebutSeance = heureDebut.split(":").map(Number);
    const heureFinSeance = heureFin.split(":").map(Number);
    const heureDebutDispo = disponibiliteJour.heureDebut.split(":").map(Number);
    const heureFinDispo = disponibiliteJour.heureFin.split(":").map(Number);

    const minutesDebutSeance = heureDebutSeance[0] * 60 + heureDebutSeance[1];
    const minutesFinSeance = heureFinSeance[0] * 60 + heureFinSeance[1];
    const minutesDebutDispo = heureDebutDispo[0] * 60 + heureDebutDispo[1];
    const minutesFinDispo = heureFinDispo[0] * 60 + heureFinDispo[1];

    // La séance doit commencer après le début de la disponibilité et finir avant la fin
    return minutesDebutSeance >= minutesDebutDispo && minutesFinSeance <= minutesFinDispo;
  };

  const handleSauvegarderSeance = () => {
    if (!nouvelleSeance.coach || !nouvelleSeance.salle) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    // Valider que la date n'est pas dans le passé
    const dateSeance = new Date(nouvelleSeance.date);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    dateSeance.setHours(0, 0, 0, 0);
    
    if (dateSeance < aujourdhui) {
      toast({
        variant: "destructive",
        title: "Date invalide",
        description: "Impossible de créer une séance dans le passé. Veuillez sélectionner une date future.",
      });
      return;
    }

    // Vérifier la spécialité du coach
    if (!verifierSpecialiteCoach(nouvelleSeance.coach, nouvelleSeance.activite)) {
      const coach = coachs.find((c) => getNomCompletCoach(c) === nouvelleSeance.coach);
      const specialiteRequise = mappingActiviteSpecialite[nouvelleSeance.activite];
      toast({
        variant: "destructive",
        title: "Spécialité incompatible",
        description: `Le coach ${nouvelleSeance.coach} est spécialisé en "${coach?.specialites.join(", ")}" mais l'activité "${coursData[nouvelleSeance.activite].nom}" nécessite la spécialité "${specialiteRequise}".`,
      });
      return;
    }

    // Vérifier la disponibilité du coach
    if (!verifierDisponibiliteCoach(nouvelleSeance.coach, nouvelleSeance.date, nouvelleSeance.heureDebut, nouvelleSeance.heureFin)) {
      toast({
        variant: "destructive",
        title: "Coach non disponible",
        description: `Le coach ${nouvelleSeance.coach} n'est pas disponible à cette date et heure. Veuillez vérifier ses disponibilités.`,
      });
      return;
    }

    if (!verifierConflit()) {
      toast({
        variant: "destructive",
        title: "Conflit détecté",
        description: conflitDetecte?.message || "Le coach est déjà assigné à une autre séance à ce moment.",
      });
      return;
    }

    if (seanceEnEdition) {
      setSeances((prev) =>
        prev.map((s) => (s.id === seanceEnEdition.id ? { ...seanceEnEdition, ...nouvelleSeance } : s))
      );
      toast({
        title: "Séance modifiée",
        description: `La séance de ${coursData[nouvelleSeance.activite].nom} a été modifiée avec succès.`,
      });
    } else {
      const nouvelleId = `s${Date.now()}`;
      setSeances((prev) => [...prev, { ...nouvelleSeance, id: nouvelleId }]);
      toast({
        title: "Séance créée",
        description: `La séance de ${coursData[nouvelleSeance.activite].nom} a été créée avec succès.`,
      });
    }
    fermerDialogSeance();
  };

  const handleSupprimerSeance = (seance: Seance) => {
    setSeances((prev) => prev.filter((s) => s.id !== seance.id));
    toast({
      title: "Séance supprimée",
      description: `La séance de ${coursData[seance.activite].nom} a été supprimée.`,
    });
  };

  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), "d MMM yyyy", { locale: fr });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-primary uppercase tracking-widest text-sm font-semibold">
                  Administration
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  Espace <span className="text-gradient-gold">Admin</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Validation des dossiers, gestion et tableau de bord décisionnel.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <Link to="/admin#validations" className="block">
              <div className="glass-card p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold">{aValider}</p>
                    <p className="text-muted-foreground text-sm">À valider</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/admin#validations" className="block">
              <div className="glass-card p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <FileWarning className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold">{aPieces}</p>
                    <p className="text-muted-foreground text-sm">En attente de pièces</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/abonnements" className="block">
              <div className="glass-card p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold">{abonnementsExpirant}</p>
                    <p className="text-muted-foreground text-sm">Abonnements à renouveler</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Tableau de bord en haut */}
          <div className="mb-8">
            <Dashboard />
          </div>

          {/* Tabs */}
          <div className="glass-card p-6">
            <Tabs defaultValue="validations" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid mb-6 bg-secondary">
                <TabsTrigger value="validations" className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Validations
                </TabsTrigger>
                <TabsTrigger value="coachs" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Gestion des coaches
                </TabsTrigger>
                <TabsTrigger value="planning" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Planning
                </TabsTrigger>
                <TabsTrigger value="signalements" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Signalements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="validations" id="validations">
                <h2 className="font-display text-xl font-bold mb-4">
                  Pipeline d'inscription numérique - Validation des dossiers et demandes d'abonnement
                </h2>
                <p className="text-muted-foreground mb-6">
                  Validez les dossiers d'inscription et les demandes de renouvellement/changement d'abonnement. 
                  Si le certificat médical manque, le statut reste « En attente de pièces ».
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Candidat</TableHead>
                        <TableHead>Soumission</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inscriptions
                        .filter((i) => i.statut !== "valide" && i.statut !== "rejete")
                        .map((inscription) => (
                          <TableRow key={inscription.id} className="border-border">
                            <TableCell>
                              <div>
                                <p className="font-semibold">
                                  {inscription.prenom} {inscription.nom}
                                </p>
                                <p className="text-xs text-muted-foreground">{inscription.email}</p>
                                <p className="text-xs text-muted-foreground">{inscription.telephone}</p>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(inscription.dateSoumission)}</TableCell>
                            <TableCell>
                              {inscription.typeAbonnementDemande ? (
                                <Badge variant="secondary" className="text-xs">
                                  {inscription.typeAbonnementDemande}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Nouvelle inscription</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 text-xs">
                                <Badge
                                  variant={inscription.photo ? "secondary" : "destructive"}
                                  className="text-xs"
                                >
                                  Photo
                                </Badge>
                                <Badge
                                  variant={inscription.certificatMedical ? "secondary" : "destructive"}
                                  className="text-xs"
                                >
                                  Certificat
                                </Badge>
                                <Badge
                                  variant={inscription.assurance ? "secondary" : "outline"}
                                  className="text-xs"
                                >
                                  Assurance
                                </Badge>
                              </div>
                              {inscription.piecesManquantes && (
                                <p className="text-xs text-orange-500 mt-1">
                                  Manquant: {inscription.piecesManquantes.join(", ")}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={statutConfig[inscription.statut].className}
                              >
                                {statutConfig[inscription.statut].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {inscription.statut === "en_attente_validation" && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleValider(inscription)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Valider
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejeter(inscription)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Rejeter
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="coachs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold mb-2">Gestion des coaches</h2>
                    <p className="text-muted-foreground">
                      Ajoutez, modifiez ou supprimez les coaches disponibles pour le planning. Les modifications seront reflétées dans le sélecteur de coach lors de la création de séances.
                    </p>
                  </div>
                  <Button onClick={() => ouvrirDialogCoach()} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter un coach
                  </Button>
                </div>

                {/* Liste des coachs existants */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Nom complet</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Spécialité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coachs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                            <p>Aucun coach défini pour le moment.</p>
                            <p className="text-sm mt-1">Cliquez sur "Ajouter un coach" pour commencer.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        coachs.map((coach) => (
                          <TableRow key={coach.id} className="border-border">
                            <TableCell className="font-medium">
                              {getNomCompletCoach(coach)}
                            </TableCell>
                            <TableCell>{coach.email}</TableCell>
                            <TableCell>{coach.tel || "-"}</TableCell>
                            <TableCell>{coach.specialites.join(", ") || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => ouvrirDialogCoach(coach)}
                                  title="Modifier le coach"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Modifier
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleSupprimerCoach(coach)}
                                  title="Supprimer le coach"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Supprimer
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="planning">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold mb-2">Planification des séances</h2>
                    <p className="text-muted-foreground">
                      Gérez les séances : activité, coach, salle et horaire. Le système empêche les conflits de planning.
                    </p>
                  </div>
                  <Button onClick={() => ouvrirDialogSeance()} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter une séance
                  </Button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Horaire</TableHead>
                        <TableHead>Activité</TableHead>
                        <TableHead>Coach</TableHead>
                        <TableHead>Salle</TableHead>
                        <TableHead>Capacité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seances.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            Aucune séance planifiée. Cliquez sur "Ajouter une séance" pour commencer.
                          </TableCell>
                        </TableRow>
                      ) : (
                        seances
                          .sort((a, b) => {
                            const dateCompare = a.date.localeCompare(b.date);
                            if (dateCompare !== 0) return dateCompare;
                            return a.heureDebut.localeCompare(b.heureDebut);
                          })
                          .map((seance) => (
                            <TableRow key={seance.id} className="border-border">
                              <TableCell className="font-medium">
                                {formatDate(seance.date)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  {seance.heureDebut} - {seance.heureFin}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{coursData[seance.activite].nom}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <User className="w-3 h-3 text-muted-foreground" />
                                  {seance.coach}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  {seance.salle}
                                </div>
                              </TableCell>
                              <TableCell>
                                {seance.inscrits ?? 0} / {seance.capaciteMax ?? "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => ouvrirDialogSeance(seance)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleSupprimerSeance(seance)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="outline" asChild>
                    <Link to="/planning">Voir le planning public</Link>
                  </Button>
                </div>

                {/* Section Confirmation des présences */}
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-display text-lg font-bold mb-4">Confirmation des présences</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Confirmez les séances passées pour valider les présences. Une fois confirmée, la séance apparaîtra comme complétée dans l'espace coach.
                  </p>
                  {seances.filter((s) => {
                    const dateSeance = new Date(s.date + "T" + s.heureDebut);
                    return dateSeance < new Date() && !s.completee;
                  }).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Toutes les séances passées sont confirmées</p>
                      <p className="text-sm mt-2">Aucune séance passée n'attend de confirmation.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead>Date</TableHead>
                            <TableHead>Horaire</TableHead>
                            <TableHead>Activité</TableHead>
                            <TableHead>Coach</TableHead>
                            <TableHead>Salle</TableHead>
                            <TableHead>Inscrits</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {seances
                            .filter((s) => {
                              const dateSeance = new Date(s.date + "T" + s.heureDebut);
                              return dateSeance < new Date() && !s.completee;
                            })
                            .sort((a, b) => {
                              const dateCompare = b.date.localeCompare(a.date);
                              if (dateCompare !== 0) return dateCompare;
                              return b.heureDebut.localeCompare(a.heureDebut);
                            })
                            .map((seance) => (
                              <TableRow key={seance.id} className="border-border">
                                <TableCell className="font-medium">
                                  {formatDate(seance.date)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                    {seance.heureDebut} - {seance.heureFin}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{coursData[seance.activite].nom}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm">
                                    <User className="w-3 h-3 text-muted-foreground" />
                                    {seance.coach}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    {seance.salle}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {seance.inscrits ?? 0} / {seance.capaciteMax ?? "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                      setSeances((prev) =>
                                        prev.map((s) =>
                                          s.id === seance.id ? { ...s, completee: true } : s
                                        )
                                      );
                                      toast({
                                        title: "Présence confirmée",
                                        description: `La séance du ${formatDate(seance.date)} a été confirmée. Elle apparaîtra comme complétée dans l'espace coach.`,
                                      });
                                    }}
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirmer présence
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Section Réservations */}
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-display text-lg font-bold mb-4">Réservations des membres</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Consultez toutes les réservations effectuées par les membres pour les séances.
                  </p>
                  {reservations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Aucune réservation</p>
                      <p className="text-sm mt-2">Aucun membre n'a encore réservé de séance.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead>Membre</TableHead>
                            <TableHead>Séance</TableHead>
                            <TableHead>Date séance</TableHead>
                            <TableHead>Horaire</TableHead>
                            <TableHead>Coach</TableHead>
                            <TableHead>Salle</TableHead>
                            <TableHead>Date réservation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reservations
                            .sort((a, b) => {
                              const dateCompare = a.dateSeance.localeCompare(b.dateSeance);
                              if (dateCompare !== 0) return dateCompare;
                              return a.heureDebut.localeCompare(b.heureDebut);
                            })
                            .map((reservation) => {
                              const seance = seances.find((s) => s.id === reservation.seanceId);
                              return (
                                <TableRow key={reservation.id} className="border-border">
                                  <TableCell className="font-medium">
                                    Membre #{reservation.membreId}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {coursData[reservation.activite]?.nom || reservation.activite}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{formatDate(reservation.dateSeance)}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                      <Clock className="w-3 h-3 text-muted-foreground" />
                                      {reservation.heureDebut} - {reservation.heureFin}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                      <User className="w-3 h-3 text-muted-foreground" />
                                      {reservation.coach}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                      <MapPin className="w-3 h-3 text-muted-foreground" />
                                      {reservation.salle}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(reservation.dateReservation)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="signalements">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold mb-2">Gestion des signalements</h2>
                    <p className="text-muted-foreground">
                      Consultez et répondez aux signalements envoyés par les membres et les coaches.
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                    {getReportsEnAttente().length} en attente
                  </Badge>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium text-lg">Aucun signalement</p>
                    <p className="text-sm mt-2">Aucun signalement n'a été envoyé pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports
                      .sort((a, b) => {
                        // Prioriser les signalements en attente
                        if (a.statut === "en_attente" && b.statut !== "en_attente") return -1;
                        if (a.statut !== "en_attente" && b.statut === "en_attente") return 1;
                        // Ensuite trier par date (plus récent en premier)
                        return b.dateCreation.localeCompare(a.dateCreation);
                      })
                      .map((report) => (
                        <Card key={report.id} className="bg-secondary/30 border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-semibold">{report.titre}</p>
                                  <Badge
                                    variant="outline"
                                    className={statutReportConfig[report.statut].className}
                                  >
                                    {statutReportConfig[report.statut].label}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {report.auteurRole === "membre" ? "Membre" : "Coach"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  <strong>Auteur:</strong> {report.auteurNom} ({report.auteurEmail})
                                </p>
                                <p className="text-sm text-muted-foreground mb-1">
                                  <strong>Type:</strong> {typesReportConfig[report.type].label}
                                </p>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {report.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Envoyé le {formatDate(report.dateCreation)}
                                </p>
                                {report.reponseAdmin && (
                                  <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <p className="text-xs font-semibold text-primary mb-1">
                                      Votre réponse:
                                    </p>
                                    <p className="text-sm">{report.reponseAdmin}</p>
                                    {report.dateReponse && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Le {formatDate(report.dateReponse)}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                {report.statut === "en_attente" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setReportEnCours(report.id);
                                      setReponseReport("");
                                      setStatutReport("en_cours");
                                    }}
                                  >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Répondre
                                  </Button>
                                )}
                                <Select
                                  value={report.statut}
                                  onValueChange={(value) => {
                                    modifierReport(report.id, { statut: value as StatutReport });
                                    toast({
                                      title: "Statut mis à jour",
                                      description: `Le statut du signalement a été changé en "${statutReportConfig[value as StatutReport].label}".`,
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(statutReportConfig).map(([key, config]) => (
                                      <SelectItem key={key} value={key}>
                                        {config.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Dialog Création/Modification de séance */}
          <Dialog open={seanceDialogOpen} onOpenChange={(open) => !open && fermerDialogSeance()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {seanceEnEdition ? "Modifier la séance" : "Nouvelle séance"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations de la séance. Le système vérifiera automatiquement les conflits de planning pour le coach.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Activité *</Label>
                    <Select
                      value={nouvelleSeance.activite}
                      onValueChange={(v) => {
                        setNouvelleSeance((prev) => ({ ...prev, activite: v as SportId }));
                        setConflitDetecte(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(coursData).map((cours) => (
                          <SelectItem key={cours.id} value={cours.id}>
                            {cours.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Coach *</Label>
                    <Select
                      value={nouvelleSeance.coach}
                      onValueChange={(v) => {
                        setNouvelleSeance((prev) => ({ ...prev, coach: v }));
                        setConflitDetecte(null);
                        // Vérifier le conflit après un court délai
                        setTimeout(() => {
                          if (nouvelleSeance.date && nouvelleSeance.heureDebut && nouvelleSeance.heureFin) {
                            verifierConflit();
                          }
                        }, 100);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un coach" />
                      </SelectTrigger>
                      <SelectContent>
                        {coachs.map((coach) => {
                          const nomComplet = getNomCompletCoach(coach);
                          return (
                            <SelectItem key={coach.id} value={nomComplet}>
                              {nomComplet}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Salle *</Label>
                    <Select
                      value={nouvelleSeance.salle}
                      onValueChange={(v) => {
                        setNouvelleSeance((prev) => ({ ...prev, salle: v }));
                        setConflitDetecte(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une salle" />
                      </SelectTrigger>
                      <SelectContent>
                        {sallesDisponibles.map((salle) => (
                          <SelectItem key={salle} value={salle}>
                            {salle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={nouvelleSeance.date}
                      onChange={(e) => {
                        setNouvelleSeance((prev) => ({ ...prev, date: e.target.value }));
                        setConflitDetecte(null);
                        setTimeout(() => {
                          if (nouvelleSeance.coach && nouvelleSeance.heureDebut && nouvelleSeance.heureFin) {
                            verifierConflit();
                          }
                        }, 100);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Heure de début *</Label>
                    <Input
                      type="time"
                      value={nouvelleSeance.heureDebut}
                      onChange={(e) => {
                        setNouvelleSeance((prev) => ({ ...prev, heureDebut: e.target.value }));
                        setConflitDetecte(null);
                        setTimeout(() => {
                          if (nouvelleSeance.coach && nouvelleSeance.date && nouvelleSeance.heureFin) {
                            verifierConflit();
                          }
                        }, 100);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Heure de fin *</Label>
                    <Input
                      type="time"
                      value={nouvelleSeance.heureFin}
                      onChange={(e) => {
                        setNouvelleSeance((prev) => ({ ...prev, heureFin: e.target.value }));
                        setConflitDetecte(null);
                        setTimeout(() => {
                          if (nouvelleSeance.coach && nouvelleSeance.date && nouvelleSeance.heureDebut) {
                            verifierConflit();
                          }
                        }, 100);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Capacité maximale</Label>
                    <Input
                      type="number"
                      min="1"
                      value={nouvelleSeance.capaciteMax ?? 20}
                      onChange={(e) => {
                        setNouvelleSeance((prev) => ({
                          ...prev,
                          capaciteMax: parseInt(e.target.value) || 20,
                        }));
                      }}
                    />
                  </div>

                  {seanceEnEdition && (
                    <div className="space-y-2">
                      <Label>Nombre d'inscrits</Label>
                      <Input
                        type="number"
                        min="0"
                        value={nouvelleSeance.inscrits ?? 0}
                        onChange={(e) => {
                          setNouvelleSeance((prev) => ({
                            ...prev,
                            inscrits: parseInt(e.target.value) || 0,
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>

                {conflitDetecte && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-semibold text-destructive mb-1">Conflit de planning détecté</p>
                        <p className="text-sm text-muted-foreground">{conflitDetecte.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Veuillez modifier l'horaire, le coach ou la date pour résoudre le conflit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={fermerDialogSeance}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSauvegarderSeance}
                  disabled={!!conflitDetecte}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {seanceEnEdition ? "Modifier" : "Créer"} la séance
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog Création/Modification de coach */}
          <Dialog open={coachDialogOpen} onOpenChange={(open) => !open && fermerDialogCoach()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {coachEnEdition ? "Modifier le coach" : "Nouveau coach"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations du coach. Tous les champs marqués d'un astérisque (*) sont obligatoires.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coach-nom">
                      Nom * <span className="text-muted-foreground text-xs">(obligatoire)</span>
                    </Label>
                    <Input
                      id="coach-nom"
                      placeholder="Dupont"
                      value={nouveauCoach.nom}
                      onChange={(e) => setNouveauCoach((prev) => ({ ...prev, nom: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coach-prenom">
                      Prénom * <span className="text-muted-foreground text-xs">(obligatoire)</span>
                    </Label>
                    <Input
                      id="coach-prenom"
                      placeholder="Jean"
                      value={nouveauCoach.prenom}
                      onChange={(e) => setNouveauCoach((prev) => ({ ...prev, prenom: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coach-email">
                    Email * <span className="text-muted-foreground text-xs">(obligatoire)</span>
                  </Label>
                  <Input
                    id="coach-email"
                    type="email"
                    placeholder="jean.dupont@fitzone.com"
                    value={nouveauCoach.email}
                    onChange={(e) => setNouveauCoach((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coach-mdp">
                      Mot de passe {coachEnEdition ? "(laisser vide pour ne pas modifier)" : "*"}
                    </Label>
                    <Input
                      id="coach-mdp"
                      type="password"
                      placeholder={coachEnEdition ? "Laisser vide" : "Mot de passe"}
                      value={nouveauCoach.mdp}
                      onChange={(e) => setNouveauCoach((prev) => ({ ...prev, mdp: e.target.value }))}
                      required={!coachEnEdition}
                    />
                    {!coachEnEdition && (
                      <p className="text-xs text-muted-foreground">
                        Le mot de passe sera utilisé pour la connexion du coach.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coach-tel">Téléphone</Label>
                    <Input
                      id="coach-tel"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={nouveauCoach.tel}
                      onChange={(e) => setNouveauCoach((prev) => ({ ...prev, tel: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coach-specialites">Spécialités * (1 à 2 maximum)</Label>
                  <div className="space-y-2">
                    {domainesSpecialite.map((domaine) => {
                      const isSelected = nouveauCoach.specialites.includes(domaine);
                      const canSelect = nouveauCoach.specialites.length < 2 || isSelected;
                      
                      return (
                        <div key={domaine} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`specialite-${domaine}`}
                            checked={isSelected}
                            disabled={!canSelect && !isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (nouveauCoach.specialites.length < 2) {
                                  setNouveauCoach((prev) => ({
                                    ...prev,
                                    specialites: [...prev.specialites, domaine],
                                  }));
                                }
                              } else {
                                setNouveauCoach((prev) => ({
                                  ...prev,
                                  specialites: prev.specialites.filter((s) => s !== domaine),
                                }));
                              }
                            }}
                            className="w-4 h-4 rounded border-border"
                          />
                          <Label
                            htmlFor={`specialite-${domaine}`}
                            className={`text-sm cursor-pointer ${!canSelect && !isSelected ? "text-muted-foreground opacity-50" : ""}`}
                          >
                            {domaine}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez 1 à 2 spécialités maximum. Un coach ne peut pas entraîner tous les domaines.
                  </p>
                  {nouveauCoach.specialites.length > 0 && (
                    <div className="mt-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-xs font-semibold text-primary mb-1">Spécialités sélectionnées:</p>
                      <div className="flex flex-wrap gap-2">
                        {nouveauCoach.specialites.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={fermerDialogCoach}>
                  Annuler
                </Button>
                <Button onClick={handleSauvegarderCoach} className="bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  {coachEnEdition ? "Modifier" : "Créer"} le coach
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          {/* Dialog: Répondre au signalement */}
          <Dialog
            open={reportEnCours !== null}
            onOpenChange={(open) => !open && setReportEnCours(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Répondre au signalement</DialogTitle>
                <DialogDescription>
                  Répondez au signalement et mettez à jour son statut.
                </DialogDescription>
              </DialogHeader>
              {reportEnCours && (() => {
                const report = reports.find((r) => r.id === reportEnCours);
                if (!report) return null;
                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="font-semibold mb-2">{report.titre}</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reponse">Votre réponse</Label>
                      <Textarea
                        id="reponse"
                        placeholder="Tapez votre réponse ici..."
                        value={reponseReport}
                        onChange={(e) => setReponseReport(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="statut">Statut</Label>
                      <Select value={statutReport} onValueChange={(value) => setStatutReport(value as StatutReport)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statutReportConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setReportEnCours(null)}>
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    if (!reportEnCours) return;
                    modifierReport(reportEnCours, {
                      reponseAdmin: reponseReport,
                      dateReponse: new Date().toISOString().split("T")[0],
                      statut: statutReport,
                    });
                    toast({
                      title: "Réponse envoyée",
                      description: "Votre réponse a été enregistrée et le statut mis à jour.",
                    });
                    setReportEnCours(null);
                    setReponseReport("");
                    setStatutReport("en_attente");
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Envoyer la réponse
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
