import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CreditCard, Banknote, Building2, Landmark, ArrowLeft, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";
import { useInscriptions } from "@/contexts/InscriptionsContext";
import { useToast } from "@/hooks/use-toast";
import {
  type MethodePaiement,
  validerDetailsPaiement,
  methodesPaiementConfig,
} from "@/lib/paiement";
import type { TypeAbonnement } from "@/lib/abonnements";

const plans: Record<TypeAbonnement, { prix: number; period: string }> = {
  Mensuel: { prix: 160, period: "/mois" },
  Trimestriel: { prix: 420, period: "/3 mois" },
  Annuel: { prix: 1460, period: "/an" },
};

type DetailsPaiementForm = Record<string, string>;

const initialDetails: DetailsPaiementForm = {};

const PaiementAbonnementPage = () => {
  const { user } = useAuth();
  const { ajouterInscription } = useInscriptions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeAbonnement = (searchParams.get("type") as TypeAbonnement) || "Mensuel";
  const [methodePaiement, setMethodePaiement] = useState<MethodePaiement | "">("");
  const [detailsPaiement, setDetailsPaiement] = useState<DetailsPaiementForm>(initialDetails);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const plan = plans[typeAbonnement];

  const setDetail = (key: string, value: string) => {
    setDetailsPaiement((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const handleConfirmerPaiement = () => {
    if (!methodePaiement) {
      setValidationError("Veuillez sélectionner une méthode de paiement.");
      return;
    }
    const result = validerDetailsPaiement(methodePaiement, detailsPaiement);
    if (!result.success) {
      setValidationError(result.error);
      return;
    }

    // Créer une inscription avec demande d'abonnement (pour renouvellement/changement)
    // Les documents sont déjà validés car le membre est déjà inscrit
    const nouvelleInscription = {
      id: `ins${Date.now()}`,
      nom: user?.nom || "",
      prenom: user?.prenom || "",
      email: user?.email || "",
      telephone: "", // À récupérer depuis le profil si disponible
      cin: "", // Déjà enregistré
      dateSoumission: new Date().toISOString().split("T")[0],
      statut: "en_attente_validation" as const,
      certificatMedical: true, // Déjà validé lors de l'inscription initiale
      assurance: true, // Déjà validé
      photo: true, // Déjà validé
      typeAbonnementDemande: typeAbonnement, // Type d'abonnement demandé
      methodePaiement: result.data.methode,
      detailsPaiement: result.data,
    };

    // Ajouter l'inscription via le contexte (apparaîtra dans Validations)
    ajouterInscription(nouvelleInscription);
    console.log("Demande d'abonnement créée:", nouvelleInscription);

    toast({
      title: "Demande envoyée",
      description: `Votre demande de ${typeAbonnement} a été envoyée à l'administrateur. Vous recevrez une notification une fois la demande traitée.`,
    });

    setConfirmationDialogOpen(true);
  };

  const handleFermerConfirmation = () => {
    setConfirmationDialogOpen(false);
    navigate("/espace-membre");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
            <Button asChild className="mt-4">
              <Link to="/login">Se connecter</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/tarifs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux tarifs
            </Link>
          </Button>

          <div className="glass-card p-6 md:p-10">
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Paiement de votre abonnement
              </h1>
              <p className="text-muted-foreground">
                Vos informations sont déjà enregistrées. Choisissez simplement votre méthode de paiement.
              </p>
            </div>

            {/* Récapitulatif */}
            <div className="bg-secondary/50 rounded-lg p-6 mb-8">
              <h2 className="font-display text-xl font-bold mb-4">Récapitulatif</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membre</span>
                  <span className="font-semibold">{user.prenom} {user.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type d'abonnement</span>
                  <span className="font-semibold">{typeAbonnement}</span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-border">
                  <span className="font-semibold">Montant total</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    {plan.prix.toLocaleString("fr-TN")} DT
                  </span>
                </div>
              </div>
            </div>

            {/* Méthode de paiement */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Méthode de paiement</h2>
              <div className="space-y-2">
                <Label>Méthode de paiement *</Label>
                <Select
                  value={methodePaiement}
                  onValueChange={(v) => {
                    setMethodePaiement(v as MethodePaiement);
                    setDetailsPaiement(initialDetails);
                    setValidationError(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carte_bancaire">
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Carte bancaire
                      </span>
                    </SelectItem>
                    <SelectItem value="virement">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Virement bancaire
                      </span>
                    </SelectItem>
                    <SelectItem value="especes">
                      <span className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" /> Espèces
                      </span>
                    </SelectItem>
                    <SelectItem value="cheque">
                      <span className="flex items-center gap-2">
                        <Landmark className="w-4 h-4" /> Chèque
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {methodePaiement && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Contraintes : {methodesPaiementConfig[methodePaiement].description}
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                    {methodesPaiementConfig[methodePaiement].contraintes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>

                  {/* Champs selon la méthode - même code que dans AdminPage */}
                  {methodePaiement === "carte_bancaire" && (
                    <div className="grid gap-3 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Numéro de carte (13–19 chiffres)</Label>
                        <Input
                          placeholder="1234567890123456"
                          value={detailsPaiement.numeroCarte ?? ""}
                          onChange={(e) => setDetail("numeroCarte", e.target.value)}
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Expiration (MM/AA)</Label>
                          <Input
                            placeholder="12/28"
                            value={detailsPaiement.dateExpiration ?? ""}
                            onChange={(e) => setDetail("dateExpiration", e.target.value)}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">CVV (3 ou 4 chiffres)</Label>
                          <Input
                            placeholder="123"
                            type="password"
                            value={detailsPaiement.cvv ?? ""}
                            onChange={(e) => setDetail("cvv", e.target.value)}
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Titulaire de la carte</Label>
                        <Input
                          placeholder={`${user.prenom} ${user.nom}`}
                          value={detailsPaiement.titulaire ?? ""}
                          onChange={(e) => setDetail("titulaire", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {methodePaiement === "virement" && (
                    <div className="grid gap-3 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">IBAN (15–34 caractères)</Label>
                        <Input
                          placeholder="FR76 1234 5678 9012 3456 7890 123"
                          value={detailsPaiement.iban ?? ""}
                          onChange={(e) => setDetail("iban", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">BIC (8 ou 11 caractères)</Label>
                        <Input
                          placeholder="BNPAFRPP"
                          value={detailsPaiement.bic ?? ""}
                          onChange={(e) => setDetail("bic", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nom de la banque (optionnel)</Label>
                        <Input
                          placeholder="BNP Paribas"
                          value={detailsPaiement.nomBanque ?? ""}
                          onChange={(e) => setDetail("nomBanque", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {methodePaiement === "especes" && (
                    <div className="grid gap-3 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Note (optionnel)</Label>
                        <Input
                          placeholder="Paiement à l'accueil"
                          value={detailsPaiement.note ?? ""}
                          onChange={(e) => setDetail("note", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {methodePaiement === "cheque" && (
                    <div className="grid gap-3 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Numéro du chèque (optionnel)</Label>
                        <Input
                          placeholder="123456"
                          value={detailsPaiement.numeroCheque ?? ""}
                          onChange={(e) => setDetail("numeroCheque", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nom de la banque *</Label>
                        <Input
                          placeholder="Banque Populaire"
                          value={detailsPaiement.banque ?? ""}
                          onChange={(e) => setDetail("banque", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Date d'échéance * (JJ/MM/AAAA)</Label>
                        <Input
                          type="date"
                          value={detailsPaiement.dateEcheance ?? ""}
                          onChange={(e) => setDetail("dateEcheance", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {validationError && (
                <p className="text-sm text-destructive font-medium">{validationError}</p>
              )}

              <div className="flex gap-4 pt-4">
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/tarifs">Annuler</Link>
                </Button>
                <Button
                  onClick={handleConfirmerPaiement}
                  className="btn-primary-glow flex-1"
                  disabled={!methodePaiement || !!validationError}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmer et envoyer la demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog de confirmation */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Demande envoyée avec succès
            </DialogTitle>
            <DialogDescription>
              Votre demande d'abonnement {typeAbonnement} a été envoyée à l'administrateur.
              Vous recevrez une notification une fois la demande traitée (acceptée ou refusée).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleFermerConfirmation} className="w-full">
              Retour à mon espace membre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PaiementAbonnementPage;
