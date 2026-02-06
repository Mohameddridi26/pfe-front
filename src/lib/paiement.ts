import { z } from "zod";

/** Méthodes de paiement disponibles pour une inscription validée */
export type MethodePaiement = "carte_bancaire" | "virement" | "especes" | "cheque";

/** Contraintes et schémas de validation par méthode */

// Carte bancaire : 13 à 19 chiffres (norme ISO), date MM/YY, CVV 3 ou 4 chiffres
export const schemaCarteBancaire = z.object({
  numeroCarte: z
    .string()
    .min(13, "Le numéro doit contenir au moins 13 chiffres")
    .max(19, "Le numéro ne peut pas dépasser 19 chiffres")
    .regex(/^\d+$/, "Le numéro ne doit contenir que des chiffres"),
  dateExpiration: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Format attendu : MM/AA (ex. 12/28)"),
  cvv: z
    .string()
    .min(3, "Le CVV doit contenir 3 ou 4 chiffres")
    .max(4, "Le CVV doit contenir 3 ou 4 chiffres")
    .regex(/^\d+$/, "Le CVV ne doit contenir que des chiffres"),
  titulaire: z.string().min(2, "Nom du titulaire requis"),
});

// Virement : IBAN (FR 23 caractères ou format international), BIC 8 ou 11 caractères
export const schemaVirement = z.object({
  iban: z
    .string()
    .transform((s) => s.replace(/\s/g, "").toUpperCase())
    .pipe(
      z
        .string()
        .min(15, "IBAN invalide (min. 15 caractères)")
        .max(34, "IBAN invalide (max. 34 caractères)")
        .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, "Format IBAN invalide (ex. FR76 12345678901234567890123)")
    ),
  bic: z
    .string()
    .transform((s) => s.replace(/\s/g, "").toUpperCase())
    .pipe(
      z
        .string()
        .min(8, "BIC invalide (8 ou 11 caractères)")
        .max(11, "BIC invalide (8 ou 11 caractères)")
        .regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/, "Format BIC invalide (ex. BNPAFRPP)")
    ),
  nomBanque: z.string().min(2, "Nom de la banque requis").optional(),
});

// Espèces : pas de champs obligatoires, optionnellement une note
export const schemaEspeces = z.object({
  montant: z.string().optional(),
  note: z.string().max(500, "Note trop longue").optional(),
});

// Chèque : numéro optionnel, banque et date d'échéance
export const schemaCheque = z.object({
  numeroCheque: z.string().optional(),
  banque: z.string().min(2, "Nom de la banque requis"),
  dateEcheance: z
    .string()
    .min(1, "Date d'échéance requise")
    .refine((d) => !isNaN(Date.parse(d)), "Date invalide"),
  montant: z.string().optional(),
});

export type DetailsCarteBancaire = z.infer<typeof schemaCarteBancaire>;
export type DetailsVirement = z.infer<typeof schemaVirement>;
export type DetailsEspeces = z.infer<typeof schemaEspeces>;
export type DetailsCheque = z.infer<typeof schemaCheque>;

export type DetailsPaiement =
  | { methode: "carte_bancaire"; details: DetailsCarteBancaire }
  | { methode: "virement"; details: DetailsVirement }
  | { methode: "especes"; details: DetailsEspeces }
  | { methode: "cheque"; details: DetailsCheque };

/** Validation selon la méthode choisie */
export function validerDetailsPaiement(
  methode: MethodePaiement,
  details: unknown
): { success: true; data: DetailsPaiement } | { success: false; error: string } {
  try {
    switch (methode) {
      case "carte_bancaire": {
        const data = schemaCarteBancaire.parse(details);
        return { success: true, data: { methode: "carte_bancaire", details: data } };
      }
      case "virement": {
        const data = schemaVirement.parse(details);
        return { success: true, data: { methode: "virement", details: data } };
      }
      case "especes": {
        const data = schemaEspeces.parse(details);
        return { success: true, data: { methode: "especes", details: data } };
      }
      case "cheque": {
        const data = schemaCheque.parse(details);
        return { success: true, data: { methode: "cheque", details: data } };
      }
      default:
        return { success: false, error: "Méthode de paiement inconnue" };
    }
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.errors.map((x) => x.message).join(", ") : "Données invalides";
    return { success: false, error: msg };
  }
}

/** Libellés et contraintes affichées pour l'UI */
export const methodesPaiementConfig: Record<
  MethodePaiement,
  { label: string; description: string; contraintes: string[] }
> = {
  carte_bancaire: {
    label: "Carte bancaire",
    description: "Paiement par carte (CB, Visa, Mastercard)",
    contraintes: [
      "Numéro : 13 à 19 chiffres (sans espaces)",
      "Date d'expiration : MM/AA (ex. 12/28)",
      "CVV : 3 ou 4 chiffres au dos de la carte",
      "Nom du titulaire obligatoire",
    ],
  },
  virement: {
    label: "Virement bancaire",
    description: "Virement SEPA (IBAN / BIC)",
    contraintes: [
      "IBAN : 15 à 34 caractères (ex. FR76 1234 5678 9012 3456 7890 123)",
      "BIC : 8 ou 11 caractères (ex. BNPAFRPP)",
      "Nom de la banque optionnel",
    ],
  },
  especes: {
    label: "Espèces",
    description: "Paiement en liquide à l'accueil",
    contraintes: ["Aucun champ obligatoire. Montant et note optionnels."],
  },
  cheque: {
    label: "Chèque",
    description: "Paiement par chèque bancaire",
    contraintes: [
      "Numéro du chèque optionnel",
      "Nom de la banque obligatoire",
      "Date d'échéance obligatoire (JJ/MM/AAAA)",
    ],
  },
};
