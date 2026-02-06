import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Users, DollarSign, Clock, Calendar } from "lucide-react";

const stats = [
  {
    title: "Chiffre d'Affaires",
    value: "80 800 DT",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "Ce mois vs mois dernier",
  },
  {
    title: "Membres Actifs",
    value: "487",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    description: "Abonnements en cours",
  },
  {
    title: "Heure de Pointe",
    value: "18h-20h",
    change: "Stable",
    trend: "neutral",
    icon: Clock,
    description: "Fréquentation maximale",
  },
  {
    title: "Taux de Rétention",
    value: "78%",
    change: "+3.1%",
    trend: "up",
    icon: TrendingUp,
    description: "Renouvellements",
  },
];

const subscriptionData = [
  { type: "Mensuel", percentage: 45, color: "primary" },
  { type: "Trimestriel", percentage: 35, color: "gold-light" },
  { type: "Annuel", percentage: 20, color: "muted" },
];

const recentMembers = [
  { name: "Sophie Martin", plan: "Trimestriel", date: "Aujourd'hui", status: "active" },
  { name: "Lucas Dubois", plan: "Mensuel", date: "Hier", status: "pending" },
  { name: "Emma Bernard", plan: "Annuel", date: "Il y a 2 jours", status: "active" },
];

const Dashboard = () => {
  return (
    <section id="dashboard" className="section-padding">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <p className="text-primary uppercase tracking-widest text-sm font-semibold">
            Tableau de Bord
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Statistiques & <span className="text-gradient-gold">Reporting</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visualisez les données clés de votre salle de sport pour prendre 
            des décisions éclairées.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.title} className="dashboard-stat">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <span
                  className={`text-sm font-medium flex items-center gap-1 ${
                    stat.trend === "up"
                      ? "text-green-500"
                      : stat.trend === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.trend === "up" && <TrendingUp className="w-4 h-4" />}
                  {stat.trend === "down" && <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <p className="font-display text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.title}</p>
              <p className="text-muted-foreground/60 text-xs mt-2">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Subscription Distribution */}
          <div className="glass-card p-6">
            <h3 className="font-display text-xl font-bold mb-6">Répartition Abonnements</h3>
            <div className="space-y-4">
              {subscriptionData.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{item.type}</span>
                    <span className="font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.color === "primary"
                          ? "bg-primary"
                          : item.color === "gold-light"
                          ? "bg-primary/70"
                          : "bg-muted-foreground/50"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mini chart placeholder */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm">Comparaison annuelle</span>
                <span className="text-primary text-sm font-semibold">2025 vs 2026</span>
              </div>
              <div className="flex items-end gap-2 h-20">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all duration-300 ${
                      i % 2 === 0 ? "bg-primary/30" : "bg-primary"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Inscriptions */}
          <div className="glass-card p-6">
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Dernières Inscriptions
            </h3>
            <div className="space-y-4">
              {recentMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-muted-foreground text-sm">{member.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === "active"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {member.status === "active" ? "Actif" : "En attente"}
                    </span>
                    <p className="text-muted-foreground text-xs mt-1">{member.date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <Link to="/abonnements" className="block mt-6">
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl hover:bg-primary/15 transition-colors">
                <p className="text-sm font-semibold text-primary mb-1">⚠️ Alertes</p>
                <p className="text-muted-foreground text-sm">
                  12 abonnements expirent dans les 5 prochains jours
                </p>
                <p className="text-primary text-xs font-medium mt-2">Voir la gestion des abonnements →</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
