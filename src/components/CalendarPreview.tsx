import { useState, useMemo } from "react";
import {
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfMonth,
  startOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSeances } from "@/contexts/SeancesContext";
import { useReservations } from "@/contexts/ReservationsContext";
import { useAuth } from "@/contexts/AuthContext";
import { coursData } from "@/lib/cours";
import { detecterConflitReservation } from "@/lib/seances";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type ViewMode = "semaine" | "mois";

const CalendarPreview = () => {
  const { seances, modifierSeance } = useSeances();
  const { reservations, ajouterReservation, annulerReservation, membreEstInscrit } = useReservations();
  const { user, isMembre } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("semaine");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [seanceAReserver, setSeanceAReserver] = useState<string | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const weekDaysList =
    viewMode === "semaine"
      ? eachDayOfInterval({ start: weekStart, end: weekEnd })
      : [];

  const monthDaysList =
    viewMode === "mois"
      ? eachDayOfInterval({
          start: startOfWeek(monthStart, { weekStartsOn: 1 }),
          end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
        })
      : [];

  const handlePrev = () => {
    if (viewMode === "semaine") {
      setCurrentDate((d) => subWeeks(d, 1));
    } else {
      setCurrentDate((d) => subMonths(d, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "semaine") {
      setCurrentDate((d) => addWeeks(d, 1));
    } else {
      setCurrentDate((d) => addMonths(d, 1));
    }
  };

  const titleText =
    viewMode === "semaine"
      ? `Semaine du ${format(weekStart, "d MMM", { locale: fr })}`
      : format(currentDate, "MMMM yyyy", { locale: fr });

  // Filtrer les séances pour la date sélectionnée
  const seancesDuJour = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return seances
      .filter((seance) => seance.date === dateStr)
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  }, [seances, selectedDate]);

  const selectedDayName = format(selectedDate, "EEEE d MMMM", { locale: fr });
  const isSelectedDateToday = isToday(selectedDate);

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const handleReserver = (seanceId: string) => {
    if (!user || !isMembre) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté en tant que membre pour réserver une séance.",
      });
      return;
    }

    const seance = seances.find((s) => s.id === seanceId);
    if (!seance) return;

    // Vérifier si le membre est déjà inscrit
    if (membreEstInscrit(user.id, seanceId)) {
      toast({
        variant: "destructive",
        title: "Déjà réservé",
        description: "Vous avez déjà réservé cette séance.",
      });
      return;
    }

    // Vérifier la capacité maximale
    const inscritsActuels = seance.inscrits ?? 0;
    if (seance.capaciteMax && inscritsActuels >= seance.capaciteMax) {
      toast({
        variant: "destructive",
        title: "Séance complète",
        description: `Cette séance est complète (${seance.capaciteMax} places maximum).`,
      });
      return;
    }

    // Vérifier les conflits de réservation
    const conflit = detecterConflitReservation(seances, reservations, user.id, seanceId);
    if (conflit.conflit) {
      toast({
        variant: "destructive",
        title: "Conflit de réservation",
        description: conflit.message,
      });
      return;
    }

    setSeanceAReserver(seanceId);
    setConfirmationDialogOpen(true);
  };

  const handleAnnulerReservation = (seanceId: string) => {
    if (!user || !isMembre) return;

    const reservation = reservations.find((r) => r.membreId === user.id && r.seanceId === seanceId);
    if (!reservation) return;

    const seance = seances.find((s) => s.id === seanceId);
    if (seance) {
      // Décrémenter le nombre d'inscrits
      const nouveauxInscrits = Math.max(0, (seance.inscrits ?? 0) - 1);
      modifierSeance(seanceId, { inscrits: nouveauxInscrits });
    }

    annulerReservation(reservation.id);
    toast({
      title: "Réservation annulée",
      description: "Votre réservation a été annulée avec succès.",
    });
  };

  const confirmerReservation = () => {
    if (!user || !isMembre || !seanceAReserver) return;

    const seance = seances.find((s) => s.id === seanceAReserver);
    if (!seance) return;

    // Vérifier à nouveau la capacité
    const inscritsActuels = seance.inscrits ?? 0;
    if (seance.capaciteMax && inscritsActuels >= seance.capaciteMax) {
      toast({
        variant: "destructive",
        title: "Séance complète",
        description: "Cette séance est maintenant complète.",
      });
      setConfirmationDialogOpen(false);
      setSeanceAReserver(null);
      return;
    }

    // Créer la réservation
    const nouvelleReservation = {
      id: `res${Date.now()}`,
      membreId: user.id,
      seanceId: seanceAReserver,
      dateReservation: new Date().toISOString().split("T")[0],
      dateSeance: seance.date,
      heureDebut: seance.heureDebut,
      heureFin: seance.heureFin,
      activite: coursData[seance.activite].nom,
      coach: seance.coach,
      salle: seance.salle,
    };

    ajouterReservation(nouvelleReservation);

    // Incrémenter le nombre d'inscrits dans la séance
    const nouveauxInscrits = (seance.inscrits ?? 0) + 1;
    modifierSeance(seanceAReserver, { inscrits: nouveauxInscrits });

    toast({
      title: "Réservation confirmée",
      description: `Vous avez réservé la séance de ${coursData[seance.activite].nom} le ${format(new Date(seance.date), "d MMMM yyyy", { locale: fr })}.`,
    });

    setConfirmationDialogOpen(false);
    setSeanceAReserver(null);
  };

  return (
    <section id="planning" className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-4">
          <p className="text-primary uppercase tracking-widest text-sm font-semibold">
            Planning
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Calendrier des <span className="text-gradient-gold">Cours</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Consultez et réservez vos séances en temps réel. Le planning est synchronisé
            entre l'administration, les coachs et les membres.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="font-display text-xl font-bold capitalize min-w-[200px] text-center">
                {titleText}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "semaine" ? "secondary" : "ghost"}
                size="sm"
                className={viewMode === "mois" ? "text-muted-foreground" : ""}
                onClick={() => setViewMode("semaine")}
              >


                Semaine
              </Button>
              <Button
                variant={viewMode === "mois" ? "secondary" : "ghost"}
                size="sm"
                className={viewMode === "semaine" ? "text-muted-foreground" : ""}
                onClick={() => setViewMode("mois")}
              >
                Mois
              </Button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`text-center py-2 text-sm font-medium ${
                  index === 0 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {viewMode === "semaine" ? (
            <>
              <div className="grid grid-cols-7 gap-2 mb-8">
                {weekDaysList.map((day, index) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const hasSeances = seances.some((s) => s.date === format(day, "yyyy-MM-dd"));
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      className={`text-center py-3 rounded-lg cursor-pointer transition-colors relative ${
                        isSelected
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : isToday(day)
                          ? "bg-primary/20 text-primary hover:bg-primary/30"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      {format(day, "d")}
                      {hasSeances && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-7 gap-2 mb-8">
              {monthDaysList.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const hasSeances = seances.some((s) => s.date === format(day, "yyyy-MM-dd"));
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`text-center py-3 rounded-lg cursor-pointer transition-colors min-h-[44px] flex flex-col items-center justify-center relative ${
                      !isSameMonth(day, currentDate)
                        ? "text-muted-foreground/50"
                        : isSelected
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                        : isToday(day)
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                    {hasSeances && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-border pt-6">
            <h4 className="font-display text-lg font-bold mb-4 flex items-center gap-2 capitalize">
              <Calendar className="w-5 h-5 text-primary" />
              {isSelectedDateToday ? "Séances d'aujourd'hui" : `Séances du ${selectedDayName}`}
            </h4>

            {seancesDuJour.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium text-lg">
                  {isSelectedDateToday ? "Aucune séance aujourd'hui" : "Aucune séance ce jour"}
                </p>
                <p className="text-sm mt-2">Cliquez sur une autre date pour voir les séances disponibles.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {seancesDuJour.map((seance) => {
                  const estInscrit = user && isMembre && membreEstInscrit(user.id, seance.id);
                  const placesDisponibles = seance.capaciteMax ? seance.capaciteMax - (seance.inscrits ?? 0) : null;
                  const estComplet = seance.capaciteMax && (seance.inscrits ?? 0) >= seance.capaciteMax;

                  return (
                    <div
                      key={seance.id}
                      className={`calendar-slot flex items-center gap-4 p-4 rounded-lg border ${
                        estInscrit
                          ? "border-primary bg-primary/10 calendar-slot-active"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-center min-w-[50px]">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-semibold">{seance.heureDebut}</p>
                        <p className="text-xs text-muted-foreground">- {seance.heureFin}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold">{coursData[seance.activite].nom}</p>
                          {estInscrit && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Réservé
                            </Badge>
                          )}
                          {estComplet && !estInscrit && (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Complet
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {seance.coach}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {seance.salle}
                          </span>
                        </div>
                        {seance.capaciteMax && (
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                              {seance.inscrits ?? 0} / {seance.capaciteMax} places
                              {placesDisponibles !== null && placesDisponibles > 0 && (
                                <span className="text-green-500 ml-1">({placesDisponibles} disponibles)</span>
                              )}
                            </p>
                          </div>
                        )}
                        {isMembre && user && (
                          <div className="mt-3">
                            {estInscrit ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-destructive hover:text-destructive"
                                onClick={() => handleAnnulerReservation(seance.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Annuler la réservation
                              </Button>
                            ) : estComplet ? (
                              <Button size="sm" variant="outline" className="w-full" disabled>
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Séance complète
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleReserver(seance.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Réserver cette séance
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmation de réservation */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la réservation</DialogTitle>
            <DialogDescription>
              {seanceAReserver && (() => {
                const seance = seances.find((s) => s.id === seanceAReserver);
                if (!seance) return "";
                return `Voulez-vous réserver la séance de ${coursData[seance.activite].nom} le ${format(new Date(seance.date), "d MMMM yyyy", { locale: fr })} de ${seance.heureDebut} à ${seance.heureFin} ?`;
              })()}
            </DialogDescription>
          </DialogHeader>
          {seanceAReserver && (() => {
            const seance = seances.find((s) => s.id === seanceAReserver);
            if (!seance) return null;
            return (
              <div className="space-y-2 py-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Coach :</span>
                  <span className="font-medium">{seance.coach}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Salle :</span>
                  <span className="font-medium">{seance.salle}</span>
                </div>
                {seance.capaciteMax && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Places disponibles :</span>
                    <span className="font-medium text-green-500">
                      {seance.capaciteMax - (seance.inscrits ?? 0)} / {seance.capaciteMax}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmationDialogOpen(false); setSeanceAReserver(null); }}>
              Annuler
            </Button>
            <Button onClick={confirmerReservation} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmer la réservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CalendarPreview;
