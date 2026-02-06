import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Zap, User, MapPin, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { coursData, type SportId } from "@/lib/cours";
import NotFound from "./NotFound";

const CoursDescriptionPage = () => {
  const { sportId } = useParams<{ sportId: string }>();
  const sport = sportId ? coursData[sportId as SportId] : null;

  if (!sport) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <Button variant="ghost" className="mb-8" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </Button>

          <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto">
            <div className="space-y-8">
              <div>
                <p className="text-primary uppercase tracking-widest text-sm font-semibold mb-2">
                  Nos Cours
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  {sport.nom}
                </h1>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {sport.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 py-6 border-y border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Durée</p>
                    <p className="font-semibold">{sport.duree}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Intensité</p>
                    <p className="font-semibold">{sport.intensite}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coach</p>
                    <p className="font-semibold">{sport.coach}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salle</p>
                    <p className="font-semibold">{sport.salle}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold mb-4">Avantages</h2>
                <ul className="space-y-3">
                  {sport.avantages.map((avantage) => (
                    <li key={avantage} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{avantage}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button className="btn-primary-glow" asChild>
                  <Link to="/inscription">S'inscrire maintenant</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/planning">Voir le planning</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoursDescriptionPage;
