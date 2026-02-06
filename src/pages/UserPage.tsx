import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  CreditCard,
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  XCircle,
  AlertTriangle,
  Send,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useReservations } from "@/contexts/ReservationsContext";
import { useSeances } from "@/contexts/SeancesContext";
import { useReports } from "@/contexts/ReportsContext";
import { useToast } from "@/hooks/use-toast";
import { typesReportConfig, statutReportConfig, type TypeReport } from "@/lib/reports";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const mockAbonnement = {
  type: "Trimestriel",
  prix: 420,
  dateDebut: "2025-12-01",
  dateFin: "2026-02-28",
  statut: "actif" as const,
  renouvellementAuto: true,
};

const mockDocuments = [
  { nom: "Certificat médical", statut: "validé", date: "2025-11-10" },
  { nom: "Assurance", statut: "validé", date: "2025-11-12" },
  { nom: "Photo d'identité", statut: "validé", date: "2025-11-15" },
];

const UserPage = () => {
  const { user } = useAuth();
  const { getReservationsMembre, annulerReservation } = useReservations();
  const { seances, modifierSeance } = useSeances();
  const { getReportsAuteur, ajouterReport } = useReports();
  const { toast } = useToast();
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [nouveauReport, setNouveauReport] = useState({
    type: "" as TypeReport | "",
    titre: "",
    description: "",
  });

  const reservationsMembre = user ? getReservationsMembre(user.id) : [];
  const reservationsTriees = [...reservationsMembre].sort((a, b) => {
    const dateCompare = a.dateSeance.localeCompare(b.dateSeance);
    if (dateCompare !== 0) return dateCompare;
    return a.heureDebut.localeCompare(b.heureDebut);
  });

  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), "d MMMM yyyy", { locale: fr });

  const handleAnnulerReservation = (reservationId: string) => {
    const reservation = reservationsMembre.find((r) => r.id === reservationId);
    if (!reservation) return;

    const seance = seances.find((s) => s.id === reservation.seanceId);
    if (seance) {
      // Décrémenter le nombre d'inscrits
      const nouveauxInscrits = Math.max(0, (seance.inscrits ?? 0) - 1);
      modifierSeance(reservation.seanceId, { inscrits: nouveauxInscrits });
    }

    annulerReservation(reservationId);
    toast({
      title: "Réservation annulée",
      description: "Votre réservation a été annulée avec succès.",
    });
  };

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
                  Espace Membre
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  Bonjour, <span className="text-gradient-gold">{user?.prenom}</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Suivez votre cycle de vie de l'inscription au renouvellement.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="glass-card p-6">
            <Tabs defaultValue="profil" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6 bg-secondary">
                <TabsTrigger value="profil" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Mon profil
                </TabsTrigger>
                <TabsTrigger value="abonnement" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Mon abonnement
                </TabsTrigger>
                <TabsTrigger value="reservations" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Mes réservations
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mes documents
                </TabsTrigger>
                <TabsTrigger value="signalements" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Signalements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profil">
                <h2 className="font-display text-xl font-bold mb-4">Données personnelles</h2>
                <p className="text-muted-foreground mb-6">
                  Vos informations de contact et d'identité.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-secondary/30 border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Identité</CardTitle>
                      <CardDescription>Informations personnelles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><span className="text-muted-foreground">Nom:</span> {user?.nom} {user?.prenom}</p>
                      <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
                      <p><span className="text-muted-foreground">Téléphone:</span> {user?.telephone || "Non renseigné"}</p>
                      <p><span className="text-muted-foreground">CIN:</span> {user?.cin || "Non renseigné"}</p>
                      <p><span className="text-muted-foreground">Membre depuis:</span> {user ? "2024-11-15" : "N/A"}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/30 border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Cycle de vie</CardTitle>
                      <CardDescription>De l'inscription au renouvellement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {user ? (
                          <>Vous êtes membre depuis {formatDate("2024-11-15")}. Votre abonnement actuel est actif jusqu'au {formatDate(mockAbonnement.dateFin)}.</>
                        ) : (
                          "Informations non disponibles"
                        )}
                      </p>
                      <Button variant="outline" size="sm">
                        Modifier mon profil (bientôt)
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="abonnement">
                <h2 className="font-display text-xl font-bold mb-4">Mon abonnement</h2>
                <p className="text-muted-foreground mb-6">
                  Détails de votre abonnement et dates de validité.
                </p>
                <Card className="bg-secondary/30 border-border max-w-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{mockAbonnement.type}</CardTitle>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        Actif
                      </Badge>
                    </div>
                    <CardDescription>Abonnement actif</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix</span>
                      <span className="font-semibold">{mockAbonnement.prix.toLocaleString("fr-TN")} DT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Début</span>
                      <span>{formatDate(mockAbonnement.dateDebut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fin</span>
                      <span>{formatDate(mockAbonnement.dateFin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renouvellement auto</span>
                      <span>{mockAbonnement.renouvellementAuto ? "Oui" : "Non"}</span>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <Button variant="outline" size="sm">
                        Renouveler ou changer de forfait (bientôt)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reservations">
                <h2 className="font-display text-xl font-bold mb-4">Mes réservations</h2>
                <p className="text-muted-foreground mb-6">
                  Consultez et gérez vos réservations de séances. Vous pouvez annuler une réservation jusqu'à 24h avant la séance.
                </p>
                {reservationsTriees.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium text-lg">Aucune réservation</p>
                    <p className="text-sm mt-2">Vous n'avez pas encore réservé de séance.</p>
                    <Button className="mt-6" asChild>
                      <Link to="/planning">
                        Voir le planning et réserver
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {reservationsTriees.map((reservation) => {
                        const dateSeance = new Date(reservation.dateSeance);
                        const maintenant = new Date();
                        const peutAnnuler = dateSeance.getTime() - maintenant.getTime() > 24 * 60 * 60 * 1000; // 24h avant

                        return (
                          <Card key={reservation.id} className="bg-secondary/30 border-border">
                            <CardContent className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                  <Clock className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold">{reservation.activite}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(reservation.dateSeance)} de {reservation.heureDebut} à {reservation.heureFin}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {reservation.coach} • {reservation.salle}
                                  </p>
                                </div>
                                {peutAnnuler ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleAnnulerReservation(reservation.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Annuler
                                  </Button>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    Non annulable
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    <Button className="mt-6" asChild>
                      <Link to="/planning">
                        Voir le planning complet et réserver
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="documents">
                <h2 className="font-display text-xl font-bold mb-4">Mes documents</h2>
                <p className="text-muted-foreground mb-6">
                  Certificat médical, assurance et pièces d'identité.
                </p>
                <div className="space-y-4">
                  {mockDocuments.map((doc) => (
                    <Card key={doc.nom} className="bg-secondary/30 border-border">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{doc.nom}</p>
                            <p className="text-sm text-muted-foreground">
                              Validé le {formatDate(doc.date)}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          {doc.statut}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  Pour mettre à jour vos documents, contactez l'accueil.
                </p>
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
                  auteurRole: "membre",
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

export default UserPage;
