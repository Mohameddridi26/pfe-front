import { createContext, useContext, useState, ReactNode } from "react";
import type { PlanTarif } from "@/lib/tarifs";
import { plansTarifsMock } from "@/lib/tarifs";

interface TarifsContextType {
  plans: PlanTarif[];
  setPlans: React.Dispatch<React.SetStateAction<PlanTarif[]>>;
  ajouterPlan: (plan: PlanTarif) => void;
  modifierPlan: (id: string, plan: Partial<PlanTarif>) => void;
  supprimerPlan: (id: string) => void;
}

const TarifsContext = createContext<TarifsContextType | undefined>(undefined);

export const TarifsProvider = ({ children }: { children: ReactNode }) => {
  const [plans, setPlans] = useState<PlanTarif[]>(plansTarifsMock);

  const ajouterPlan = (plan: PlanTarif) => {
    setPlans((prev) => [...prev, plan]);
  };

  const modifierPlan = (id: string, plan: Partial<PlanTarif>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...plan } : p)));
  };

  const supprimerPlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <TarifsContext.Provider value={{ plans, setPlans, ajouterPlan, modifierPlan, supprimerPlan }}>
      {children}
    </TarifsContext.Provider>
  );
};

export const useTarifs = () => {
  const context = useContext(TarifsContext);
  if (context === undefined) {
    throw new Error("useTarifs must be used within a TarifsProvider");
  }
  return context;
};
