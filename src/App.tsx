import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SeancesProvider } from "@/contexts/SeancesContext";
import { DemandesAbonnementProvider } from "@/contexts/DemandesAbonnementContext";
import { TarifsProvider } from "@/contexts/TarifsContext";
import { InscriptionsProvider } from "@/contexts/InscriptionsContext";
import { AbonnementsProvider } from "@/contexts/AbonnementsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ReservationsProvider } from "@/contexts/ReservationsContext";
import { ReportsProvider } from "@/contexts/ReportsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import PlanningPage from "./pages/PlanningPage";
import TarifsPage from "./pages/TarifsPage";
import InscriptionPage from "./pages/InscriptionPage";
import AbonnementsPage from "./pages/AbonnementsPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import CoachPage from "./pages/CoachPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import CoursDescriptionPage from "./pages/CoursDescriptionPage";
import PaiementAbonnementPage from "./pages/PaiementAbonnementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SeancesProvider>
            <ReservationsProvider>
              <ReportsProvider>
                <DemandesAbonnementProvider>
                  <TarifsProvider>
                    <InscriptionsProvider>
                      <AbonnementsProvider>
                        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route
              path="/planning"
              element={
                <ProtectedRoute requireAuth>
                  <PlanningPage />
                </ProtectedRoute>
              }
            />
            <Route path="/tarifs" element={<TarifsPage />} />
            <Route
              path="/inscription"
              element={
                <ProtectedRoute blockAdmin>
                  <InscriptionPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cours/:sportId" element={<CoursDescriptionPage />} />
            <Route
              path="/abonnements"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AbonnementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/espace-membre"
              element={
                <ProtectedRoute requiredRole="membre">
                  <UserPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/espace-coach"
              element={
                <ProtectedRoute requiredRole="coach">
                  <CoachPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paiement-abonnement"
              element={
                <ProtectedRoute requiredRole="membre">
                  <PaiementAbonnementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AbonnementsProvider>
      </InscriptionsProvider>
      </TarifsProvider>
      </DemandesAbonnementProvider>
      </ReportsProvider>
      </ReservationsProvider>
      </SeancesProvider>
    </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
