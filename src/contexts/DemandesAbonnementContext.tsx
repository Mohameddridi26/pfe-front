import { createContext, useContext, useState, ReactNode } from "react";
import type { DemandeAbonnement } from "@/lib/abonnements";
import { demandesAbonnementMock } from "@/lib/abonnements";

interface DemandesAbonnementContextType {
  demandes: DemandeAbonnement[];
  setDemandes: React.Dispatch<React.SetStateAction<DemandeAbonnement[]>>;
  ajouterDemande: (demande: DemandeAbonnement) => void;
  modifierDemande: (id: string, demande: Partial<DemandeAbonnement>) => void;
}

const DemandesAbonnementContext = createContext<DemandesAbonnementContextType | undefined>(undefined);

export const DemandesAbonnementProvider = ({ children }: { children: ReactNode }) => {
  const [demandes, setDemandes] = useState<DemandeAbonnement[]>(demandesAbonnementMock);

  const ajouterDemande = (demande: DemandeAbonnement) => {
    setDemandes((prev) => [...prev, demande]);
  };

  const modifierDemande = (id: string, demande: Partial<DemandeAbonnement>) => {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, ...demande } : d)));
  };

  return (
    <DemandesAbonnementContext.Provider value={{ demandes, setDemandes, ajouterDemande, modifierDemande }}>
      {children}
    </DemandesAbonnementContext.Provider>
  );
};

export const useDemandesAbonnement = () => {
  const context = useContext(DemandesAbonnementContext);
  if (context === undefined) {
    throw new Error("useDemandesAbonnement must be used within a DemandesAbonnementProvider");
  }
  return context;
};
