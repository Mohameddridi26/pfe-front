import { createContext, useContext, useState, ReactNode } from "react";
import type { Report } from "@/lib/reports";
import { reportsMock } from "@/lib/reports";

interface ReportsContextType {
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  ajouterReport: (report: Omit<Report, "id" | "dateCreation" | "statut">) => void;
  modifierReport: (id: string, report: Partial<Report>) => void;
  supprimerReport: (id: string) => void;
  getReportsAuteur: (auteurId: string) => Report[];
  getReportsEnAttente: () => Report[];
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>(reportsMock);

  const ajouterReport = (reportData: Omit<Report, "id" | "dateCreation" | "statut">) => {
    const nouveauReport: Report = {
      ...reportData,
      id: `report-${Date.now()}`,
      dateCreation: new Date().toISOString().split("T")[0],
      statut: "en_attente",
    };
    setReports((prev) => [...prev, nouveauReport]);
  };

  const modifierReport = (id: string, report: Partial<Report>) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...report } : r))
    );
  };

  const supprimerReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const getReportsAuteur = (auteurId: string) => {
    return reports.filter((r) => r.auteurId === auteurId);
  };

  const getReportsEnAttente = () => {
    return reports.filter((r) => r.statut === "en_attente");
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        setReports,
        ajouterReport,
        modifierReport,
        supprimerReport,
        getReportsAuteur,
        getReportsEnAttente,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
};
