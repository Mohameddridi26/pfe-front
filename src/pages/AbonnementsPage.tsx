import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Users,
  AlertTriangle,
  DollarSign,
  Eye,
  Pause,
  CreditCard,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { abonnementsMock, type Abonnement, type StatutAbonnement } from "@/lib/abonnements";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutConfig: Record<StatutAbonnement, { label: string; className: string }> = {
  actif: { label: "Actif", className: "bg-green-500/20 text-green-500 border-green-500/30" },
  a_renouveler: { label: "À renouveler", className: "bg-amber-500/20 text-amber-500 border-amber-500/30" },
  expire: { label: "Expiré", className: "bg-red-500/20 text-red-500 border-red-500/30" },
  suspendu: { label: "Suspendu", className: "bg-muted text-muted-foreground border-border" },
};

const AbonnementsPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("tous");
  const [selectedAbonnement, setSelectedAbonnement] = useState<Abonnement | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [abonnements] = useState(abonnementsMock);

  const openDetails = (a: Abonnement) => {
    setSelectedAbonnement(a);
    setSheetOpen(true);
  };

  const filteredAbonnements = useMemo(() => {
    let filtered = abonnements;

    if (activeTab === "actifs") {
      filtered = filtered.filter((a) => a.statut === "actif");
    } else if (activeTab === "expires") {
      filtered = filtered.filter((a) => a.statut === "expire");
    } else if (activeTab === "a_renouveler") {
      filtered = filtered.filter((a) => a.statut === "a_renouveler");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.membreNom.toLowerCase().includes(q) ||
          a.membreEmail.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [abonnements, activeTab, search]);

  const stats = useMemo(() => {
    const actifs = abonnements.filter((a) => a.statut === "actif").length;
    const aRenouveler = abonnements.filter((a) => a.statut === "a_renouveler").length;
    const revenusActifs = abonnements
      .filter((a) => a.statut === "actif")
      .reduce((sum, a) => sum + a.prix, 0);

    return { actifs, aRenouveler, revenusActifs };
  }, [abonnements]);

  const handleRenouveler = (a: Abonnement) => {
    toast({ title: "Renouvellement", description: `Renouvellement initié pour ${a.membreNom}` });
  };

  const handleSuspendre = (a: Abonnement) => {
    toast({ title: "Suspension", description: `Abonnement de ${a.membreNom} suspendu` });
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
            <div>
              <p className="text-primary uppercase tracking-widest text-sm font-semibold">
                Gestion
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold mt-1">
                Abonnements <span className="text-gradient-gold">et Membres</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Suivez le cycle de vie des adhérents et gérez les abonnements.
              </p>
            </div>
            <Button className="btn-primary-glow shrink-0" asChild>
              <Link to="/inscription">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel abonnement
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{stats.actifs}</p>
                  <p className="text-muted-foreground text-sm">Abonnements actifs</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{stats.aRenouveler}</p>
                  <p className="text-muted-foreground text-sm">À renouveler</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{stats.revenusActifs.toLocaleString("fr-TN")} DT</p>
                  <p className="text-muted-foreground text-sm">Revenus actifs / mois</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou forfait..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-secondary">
                  <TabsTrigger value="tous">Tous</TabsTrigger>
                  <TabsTrigger value="actifs">Actifs</TabsTrigger>
                  <TabsTrigger value="a_renouveler">À renouveler</TabsTrigger>
                  <TabsTrigger value="expires">Expirés</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Membre</TableHead>
                    <TableHead>Forfait</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAbonnements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Aucun abonnement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAbonnements.map((abonnement) => (
                      <TableRow key={abonnement.id} className="border-border">
                        <TableCell>
                          <div>
                            <p className="font-semibold">{abonnement.membreNom}</p>
                            <p className="text-xs text-muted-foreground">{abonnement.membreEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{abonnement.type}</TableCell>
                        <TableCell>{formatDate(abonnement.dateDebut)}</TableCell>
                        <TableCell>{formatDate(abonnement.dateFin)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statutConfig[abonnement.statut].className}
                          >
                            {statutConfig[abonnement.statut].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{abonnement.prix.toLocaleString("fr-TN")} DT</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openDetails(abonnement)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => openDetails(abonnement)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                {abonnement.statut !== "expire" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleRenouveler(abonnement)}>
                                      <RefreshCw className="w-4 h-4 mr-2" />
                                      Renouveler
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSuspendre(abonnement)}>
                                      <Pause className="w-4 h-4 mr-2" />
                                      Suspendre
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      Paiement
                                    </DropdownMenuItem>
                                  </>
)}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Sheet Détails */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Détails de l'abonnement</SheetTitle>
                <SheetDescription>
                  Informations complètes du dossier
                </SheetDescription>
              </SheetHeader>
              {selectedAbonnement && (
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Membre</h4>
                    <p className="font-semibold text-lg">{selectedAbonnement.membreNom}</p>
                    <p className="text-sm">{selectedAbonnement.membreEmail}</p>
                    <p className="text-sm">{selectedAbonnement.membreTel}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Abonnement</h4>
                    <div className="space-y-1">
                      <p><span className="text-muted-foreground">Forfait:</span> {selectedAbonnement.type}</p>
                      <p><span className="text-muted-foreground">Prix:</span> {selectedAbonnement.prix.toLocaleString("fr-TN")} DT</p>
                      <p><span className="text-muted-foreground">Début:</span> {formatDate(selectedAbonnement.dateDebut)}</p>
                      <p><span className="text-muted-foreground">Fin:</span> {formatDate(selectedAbonnement.dateFin)}</p>
                      <p><span className="text-muted-foreground">Renouvellement auto:</span> {selectedAbonnement.renouvellementAuto ? "Oui" : "Non"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    {selectedAbonnement.statut !== "expire" && (
                      <>
                        <Button
                          size="sm"
                          className="btn-primary-glow"
                          onClick={() => handleRenouveler(selectedAbonnement)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Renouveler
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendre(selectedAbonnement)}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Suspendre
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AbonnementsPage;
