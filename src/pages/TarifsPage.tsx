import { useState } from "react";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useTarifs } from "@/contexts/TarifsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Check, X, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlanTarif } from "@/lib/tarifs";

const TarifsPage = () => {
  const { isAdmin } = useAuth();
  const { plans, ajouterPlan, modifierPlan, supprimerPlan } = useTarifs();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planEnEdition, setPlanEnEdition] = useState<PlanTarif | null>(null);
  const [nouveauPlan, setNouveauPlan] = useState<Partial<PlanTarif>>({
    name: "",
    price: "",
    period: "",
    description: "",
    features: [],
    popular: false,
    actif: true,
  });
  const [nouvelleFeature, setNouvelleFeature] = useState("");

  const ouvrirDialog = (plan?: PlanTarif) => {
    if (plan) {
      setPlanEnEdition(plan);
      setNouveauPlan({
        name: plan.name,
        price: plan.price,
        period: plan.period,
        description: plan.description,
        features: [...plan.features],
        popular: plan.popular,
        actif: plan.actif,
      });
    } else {
      setPlanEnEdition(null);
      setNouveauPlan({
        name: "",
        price: "",
        period: "",
        description: "",
        features: [],
        popular: false,
        actif: true,
      });
    }
    setNouvelleFeature("");
    setDialogOpen(true);
  };

  const fermerDialog = () => {
    setDialogOpen(false);
    setPlanEnEdition(null);
    setNouvelleFeature("");
  };

  const ajouterFeature = () => {
    if (nouvelleFeature.trim()) {
      setNouveauPlan((prev) => ({
        ...prev,
        features: [...(prev.features || []), nouvelleFeature.trim()],
      }));
      setNouvelleFeature("");
    }
  };

  const supprimerFeature = (index: number) => {
    setNouveauPlan((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }));
  };

  const sauvegarderPlan = () => {
    if (!nouveauPlan.name || !nouveauPlan.price || !nouveauPlan.period) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    if (planEnEdition) {
      modifierPlan(planEnEdition.id, nouveauPlan);
      toast({
        title: "Plan modifié",
        description: `Le plan ${nouveauPlan.name} a été modifié avec succès.`,
      });
    } else {
      const id = nouveauPlan.name.toLowerCase().replace(/\s+/g, "-");
      ajouterPlan({
        id,
        name: nouveauPlan.name,
        price: nouveauPlan.price,
        period: nouveauPlan.period,
        description: nouveauPlan.description || "",
        features: nouveauPlan.features || [],
        popular: nouveauPlan.popular || false,
        actif: nouveauPlan.actif ?? true,
      });
      toast({
        title: "Plan ajouté",
        description: `Le plan ${nouveauPlan.name} a été ajouté avec succès.`,
      });
    }
    fermerDialog();
  };

  const handleSupprimer = (plan: PlanTarif) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le plan "${plan.name}" ?`)) {
      supprimerPlan(plan.id);
      toast({
        title: "Plan supprimé",
        description: `Le plan ${plan.name} a été supprimé.`,
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20">
          <Pricing />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                Gestion des <span className="text-gradient-gold">Tarifs</span>
              </h1>
              <p className="text-muted-foreground">
                Modifiez, ajoutez ou supprimez les plans d'abonnement disponibles.
              </p>
            </div>
            <Button onClick={() => ouvrirDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un plan
            </Button>
          </div>

          <div className="glass-card p-6">
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Fonctionnalités</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Aucun plan configuré. Cliquez sur "Ajouter un plan" pour commencer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.id} className="border-border">
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-2">
                            {plan.name}
                            {plan.popular && <Star className="w-4 h-4 text-primary fill-primary" />}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{plan.price} DT</TableCell>
                        <TableCell>{plan.period}</TableCell>
                        <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{plan.features.length} fonctionnalités</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              plan.actif
                                ? "bg-green-500/20 text-green-500 border-green-500/30"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {plan.actif ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => ouvrirDialog(plan)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleSupprimer(plan)}
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
          </div>

          {/* Aperçu public */}
          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold mb-4">Aperçu public</h2>
            <div className="glass-card p-6">
              <Pricing />
            </div>
          </div>
        </div>
      </main>

      {/* Dialog Ajout/Modification */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{planEnEdition ? "Modifier le plan" : "Nouveau plan"}</DialogTitle>
            <DialogDescription>
              Remplissez les informations du plan d'abonnement. Les plans inactifs ne seront pas affichés publiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du plan *</Label>
                <Input
                  value={nouveauPlan.name || ""}
                  onChange={(e) => setNouveauPlan((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Mensuel"
                />
              </div>
              <div className="space-y-2">
                <Label>Prix (DT) *</Label>
                <Input
                  value={nouveauPlan.price || ""}
                  onChange={(e) => setNouveauPlan((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="160"
                />
              </div>
              <div className="space-y-2">
                <Label>Période *</Label>
                <Input
                  value={nouveauPlan.period || ""}
                  onChange={(e) => setNouveauPlan((prev) => ({ ...prev, period: e.target.value }))}
                  placeholder="/mois"
                />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nouveauPlan.actif ?? true}
                      onChange={(e) => setNouveauPlan((prev) => ({ ...prev, actif: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Actif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nouveauPlan.popular || false}
                      onChange={(e) => setNouveauPlan((prev) => ({ ...prev, popular: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Populaire</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={nouveauPlan.description || ""}
                onChange={(e) => setNouveauPlan((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Accès flexible sans engagement"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Fonctionnalités</Label>
              <div className="flex gap-2">
                <Input
                  value={nouvelleFeature}
                  onChange={(e) => setNouvelleFeature(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), ajouterFeature())}
                  placeholder="Ajouter une fonctionnalité"
                />
                <Button type="button" onClick={ajouterFeature} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {nouveauPlan.features?.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                    <span className="text-sm">{feature}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => supprimerFeature(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={fermerDialog}>
              Annuler
            </Button>
            <Button onClick={sauvegarderPlan} className="bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" />
              {planEnEdition ? "Modifier" : "Créer"} le plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default TarifsPage;

