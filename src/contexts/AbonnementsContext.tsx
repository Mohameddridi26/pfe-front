import { createContext, useContext, useState, ReactNode } from "react";
import type { Abonnement } from "@/lib/abonnements";
import { abonnementsMock } from "@/lib/abonnements";

interface AbonnementsContextType {
  abonnements: Abonnement[];
  setAbonnements: React.Dispatch<React.SetStateAction<Abonnement[]>>;
  ajouterAbonnement: (abonnement: Abonnement) => void;
  modifierAbonnement: (id: string, abonnement: Partial<Abonnement>) => void;
  supprimerAbonnement: (id: string) => void;
  getAbonnementMembre: (membreId: string) => Abonnement | undefined;
  renouvelerAbonnement: (abonnementId: string, nouveauType: Abonnement["type"], nouveauPrix: number) => void;
}

const AbonnementsContext = createContext<AbonnementsContextType | undefined>(undefined);

export const AbonnementsProvider = ({ children }: { children: ReactNode }) => {
  const [abonnements, setAbonnements] = useState<Abonnement[]>(abonnementsMock);

  const ajouterAbonnement = (abonnement: Abonnement) => {
    setAbonnements((prev) => [...prev, abonnement]);
  };

  const modifierAbonnement = (id: string, abonnement: Partial<Abonnement>) => {
    setAbonnements((prev) => prev.map((a) => (a.id === id ? { ...a, ...abonnement } : a)));
  };

  const supprimerAbonnement = (id: string) => {
    setAbonnements((prev) => prev.filter((a) => a.id !== id));
  };

  const getAbonnementMembre = (membreId: string) => {
    return abonnements.find((a) => a.membreId === membreId && a.statut === "actif");
  };

  const renouvelerAbonnement = (abonnementId: string, nouveauType: Abonnement["type"], nouveauPrix: number) => {
    const abonnement = abonnements.find((a) => a.id === abonnementId);
    if (!abonnement) return;

    const aujourdhui = new Date().toISOString().split("T")[0];
    let nouvelleDateFin: string;
    
    if (nouveauType === "Mensuel") {
      const d = new Date(aujourdhui);
      d.setMonth(d.getMonth() + 1);
      nouvelleDateFin = d.toISOString().split("T")[0];
    } else if (nouveauType === "Trimestriel") {
      const d = new Date(aujourdhui);
      d.setMonth(d.getMonth() + 3);
      nouvelleDateFin = d.toISOString().split("T")[0];
    } else {
      const d = new Date(aujourdhui);
      d.setMonth(d.getMonth() + 12);
      nouvelleDateFin = d.toISOString().split("T")[0];
    }

    modifierAbonnement(abonnementId, {
      type: nouveauType,
      prix: nouveauPrix,
      dateDebut: aujourdhui,
      dateFin: nouvelleDateFin,
      statut: "actif",
    });
  };

  return (
    <AbonnementsContext.Provider
      value={{
        abonnements,
        setAbonnements,
        ajouterAbonnement,
        modifierAbonnement,
        supprimerAbonnement,
        getAbonnementMembre,
        renouvelerAbonnement,
      }}
    >
      {children}
    </AbonnementsContext.Provider>
  );
};

export const useAbonnements = () => {
  const context = useContext(AbonnementsContext);
  if (context === undefined) {
    throw new Error("useAbonnements must be used within an AbonnementsProvider");
  }
  return context;
};
