import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTarifs } from "@/contexts/TarifsContext";

const Pricing = () => {
  const { isMembre, isAdmin } = useAuth();
  const { plans } = useTarifs();
  
  // Filtrer uniquement les plans actifs pour l'affichage public
  const plansActifs = plans.filter((p) => p.actif);

  return (
    <section id="tarifs" className="section-padding bg-gradient-dark">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-primary uppercase tracking-widest text-sm font-semibold">
            Tarifs
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Nos <span className="text-gradient-gold">Abonnements</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choisissez la formule qui correspond à vos besoins. 
            Tous nos forfaits incluent l'accès aux équipements et aux cours collectifs.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plansActifs.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/20 to-card border-2 border-primary scale-105"
                  : "bg-card border border-border hover:border-primary/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4" fill="currentColor" />
                  Populaire
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="font-display text-5xl font-bold text-gradient-gold">
                    {plan.price} DT
                  </span>
                  <span className="text-muted-foreground mb-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isAdmin && (
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "btn-primary-glow"
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                  asChild
                >
                  {isMembre ? (
                    <Link to={`/paiement-abonnement?type=${encodeURIComponent(plan.name)}`}>
                      Choisir ce forfait
                    </Link>
                  ) : (
                    <Link to={`/inscription?forfait=${encodeURIComponent(plan.name)}`}>
                      Choisir ce forfait
                    </Link>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
