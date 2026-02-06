import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dumbbell, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/contexts/AuthContext";
import { useEffect } from "react";

const LoginPage = () => {
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Déterminer le rôle avant le login pour la redirection
    const DEMO_ACCOUNTS = [
      { email: "admin@fitzone.com", password: "admin123", role: "admin" as UserRole },
      { email: "membre@fitzone.com", password: "membre123", role: "membre" as UserRole },
      { email: "coach@fitzone.com", password: "coach123", role: "coach" as UserRole },
    ];
    
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    
    const success = await login(email, password);
    setIsSubmitting(false);
    
    if (success && account) {
      toast({ title: "Connexion réussie", description: "Bienvenue !" });
      // Rediriger selon le rôle
      if (account.role === "membre") {
        navigate("/espace-membre", { replace: true });
      } else if (account.role === "admin") {
        navigate(from === "/" || from === "/login" ? "/admin" : from, { replace: true });
      } else if (account.role === "coach") {
        navigate("/espace-coach", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="glass-card p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold">
                Connexion à <span className="text-gradient-gold">FITZONE</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Accédez à votre espace membre ou administration
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@fitzone.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full btn-primary-glow"
                disabled={isSubmitting}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Comptes démo
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><strong>Admin:</strong> admin@fitzone.com / admin123</p>
                <p><strong>Membre:</strong> membre@fitzone.com / membre123</p>
                <p><strong>Coach:</strong> coach@fitzone.com / coach123</p>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Pas encore inscrit ?{" "}
              <Link to="/inscription" className="text-primary hover:underline">
                S'inscrire maintenant
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
