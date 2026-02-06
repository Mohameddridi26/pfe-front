import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { Camera, FileUp, ChevronRight, Dumbbell, CreditCard, Banknote, Building2, Landmark, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { validerDetailsPaiement, methodesPaiementConfig } from "@/lib/paiement";
import { useTarifs } from "@/contexts/TarifsContext";

const methodesPaiement = ["carte_bancaire", "virement", "especes", "cheque"] as const;

const inscriptionSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Numéro de téléphone invalide"),
  cin: z.string().min(5, "CIN invalide (min. 5 caractères)"),
  photo: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, "Photo requise"),
  certificatMedical: z.custom<FileList>(
    (val) => val instanceof FileList && val.length > 0,
    "Certificat médical requis"
  ),
  assurance: z.custom<FileList>((val) => !val || (val instanceof FileList)).optional(),
  methodePaiement: z.enum(methodesPaiement).optional(),
  // Champs paiement (optionnels dans le schéma, validés selon la méthode au submit)
  numeroCarte: z.string().optional(),
  dateExpiration: z.string().optional(),
  cvv: z.string().optional(),
  titulaire: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  nomBanque: z.string().optional(),
  montant: z.string().optional(),
  note: z.string().optional(),
  numeroCheque: z.string().optional(),
  banque: z.string().optional(),
  dateEcheance: z.string().optional(),
});

type InscriptionFormValues = z.infer<typeof inscriptionSchema>;

const InscriptionPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const forfaitSelectionne = searchParams.get("forfait");
  const { plans } = useTarifs();
  const planSelectionne = plans.find((p) => p.name === forfaitSelectionne);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const certificatInputRef = useRef<HTMLInputElement>(null);
  const assuranceInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InscriptionFormValues>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      cin: "",
      methodePaiement: undefined,
      numeroCarte: "",
      dateExpiration: "",
      cvv: "",
      titulaire: "",
      iban: "",
      bic: "",
      nomBanque: "",
      montant: "",
      note: "",
      numeroCheque: "",
      banque: "",
      dateEcheance: "",
    },
  });

  const methodePaiement = form.watch("methodePaiement");

  const onSubmit = async (data: InscriptionFormValues) => {
    if (!data.methodePaiement) {
      toast({
        variant: "destructive",
        title: "Méthode de paiement requise",
        description: "Veuillez choisir une méthode de paiement.",
      });
      return;
    }
    const paymentDetails: Record<string, string> = {};
    if (data.methodePaiement === "carte_bancaire") {
      paymentDetails.numeroCarte = data.numeroCarte ?? "";
      paymentDetails.dateExpiration = data.dateExpiration ?? "";
      paymentDetails.cvv = data.cvv ?? "";
      paymentDetails.titulaire = data.titulaire ?? "";
    } else if (data.methodePaiement === "virement") {
      paymentDetails.iban = data.iban ?? "";
      paymentDetails.bic = data.bic ?? "";
      paymentDetails.nomBanque = data.nomBanque ?? "";
    } else if (data.methodePaiement === "especes") {
      paymentDetails.montant = data.montant ?? "";
      paymentDetails.note = data.note ?? "";
    } else if (data.methodePaiement === "cheque") {
      paymentDetails.numeroCheque = data.numeroCheque ?? "";
      paymentDetails.banque = data.banque ?? "";
      paymentDetails.dateEcheance = data.dateEcheance ?? "";
      paymentDetails.montant = data.montant ?? "";
    }
    const paymentResult = validerDetailsPaiement(data.methodePaiement, paymentDetails);
    if (!paymentResult.success) {
      toast({
        variant: "destructive",
        title: "Paiement invalide",
        description: paymentResult.error,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      console.log("Données inscription:", {
        ...data,
        photo: data.photo?.[0]?.name,
        certificatMedical: data.certificatMedical?.[0]?.name,
        assurance: data.assurance?.[0]?.name,
        methodePaiement: data.methodePaiement,
        detailsPaiement: paymentResult.data,
      });
      toast({
        title: "Inscription soumise",
        description:
          "Votre dossier a été envoyé. Un administrateur validera votre inscription. Statut: En attente de validation.",
      });
      form.reset({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        cin: "",
        methodePaiement: undefined,
        numeroCarte: "",
        dateExpiration: "",
        cvv: "",
        titulaire: "",
        iban: "",
        bic: "",
        nomBanque: "",
        montant: "",
        note: "",
        numeroCheque: "",
        banque: "",
        dateEcheance: "",
      });
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (certificatInputRef.current) certificatInputRef.current.value = "";
      if (assuranceInputRef.current) assuranceInputRef.current.value = "";
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <p className="text-primary uppercase tracking-widest text-sm font-semibold">
              Pipeline d'inscription numérique
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              S'inscrire à <span className="text-gradient-gold">FITZONE</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complétez votre dossier d'inscription. Un administrateur validera votre dossier.
              Si des pièces manquent, le statut restera « En attente de pièces ».
            </p>
          </div>

          {/* Affichage du forfait sélectionné */}
          {planSelectionne && (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="glass-card p-4 border-2 border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Forfait sélectionné</p>
                      <p className="font-display text-lg font-bold">
                        {planSelectionne.name} - {planSelectionne.price} DT {planSelectionne.period}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {planSelectionne.description}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="glass-card p-6 md:p-10 max-w-2xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Données personnelles */}
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    Données personnelles
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prenom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemple.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CIN (Carte d'identité nationale)</FormLabel>
                        <FormControl>
                          <Input placeholder="AB123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Photo */}
                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Photo d'identité</FormLabel>
                        <div className="space-y-2">
                          <input
                            ref={photoInputRef}
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) onChange(files);
                            }}
                          />
                          <label
                            htmlFor="photo-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                          >
                            <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              {value?.length ? value[0].name : "Cliquez pour sélectionner une photo"}
                            </span>
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Documents */}
                <div className="space-y-4 border-t border-border pt-8">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <FileUp className="w-5 h-5 text-primary" />
                    Documents
                  </h2>

                  <FormField
                    control={form.control}
                    name="certificatMedical"
                    render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Certificat médical *</FormLabel>
                        <FormDescription>
                          Certificat d'aptitude à la pratique du sport (obligatoire)
                        </FormDescription>
                        <div className="space-y-2">
                          <input
                            ref={certificatInputRef}
                            id="certificat-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                            className="sr-only"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) onChange(files);
                            }}
                          />
                          <label
                            htmlFor="certificat-upload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                          >
                            <FileUp className="w-8 h-8 text-muted-foreground mb-1" />
                            <span className="text-sm text-muted-foreground">
                              {value?.length ? value[0].name : "Cliquez pour sélectionner (PDF, JPG ou PNG)"}
                            </span>
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assurance"
                    render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Assurance (optionnel)</FormLabel>
                        <div className="space-y-2">
                          <input
                            ref={assuranceInputRef}
                            id="assurance-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                            className="sr-only"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) onChange(files);
                            }}
                          />
                          <label
                            htmlFor="assurance-upload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                          >
                            <FileUp className="w-8 h-8 text-muted-foreground mb-1" />
                            <span className="text-sm text-muted-foreground">
                              {value?.length ? value[0].name : "Cliquez pour sélectionner (PDF, JPG ou PNG - optionnel)"}
                            </span>
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Méthode de paiement */}
                <div className="space-y-4 border-t border-border pt-8">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Méthode de paiement
                  </h2>
                  <FormDescription>
                    Choisissez comment vous souhaitez régler votre inscription. Les champs affichés dépendent de la méthode.
                  </FormDescription>

                  <FormField
                    control={form.control}
                    name="methodePaiement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Méthode de paiement *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {methodePaiement && (
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        {methodesPaiementConfig[methodePaiement].description}
                      </p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                        {methodesPaiementConfig[methodePaiement].contraintes.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>

                      {methodePaiement === "carte_bancaire" && (
                        <div className="grid gap-4 pt-2">
                          <FormField
                            control={form.control}
                            name="numeroCarte"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numéro de carte (13–19 chiffres)</FormLabel>
                                <FormControl>
                                  <Input placeholder="1234567890123456" {...field} maxLength={19} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="dateExpiration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiration (MM/AA)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="12/28" {...field} maxLength={5} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="cvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV (3 ou 4 chiffres)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123" type="password" {...field} maxLength={4} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="titulaire"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Titulaire de la carte</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jean Dupont" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {methodePaiement === "virement" && (
                        <div className="grid gap-4 pt-2">
                          <FormField
                            control={form.control}
                            name="iban"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IBAN (15–34 caractères)</FormLabel>
                                <FormControl>
                                  <Input placeholder="FR76 1234 5678 9012 3456 7890 123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>BIC (8 ou 11 caractères)</FormLabel>
                                <FormControl>
                                  <Input placeholder="BNPAFRPP" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nomBanque"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de la banque (optionnel)</FormLabel>
                                <FormControl>
                                  <Input placeholder="BNP Paribas" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {methodePaiement === "especes" && (
                        <div className="grid gap-4 pt-2">
                          <FormField
                            control={form.control}
                            name="montant"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Montant prévu (optionnel)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Montant en DH" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Note (optionnel)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Paiement à l'accueil" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {methodePaiement === "cheque" && (
                        <div className="grid gap-4 pt-2">
                          <FormField
                            control={form.control}
                            name="numeroCheque"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numéro du chèque (optionnel)</FormLabel>
                                <FormControl>
                                  <Input placeholder="123456" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="banque"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de la banque *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Banque Populaire" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="dateEcheance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date d'échéance du chèque *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="montant"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Montant (optionnel)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Montant en DH" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    className="btn-primary-glow flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        Soumettre mon dossier
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Annuler</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Vous avez déjà un compte ?{" "}
            <Link to="/dashboard" className="text-primary hover:underline">
              Accéder au Dashboard
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InscriptionPage;
