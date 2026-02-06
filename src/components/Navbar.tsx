import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Dumbbell, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SettingsMenu from "@/components/SettingsMenu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isMembre, isCoach, logout } = useAuth();

  const publicLinks = [
    { name: "Accueil", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Tarifs", href: "/tarifs" },
  ];

  // Cacher Planning et Tarifs pour les coaches
  const planningLink = user && !isCoach ? { name: "Planning", href: "/planning" } : null;

  // Liens spécifiques pour l'admin (sans lien Dashboard dédié, le tableau de bord est dans /admin)
  const adminLinks = isAdmin ? [{ name: "Admin", href: "/admin" }, { name: "Abonnements", href: "/abonnements" }] : [];
  const memberLinks = isMembre ? [{ name: "Espace Membre", href: "/espace-membre" }] : [];
  const coachLinks = isCoach ? [{ name: "Espace Coach", href: "/espace-coach" }] : [];

  // Exclure certains liens publics selon le rôle / la page
  const filteredPublicLinks = publicLinks.filter((link) => {
    // Cacher "Accueil" dans la navbar quand on est admin (interface admin dédiée)
    if (isAdmin && link.href === "/") {
      return false;
    }
    // Cacher "Tarifs" pour les coaches
    if (isCoach && link.href === "/tarifs") {
      return false;
    }
    return true;
  });

  const navLinks = [
    ...filteredPublicLinks,
    ...(planningLink ? [planningLink] : []),
    ...adminLinks,
    ...memberLinks,
    ...coachLinks,
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              FIT<span className="text-primary">ZONE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm uppercase tracking-wider font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.prenom} ({user.role})
                </span>
                <SettingsMenu />
                <Button variant="outline" size="sm" onClick={logout} asChild>
                  <Link to="/">
                    <LogOut className="w-4 h-4 mr-1" />
                    Déconnexion
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <SettingsMenu />
                <Button className="btn-primary-glow" asChild>
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block py-2 text-lg font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-sm text-muted-foreground">{user.prenom} {user.nom} ({user.role})</p>
                <div className="flex gap-2">
                  <SettingsMenu />
                  <Button variant="outline" className="flex-1" onClick={() => { logout(); setIsOpen(false); }} asChild>
                    <Link to="/">
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-border space-y-2">
                <SettingsMenu />
                <Button className="w-full btn-primary-glow mt-2" asChild>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
