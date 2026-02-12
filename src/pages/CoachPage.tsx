import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Send,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useSeances } from "@/contexts/SeancesContext";
import { useReservations } from "@/contexts/ReservationsContext";
import { useReports } from "@/contexts/ReportsContext";
import { useToast } from "@/hooks/use-toast";
import { coursData } from "@/lib/cours";
import { typesReportConfig, statutReportConfig, type TypeReport } from "@/lib/reports";
import { Textarea } from "@/components/ui/textarea";
import {
  Disponibilite,
  joursSemaine,
} from "@/lib/coach";
import { disponibilitesMock } from "@/lib/coach";

const CoachPage = () => {
  const { user } = useAuth();
  const { seances, modifierSeance } = useSeances();
  const { reservations, getReservationsSeance } = useReservations();
  const { getReportsAuteur, ajouterReport } = useReports();
  const { toast } = useToast();
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [nouveauReport, setNouveauReport] = useState({
    type: "" as TypeReport | "",
    titre: "",
    description: "",
  });

  // État pour les disponibilités
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>(disponibilitesMock);
  const [disponibiliteDialogOpen, setDisponibiliteDialogOpen] = useState(false);
  const [disponibiliteEdit, setDisponibiliteEdit] = useState<Disponibilite | null>(null);
  const [nouvelleDisponibilite, setNouvelleDisponibilite] = useState<Omit<Disponibilite, "id">>({
    jourSemaine: 1,
    heureDebut: "08:00",
    heureFin: "12:00",
  });



  // Nom complet du coach (utilisé pour filtrer les séances)
  const nomCompletCoach = user ? `${user.prenom} ${user.nom}`.trim() : "";

  // Séances du coach (filtrées par nom du coach)
  const seancesCoach = useMemo(() => {
    if (!nomCompletCoach) return [];
    // Filtrer les séances où le coach correspond exactement
    const filtered = seances.filter((s) => s.coach.trim() === nomCompletCoach);
    return filtered;
  }, [seances, nomCompletCoach]);

  // Séances triées par date et heure
  const seancesTriees = useMemo(() => {
    return [...seancesCoach].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.heureDebut.localeCompare(b.heureDebut);
    });
  }, [seancesCoach]);

  const formatDate = (dateStr: string) => format(new Date(dateStr), "d MMMM yyyy", { locale: fr });

  // Fonction: consulterPlanning() - Affiche le planning du coach
  // Afficher toutes les séances (passées et futures) pour avoir un planning complet
  const planningProchainesSeances = useMemo(() => {
    return seancesTriees; // Afficher toutes les séances du coach
  }, [seancesTriees]);

  // Fonction: modifierDisponibilites()
  const ouvrirDialogDisponibilite = (disponibilite?: Disponibilite) => {
    if (disponibilite) {
      setDisponibiliteEdit(disponibilite);
      setNouvelleDisponibilite({
        jourSemaine: disponibilite.jourSemaine,
        heureDebut: disponibilite.heureDebut,
        heureFin: disponibilite.heureFin,
      });
    } else {
      setDisponibiliteEdit(null);
      setNouvelleDisponibilite({
        jourSemaine: 1,
        heureDebut: "08:00",
        heureFin: "12:00",
      });
    }
    setDisponibiliteDialogOpen(true);
  };

  const fermerDialogDisponibilite = () => {
    setDisponibiliteDialogOpen(false);
    setDisponibiliteEdit(null);
  };

  const sauvegarderDisponibilite = () => {
    if (nouvelleDisponibilite.heureDebut >= nouvelleDisponibilite.heureFin) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "L'heure de début doit être antérieure à l'heure de fin.",
      });
      return;
    }

    if (disponibiliteEdit) {
      // Modifier
      setDisponibilites((prev) =>
        prev.map((d) =>
          d.id === disponibiliteEdit.id
            ? { ...disponibiliteEdit, ...nouvelleDisponibilite }
            : d
        )
      );
      toast({
        title: "Disponibilité modifiée",
        description: "Votre disponibilité a été mise à jour avec succès.",
      });
    } else {
      // Ajouter
      const nouvelle: Disponibilite = {
        id: `d${Date.now()}`,
        ...nouvelleDisponibilite,
      };
      setDisponibilites((prev) => [...prev, nouvelle]);
      toast({
        title: "Disponibilité ajoutée",
        description: "Votre nouvelle disponibilité a été enregistrée.",
      });
    }
    fermerDialogDisponibilite();
  };

  const supprimerDisponibilite = (id: string) => {
    setDisponibilites((prev) => prev.filter((d) => d.id !== id));
    toast({
      title: "Disponibilité supprimée",
      description: "La disponibilité a été supprimée avec succès.",
    });
  };

  // Fonction: consulterSeances() - Affiche les séances du coach
  const seancesAvecDetails = useMemo(() => {
    return seancesTriees.map((seance) => {
      const reservationsSeance = getReservationsSeance(seance.id);
      return {
        ...seance,
        nombreInscrits: reservationsSeance.length,
        capacite: seance.capaciteMax || 0,
      };
    });
  }, [seancesTriees, getReservationsSeance]);



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center font-display text-2xl font-bold text-primary">
                {user?.prenom.charAt(0)}{user?.nom.charAt(0)}
              </div>
              <div>
                <p className="text-primary uppercase tracking-widest text-sm font-semibold">
                  Espace Coach
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  Bonjour, <span className="text-gradient-gold">{user?.prenom}</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gérez votre planning, vos disponibilités et vos séances.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="glass-card p-6">
            <Tabs defaultValue="planning" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-secondary">
                <TabsTrigger value="planning" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Planning
                </TabsTrigger>
                <TabsTrigger value="disponibilites" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Disponibilités
                </TabsTrigger>
                <TabsTrigger value="seances" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Séances
                </TabsTrigger>
                <TabsTrigger value="signalements" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Signalements
                </TabsTrigger>
              </TabsList>

              {/* Tab: Planning */}
              <TabsContent value="planning">
                <h2 className="font-display text-xl font-bold mb-4">Mon planning</h2>
                <p className="text-muted-foreground mb-6">
                  Consultez vos prochaines séances programmées.
                </p>
                {planningProchainesSeances.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium text-lg">Aucune séance programmée</p>
                    <p className="text-sm mt-2">
                      {seances.length === 0 
                        ? "Aucune séance n'a été créée pour vous. Contactez l'administrateur."
                        : `Aucune séance trouvée pour ${nomCompletCoach || "votre compte"}.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {planningProchainesSeances.map((seance) => {
                      const reservationsSeance = getReservationsSeance(seance.id);
                      const dateSeance = new Date(seance.date + "T" + seance.heureDebut);
                      const maintenant = new Date();
                      const estPasse = dateSeance < maintenant;
                      
                      return (
                        <Card key={seance.id} className={`bg-secondary/30 border-border ${estPasse ? "opacity-75" : ""}`}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">
                                    {coursData[seance.activite]?.nom || seance.activite}
                                  </p>
                                  {estPasse && (
                                    <Badge variant="secondary" className="text-xs">
                                      Passée
                                    </Badge>
                                  )}
                                  {!estPasse && (
                                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-500 border-green-500/30">
                                      À venir
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(seance.date)} de {seance.heureDebut} à {seance.heureFin}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {seance.salle} • {reservationsSeance.length} / {seance.capaciteMax || 0} inscrits
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Disponibilités */}
              <TabsContent value="disponibilites">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold">Mes disponibilités</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Définissez vos créneaux de disponibilité hebdomadaires.
                    </p>
                  </div>
                  <Button onClick={() => ouvrirDialogDisponibilite()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une disponibilité
                  </Button>
                </div>
                {disponibilites.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium text-lg">Aucune disponibilité définie</p>
                    <p className="text-sm mt-2">Ajoutez vos créneaux de disponibilité.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {disponibilites.map((disponibilite) => (
                      <Card key={disponibilite.id} className="bg-secondary/30 border-border">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{joursSemaine[disponibilite.jourSemaine]}</p>
                              <p className="text-sm text-muted-foreground">
                                {disponibilite.heureDebut} - {disponibilite.heureFin}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => ouvrirDialogDisponibilite(disponibilite)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => supprimerDisponibilite(disponibilite.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Séances */}
              <TabsContent value="seances">
                <h2 className="font-display text-xl font-bold mb-4">Mes séances</h2>
                <p className="text-muted-foreground mb-6">
                  Consultez toutes vos séances passées et à venir.
                </p>
                {seancesAvecDetails.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium text-lg">Aucune séance</p>
                    <p className="text-sm mt-2">Vous n'avez pas encore de séances assignées.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {seancesAvecDetails.map((seance) => {
                      const reservationsSeance = getReservationsSeance(seance.id);
                      const dateSeance = new Date(seance.date);
                      const maintenant = new Date();
                      const estPasse = dateSeance < maintenant;

                      return (
                        <Card key={seance.id} className="bg-secondary/30 border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold">
                                      {coursData[seance.activite]?.nom || seance.activite}
                                    </p>
                                    {estPasse && (
                                      <Badge variant="secondary" className="text-xs">
                                        Passée
                                      </Badge>
                                    )}
                                    {seance.completee && (
                                      <Badge variant="outline" className="text-xs bg-green-500/20 text-green-500 border-green-500/30">
                                        <CheckCircle className="w-3 h-3 mr-1 inline" />
                                        Complétée
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(seance.date)} de {seance.heureDebut} à {seance.heureFin}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {seance.salle}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <Users className="w-3 h-3 inline mr-1" />
                                    {reservationsSeance.length} / {seance.capacite} inscrits
                                  </p>
                                </div>
                              </div>
                              {seance.completee && (
                                <div className="flex items-center gap-2 text-green-500">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="text-sm font-medium">Séance complétée</span>
                                </div>
                              )}
                              {!seance.completee && estPasse && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">En attente de confirmation</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signalements">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold">Mes signalements</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Signalez un problème à l'administrateur.
                    </p>
                  </div>
                  <Button onClick={() => setReportDialogOpen(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Nouveau signalement
                  </Button>
                </div>
                {user && (() => {
                  const mesReports = getReportsAuteur(user.id);
                  return mesReports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium text-lg">Aucun signalement</p>
                      <p className="text-sm mt-2">Vous n'avez pas encore envoyé de signalement.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mesReports.map((report) => (
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
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Type: {typesReportConfig[report.type].label}
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
                                      Réponse de l'admin:
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
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />

      {/* Dialog: Modifier/Ajouter Disponibilité */}
      <Dialog open={disponibiliteDialogOpen} onOpenChange={setDisponibiliteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {disponibiliteEdit ? "Modifier la disponibilité" : "Ajouter une disponibilité"}
            </DialogTitle>
            <DialogDescription>
              Définissez le jour et les horaires de votre disponibilité.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jourSemaine">Jour de la semaine</Label>
              <Select
                value={nouvelleDisponibilite.jourSemaine.toString()}
                onValueChange={(value) =>
                  setNouvelleDisponibilite((prev) => ({
                    ...prev,
                    jourSemaine: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {joursSemaine.map((jour, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {jour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heureDebut">Heure de début</Label>
                <Input
                  id="heureDebut"
                  type="time"
                  value={nouvelleDisponibilite.heureDebut}
                  onChange={(e) =>
                    setNouvelleDisponibilite((prev) => ({
                      ...prev,
                      heureDebut: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heureFin">Heure de fin</Label>
                <Input
                  id="heureFin"
                  type="time"
                  value={nouvelleDisponibilite.heureFin}
                  onChange={(e) =>
                    setNouvelleDisponibilite((prev) => ({
                      ...prev,
                      heureFin: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermerDialogDisponibilite}>
              Annuler
            </Button>
            <Button onClick={sauvegarderDisponibilite}>
              {disponibiliteEdit ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Nouveau Signalement */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau signalement</DialogTitle>
            <DialogDescription>
              Décrivez le problème que vous rencontrez. L'administrateur vous répondra rapidement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de problème</Label>
              <Select
                value={nouveauReport.type}
                onValueChange={(value) =>
                  setNouveauReport((prev) => ({ ...prev, type: value as TypeReport }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typesReportConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                placeholder="Résumé du problème"
                value={nouveauReport.titre}
                onChange={(e) =>
                  setNouveauReport((prev) => ({ ...prev, titre: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le problème en détail..."
                value={nouveauReport.description}
                onChange={(e) =>
                  setNouveauReport((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!user || !nouveauReport.type || !nouveauReport.titre || !nouveauReport.description) {
                  toast({
                    variant: "destructive",
                    title: "Champs manquants",
                    description: "Veuillez remplir tous les champs.",
                  });
                  return;
                }
                ajouterReport({
                  auteurId: user.id,
                  auteurNom: `${user.prenom} ${user.nom}`,
                  auteurEmail: user.email,
                  auteurRole: "coach",
                  type: nouveauReport.type,
                  titre: nouveauReport.titre,
                  description: nouveauReport.description,
                });
                toast({
                  title: "Signalement envoyé",
                  description: "Votre signalement a été envoyé à l'administrateur.",
                });
                setNouveauReport({ type: "" as TypeReport | "", titre: "", description: "" });
                setReportDialogOpen(false);
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachPage;
