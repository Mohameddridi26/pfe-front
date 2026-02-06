import { createContext, useContext, useState, ReactNode } from "react";
import type { Reservation } from "@/lib/reservations";
import { reservationsMock } from "@/lib/reservations";

interface ReservationsContextType {
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  ajouterReservation: (reservation: Reservation) => void;
  annulerReservation: (reservationId: string) => void;
  getReservationsMembre: (membreId: string) => Reservation[];
  getReservationsSeance: (seanceId: string) => Reservation[];
  membreEstInscrit: (membreId: string, seanceId: string) => boolean;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<Reservation[]>(reservationsMock);

  const ajouterReservation = (reservation: Reservation) => {
    setReservations((prev) => [...prev, reservation]);
  };

  const annulerReservation = (reservationId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
  };

  const getReservationsMembre = (membreId: string) => {
    return reservations.filter((r) => r.membreId === membreId);
  };

  const getReservationsSeance = (seanceId: string) => {
    return reservations.filter((r) => r.seanceId === seanceId);
  };

  const membreEstInscrit = (membreId: string, seanceId: string) => {
    return reservations.some((r) => r.membreId === membreId && r.seanceId === seanceId);
  };

  return (
    <ReservationsContext.Provider
      value={{
        reservations,
        setReservations,
        ajouterReservation,
        annulerReservation,
        getReservationsMembre,
        getReservationsSeance,
        membreEstInscrit,
      }}
    >
      {children}
    </ReservationsContext.Provider>
  );
};

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (context === undefined) {
    throw new Error("useReservations must be used within a ReservationsProvider");
  }
  return context;
};
