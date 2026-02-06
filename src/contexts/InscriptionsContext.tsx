import { createContext, useContext, useState, ReactNode } from "react";
import type { Inscription } from "@/lib/inscriptions";
import { inscriptionsMock } from "@/lib/inscriptions";

interface InscriptionsContextType {
  inscriptions: Inscription[];
  setInscriptions: React.Dispatch<React.SetStateAction<Inscription[]>>;
  ajouterInscription: (inscription: Inscription) => void;
  modifierInscription: (id: string, inscription: Partial<Inscription>) => void;
  supprimerInscription: (id: string) => void;
}

const InscriptionsContext = createContext<InscriptionsContextType | undefined>(undefined);

export const InscriptionsProvider = ({ children }: { children: ReactNode }) => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>(inscriptionsMock);

  const ajouterInscription = (inscription: Inscription) => {
    setInscriptions((prev) => [...prev, inscription]);
  };

  const modifierInscription = (id: string, inscription: Partial<Inscription>) => {
    setInscriptions((prev) => prev.map((i) => (i.id === id ? { ...i, ...inscription } : i)));
  };

  const supprimerInscription = (id: string) => {
    setInscriptions((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <InscriptionsContext.Provider value={{ inscriptions, setInscriptions, ajouterInscription, modifierInscription, supprimerInscription }}>
      {children}
    </InscriptionsContext.Provider>
  );
};

export const useInscriptions = () => {
  const context = useContext(InscriptionsContext);
  if (context === undefined) {
    throw new Error("useInscriptions must be used within an InscriptionsProvider");
  }
  return context;
};
