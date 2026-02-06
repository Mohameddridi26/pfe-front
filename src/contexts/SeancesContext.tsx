import { createContext, useContext, useState, ReactNode } from "react";
import type { Seance } from "@/lib/seances";
import { seancesMock } from "@/lib/seances";

interface SeancesContextType {
  seances: Seance[];
  setSeances: React.Dispatch<React.SetStateAction<Seance[]>>;
  ajouterSeance: (seance: Seance) => void;
  modifierSeance: (id: string, seance: Partial<Seance>) => void;
  supprimerSeance: (id: string) => void;
}

const SeancesContext = createContext<SeancesContextType | undefined>(undefined);

export const SeancesProvider = ({ children }: { children: ReactNode }) => {
  const [seances, setSeances] = useState<Seance[]>(seancesMock);

  const ajouterSeance = (seance: Seance) => {
    setSeances((prev) => [...prev, seance]);
  };

  const modifierSeance = (id: string, seance: Partial<Seance>) => {
    setSeances((prev) => prev.map((s) => (s.id === id ? { ...s, ...seance } : s)));
  };

  const supprimerSeance = (id: string) => {
    setSeances((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SeancesContext.Provider value={{ seances, setSeances, ajouterSeance, modifierSeance, supprimerSeance }}>
      {children}
    </SeancesContext.Provider>
  );
};

export const useSeances = () => {
  const context = useContext(SeancesContext);
  if (context === undefined) {
    throw new Error("useSeances must be used within a SeancesProvider");
  }
  return context;
};
