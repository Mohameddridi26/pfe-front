import { useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Users, Calendar, Brain, Trophy, Heart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const defaultServices = [
  {
    icon: Dumbbell,
    title: "Musculation",
    description: "Équipements de dernière génération pour votre entraînement.",
  },
  {
    icon: Users,
    title: "Cours Collectifs",
    description: "Zumba, Yoga, Boxe, CrossFit avec nos coachs certifiés.",
  },
  {
    icon: Calendar,
    title: "Planning Dynamique",
    description: "Réservez vos séances en temps réel depuis votre espace.",
  },
  {
    icon: Brain,
    title: "IA Personnalisée",
    description: "Programmes adaptés à vos objectifs et votre historique.",
  },
  {
    icon: Trophy,
    title: "Coaching Personnel",
    description: "Suivi individuel avec des experts du fitness.",
  },
  {
    icon: Heart,
    title: "Suivi Santé",
    description: "Certificat médical et suivi de votre progression.",
  },
] as const;

type ServiceItem = (typeof defaultServices)[number];

const Services = () => {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([...defaultServices]);

  const handleEditService = (index: number) => {
    if (!isAdmin) return;
    const current = services[index];
    const newTitle = window.prompt("Titre du service :", current.title);
    if (newTitle === null || newTitle.trim() === "") return;
    const newDescription = window.prompt("Description du service :", current.description);
    if (newDescription === null || newDescription.trim() === "") return;

    setServices((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, title: newTitle.trim(), description: newDescription.trim() } : s
      )
    );
  };

  const handleDeleteService = (index: number) => {
    if (!isAdmin) return;
    const ok = window.confirm("Supprimer ce service ?");
    if (!ok) return;
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddService = () => {
    if (!isAdmin) return;
    const title = window.prompt("Titre du nouveau service :");
    if (!title || title.trim() === "") return;
    const description = window.prompt("Description du nouveau service :");
    if (!description || description.trim() === "") return;

    // Par défaut, utiliser l'icône Musculation pour les nouveaux services
    setServices((prev) => [
      ...prev,
      {
        icon: Dumbbell,
        title: title.trim(),
        description: description.trim(),
      },
    ]);
  };
  return (
    <section id="services" className="section-padding bg-gradient-dark">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-primary uppercase tracking-widest text-sm font-semibold">
            Nos Services
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Tout pour votre <span className="text-gradient-gold">Réussite</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une expérience fitness complète avec des outils modernes de gestion 
            et de suivi pour atteindre vos objectifs.
          </p>
        </div>

        {/* Nos Cours - Section cliquable */}
        <div className="mb-20">
          <h3 className="font-display text-2xl font-bold mb-8 text-center">
            Nos <span className="text-gradient-gold">Cours</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { nom: "Musculation", id: "musculation" },
              { nom: "CrossFit", id: "crossfit" },
              { nom: "Yoga", id: "yoga" },
              { nom: "Zumba", id: "zumba" },
              { nom: "Boxe", id: "boxe" },
              { nom: "Pilates", id: "pilates" },
            ].map((cours) => (
              <Link
                key={cours.id}
                to={`/cours/${cours.id}`}
                className="course-card p-6 flex items-center justify-between group"
              >
                <span className="font-display text-lg font-bold">{cours.nom}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={`${service.title}-${index}`}
              className="course-card p-8 group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 text-xs"
                    onClick={() => handleEditService(index)}
                  >
                    ✏️
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 text-xs text-destructive"
                    onClick={() => handleDeleteService(index)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="mt-10 text-center">
            <Button onClick={handleAddService} className="btn-primary-glow">
              Ajouter un service
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
