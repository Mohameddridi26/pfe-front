import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Youtube, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-gym.jpg";

const Hero = () => {
  const { isAuthenticated, isMembre } = useAuth();
  return (
    <section id="accueil" className="relative min-h-screen flex items-center pt-20">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/40 z-10" />
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient-gold">FITNESS</span>
                <br />
                <span className="text-foreground">VOTRE SALLE</span>
                <br />
                <span className="text-foreground">DE SPORT</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Transformez votre corps et votre esprit avec nos programmes personnalisés, 
                des coachs experts et des équipements de pointe.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {isAuthenticated && isMembre ? (
                <Button className="btn-primary-glow flex items-center gap-2 text-lg" asChild>
                  <Link to="/espace-membre">
                    <Sparkles className="w-5 h-5" />
                    Mon Espace Membre
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              ) : isAuthenticated ? (
                <Button className="btn-primary-glow flex items-center gap-2 text-lg" asChild>
                  <Link to="/planning">
                    <Calendar className="w-5 h-5" />
                    Voir le Planning
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button className="btn-primary-glow flex items-center gap-2 text-lg" asChild>
                    <Link to="/services">
                      Découvrir nos Services
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 text-lg" asChild>
                    <Link to="/login">
                      Se connecter
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </>
              )}
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 ml-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div>
                <p className="font-display text-3xl md:text-4xl font-bold text-primary">500+</p>
                <p className="text-muted-foreground text-sm">Membres Actifs</p>
              </div>
              <div>
                <p className="font-display text-3xl md:text-4xl font-bold text-primary">15+</p>
                <p className="text-muted-foreground text-sm">Coachs Experts</p>
              </div>
              <div>
                <p className="font-display text-3xl md:text-4xl font-bold text-primary">50+</p>
                <p className="text-muted-foreground text-sm">Cours/Semaine</p>
              </div>
            </div>
          </div>

          {/* Right side - empty for background image visibility */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Bottom URL bar */}
      <div className="absolute bottom-8 right-8 z-20 hidden lg:block">
        <p className="text-muted-foreground text-sm tracking-widest">
          WWW.FITZONE.COM
        </p>
      </div>
    </section>
  );
};

export default Hero;
