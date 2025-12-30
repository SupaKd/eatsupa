import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Percent,
  LayoutDashboard,
  Bell,
  ShieldCheck,
  Clock,
  MapPin,
  ArrowRight,
  Check,
  Plus,
  DollarSign,
  Rocket,
  Gift,
} from "lucide-react";

function Restaurateur() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: <Percent size={32} strokeWidth={1.5} />,
      title: "0% de Commission",
      description:
        "Gardez 100% de vos ventes. Contrairement aux géants qui prennent jusqu'à 30%, nous fonctionnons avec un simple abonnement mensuel.",
    },
    {
      icon: <LayoutDashboard size={32} strokeWidth={1.5} />,
      title: "Dashboard Complet",
      description:
        "Gérez vos commandes, votre menu, vos horaires et vos statistiques depuis une interface moderne et intuitive.",
    },
    {
      icon: <Bell size={32} strokeWidth={1.5} />,
      title: "Notifications Temps Réel",
      description:
        "Recevez instantanément les nouvelles commandes. Ne manquez plus jamais une opportunité de vente.",
    },
    {
      icon: <ShieldCheck size={32} strokeWidth={1.5} />,
      title: "Paiements Sécurisés",
      description:
        "Paiement en ligne bientôt disponible. Le client paie directement au restaurant, sans intermédiaire.",
    },
    {
      icon: <Clock size={32} strokeWidth={1.5} />,
      title: "Gestion des Horaires",
      description:
        "Définissez vos créneaux de service, vos jours de fermeture et vos congés en quelques clics.",
    },
    {
      icon: <MapPin size={32} strokeWidth={1.5} />,
      title: "Zone de Livraison",
      description:
        "Configurez vos zones de livraison et vos frais selon les secteurs. Optimisez votre rayon d'action.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Inscription",
      description:
        "Créez votre compte en 2 minutes. Renseignez les informations de base de votre établissement.",
    },
    {
      number: "02",
      title: "Configuration",
      description:
        "Ajoutez votre menu, vos photos, vos horaires et personnalisez votre page restaurant.",
    },
    {
      number: "03",
      title: "Validation",
      description:
        "Notre équipe valide votre établissement sous 24h. Nous vérifions que tout est en ordre.",
    },
    {
      number: "04",
      title: "Lancement",
      description:
        "Votre restaurant est en ligne ! Commencez à recevoir des commandes sans commission.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "29",
      description: "Idéal pour démarrer",
      features: [
        "Page restaurant personnalisée",
        "Gestion des commandes",
        "Paiements sécurisés",
        "Support par email",
        "Jusqu'à 100 commandes/mois",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "49",
      description: "Pour les restaurants établis",
      features: [
        "Tout Starter inclus",
        "Commandes illimitées",
        "Statistiques avancées",
        "Support prioritaire",
        "Promotions & codes promo",
        "Multi-utilisateurs",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "79",
      description: "Pour les plus ambitieux",
      features: [
        "Tout Pro inclus",
        "API personnalisée",
        "Intégration caisse",
        "Account manager dédié",
        "Formation équipe",
        "Visibilité boostée",
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Comment fonctionne l'abonnement ?",
      answer:
        "L'abonnement est mensuel et sans engagement. Vous pouvez résilier à tout moment. Le premier mois est offert pour vous permettre de tester la plateforme sans risque.",
    },
    {
      question: "Quand et comment suis-je payé ?",
      answer:
        "Les clients paient directement au restaurant par carte bancaire ou espèces.",
    },
    {
      question: "Puis-je modifier mon menu à tout moment ?",
      answer:
        "Oui, vous avez un contrôle total sur votre menu. Ajoutez, modifiez ou supprimez des plats instantanément depuis votre dashboard. Les changements sont visibles immédiatement.",
    },
    {
      question: "Que se passe-t-il si j'ai un problème technique ?",
      answer: "Notre équipe support est disponible pour vous aider.",
    },
    {
      question: "Dois-je gérer la livraison moi-même ?",
      answer:
        "Vous choisissez votre mode de fonctionnement : livraison par vos propres moyens, click & collect, ou les deux. Vous définissez vos zones et vos frais de livraison.",
    },
    {
      question: "Comment les clients me trouvent-ils ?",
      answer:
        "Votre restaurant apparaît sur la plateforme Yumioo visible par tous. Vous pouvez aussi partager directement le lien de votre page restaurant.",
    },
  ];

  const testimonials = [
    {
      name: "Marco B.",
      restaurant: "Pizzeria Da Marco",
      image: "🍕",
      text: "Depuis que j'ai quitté UberEats pour Yumioo, je garde enfin mes marges. Le dashboard est super simple à utiliser.",
    },
    {
      name: "Linh T.",
      restaurant: "Saveurs d'Asie",
      image: "🍜",
      text: "Le support est vraiment local et réactif. Ça change des plateformes où on parle à des robots !",
    },
    {
      name: "Karim A.",
      restaurant: "Le Kebab d'Oyonnax",
      image: "🥙",
      text: "Mes clients apprécient que leur argent reste dans l'économie locale. C'est bon pour tout le monde.",
    },
  ];

  return (
    <div className="restaurateur-page">
      {/* Hero Section */}
      <section className="resto-hero">
        <div className="resto-hero__bg">
          <div className="resto-hero__blob resto-hero__blob--1"></div>
          <div className="resto-hero__blob resto-hero__blob--2"></div>
          <div className="resto-hero__grid"></div>
        </div>

        <div className="resto-hero__container">
          <h1 className="resto-hero__title">
            <span className="resto-hero__title-line">Gardez</span>
            <span className="resto-hero__title-line resto-hero__title-line--accent">
              100% de vos ventes
            </span>
            <span className="resto-hero__title-line resto-hero__title-line--small">
              Zéro commission.
            </span>
          </h1>

          <p className="resto-hero__subtitle">
            Les grandes plateformes prennent jusqu'à 30% de vos revenus.
            <strong> Reprenez le contrôle avec Yumioo.</strong>
          </p>

          <div className="resto-hero__cta">
            <Link
              to="/register?role=restaurateur"
              className="resto-hero__btn resto-hero__btn--primary"
            >
              <span>Essayer gratuitement 1 mois</span>
              <ArrowRight size={20} strokeWidth={2} />
            </Link>

            <a
              href="#pricing"
              className="resto-hero__btn resto-hero__btn--secondary"
            >
              <span>Voir les tarifs</span>
            </a>
          </div>

          {/* Comparison */}
          <div className="resto-hero__comparison">
            <div className="resto-hero__comparison-item resto-hero__comparison-item--bad">
              <span className="resto-hero__comparison-label">
                Plateformes classiques
              </span>
              <span className="resto-hero__comparison-value">-30%</span>
              <span className="resto-hero__comparison-note">
                de commission par commande
              </span>
            </div>
            <div className="resto-hero__comparison-vs">VS</div>
            <div className="resto-hero__comparison-item resto-hero__comparison-item--good">
              <span className="resto-hero__comparison-label">Yumioo</span>
              <span className="resto-hero__comparison-value">0%</span>
              <span className="resto-hero__comparison-note">de commission</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="resto-problem">
        <div className="resto-problem__container">
          <div className="resto-problem__content">
            <span className="resto-problem__label">Le problème</span>
            <h2 className="resto-problem__title">
              Chaque commande vous coûte
              <span className="resto-problem__highlight"> de l'argent</span>
            </h2>
            <p className="resto-problem__text">
              Sur une commande de <strong>50€</strong>, les plateformes
              traditionnelles prennent jusqu'à <strong>15€</strong>. Sur un mois
              avec 200 commandes, c'est <strong>3000€</strong> qui disparaissent
              de votre tiroir-caisse.
            </p>
          </div>

          <div className="resto-problem__visual">
            <div className="resto-problem__calc">
              <div className="resto-problem__calc-row">
                <span>Commande moyenne</span>
                <span>50€</span>
              </div>
              <div className="resto-problem__calc-row resto-problem__calc-row--bad">
                <span>Commission plateforme (30%)</span>
                <span>-15€</span>
              </div>
              <div className="resto-problem__calc-row">
                <span>Vous recevez</span>
                <span>35€</span>
              </div>
              <div className="resto-problem__calc-divider"></div>
              <div className="resto-problem__calc-row resto-problem__calc-row--total">
                <span>Pertes sur 200 commandes/mois</span>
                <span className="resto-problem__calc-loss">-3000€</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="resto-features">
        <div className="resto-features__container">
          <div className="resto-features__header">
            <span className="resto-features__label">Fonctionnalités</span>
            <h2 className="resto-features__title">
              Tout ce qu'il vous faut pour
              <span className="resto-features__title-accent"> réussir</span>
            </h2>
            <p className="resto-features__subtitle">
              Une plateforme complète pensée pour les restaurateurs, pas pour
              les actionnaires
            </p>
          </div>

          <div className="resto-features__grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="resto-features__card"
                style={{ "--delay": `${index * 0.1}s` }}
              >
                <div className="resto-features__card-icon">{feature.icon}</div>
                <h3 className="resto-features__card-title">{feature.title}</h3>
                <p className="resto-features__card-desc">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="resto-steps">
        <div className="resto-steps__container">
          <div className="resto-steps__header">
            <span className="resto-steps__label">Comment ça marche</span>
            <h2 className="resto-steps__title">
              En ligne en
              <span className="resto-steps__title-accent"> 24h</span>
            </h2>
          </div>

          <div className="resto-steps__timeline">
            {steps.map((step, index) => (
              <div key={index} className="resto-steps__item">
                <div className="resto-steps__number">{step.number}</div>
                <div className="resto-steps__content">
                  <h3 className="resto-steps__item-title">{step.title}</h3>
                  <p className="resto-steps__item-desc">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="resto-testimonials">
        <div className="resto-testimonials__container">
          <div className="resto-testimonials__header">
            <span className="resto-testimonials__label">Témoignages</span>
            <h2 className="resto-testimonials__title">
              Ils ont fait le
              <span className="resto-testimonials__title-accent">
                {" "}
                bon choix
              </span>
            </h2>
          </div>

          <div className="resto-testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="resto-testimonials__card">
                <div className="resto-testimonials__card-header">
                  <div className="resto-testimonials__card-avatar">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="resto-testimonials__card-name">
                      {testimonial.name}
                    </h4>
                    <span className="resto-testimonials__card-restaurant">
                      {testimonial.restaurant}
                    </span>
                  </div>
                </div>
                <p className="resto-testimonials__card-text">
                  "{testimonial.text}"
                </p>
                <div className="resto-testimonials__card-stars">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="resto-pricing" id="pricing">
        <div className="resto-pricing__container">
          <div className="resto-pricing__header">
            <span className="resto-pricing__label">Tarifs</span>
            <h2 className="resto-pricing__title">
              Simple et
              <span className="resto-pricing__title-accent"> transparent</span>
            </h2>
            <p className="resto-pricing__subtitle">
              Un abonnement fixe, pas de commission cachée. Premier mois offert.
            </p>
          </div>

          <div className="resto-pricing__grid">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`resto-pricing__card ${
                  plan.popular ? "resto-pricing__card--popular" : ""
                }`}
              >
                {plan.popular && (
                  <span className="resto-pricing__card-badge">
                    Le plus populaire
                  </span>
                )}
                <h3 className="resto-pricing__card-name">{plan.name}</h3>
                <p className="resto-pricing__card-desc">{plan.description}</p>
                <div className="resto-pricing__card-price">
                  <span className="resto-pricing__card-amount">
                    {plan.price}€
                  </span>
                  <span className="resto-pricing__card-period">/mois</span>
                </div>
                <ul className="resto-pricing__card-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <Check size={18} strokeWidth={2} />

                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register?role=restaurateur"
                  className={`resto-pricing__card-btn ${
                    plan.popular ? "resto-pricing__card-btn--primary" : ""
                  }`}
                >
                  Commencer gratuitement
                </Link>
              </div>
            ))}
          </div>

          <p className="resto-pricing__note">
            ✨ Premier mois offert sur tous les plans • Sans engagement •
            Annulation en 1 clic
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="resto-faq">
        <div className="resto-faq__container">
          <div className="resto-faq__header">
            <span className="resto-faq__label">FAQ</span>
            <h2 className="resto-faq__title">
              Questions
              <span className="resto-faq__title-accent"> fréquentes</span>
            </h2>
          </div>

          <div className="resto-faq__list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`resto-faq__item ${
                  openFaq === index ? "resto-faq__item--open" : ""
                }`}
              >
                <button
                  className="resto-faq__question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <Plus size={24} strokeWidth={2} />
                </button>
                <div className="resto-faq__answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="resto-final-cta">
        <div className="resto-final-cta__container">
          <div className="resto-final-cta__content">
            <h2 className="resto-final-cta__title">
              Prêt à garder
              <span className="resto-final-cta__title-accent">
                {" "}
                100% de vos ventes ?
              </span>
            </h2>
            <p className="resto-final-cta__text">
              Rejoignez les restaurateurs d'Oyonnax qui ont fait le choix d'une
              plateforme éthique et locale. Premier mois offert, sans
              engagement.
            </p>
            <div className="resto-final-cta__buttons">
              <Link
                to="/register?role=restaurateur"
                className="resto-final-cta__btn resto-final-cta__btn--primary"
              >
                <span>Inscrire mon restaurant</span>
                <ArrowRight size={20} strokeWidth={2} />
              </Link>
              <a
                href="mailto:contact@yumioo.fr"
                className="resto-final-cta__btn resto-final-cta__btn--secondary"
              >
                <span>Nous contacter</span>
              </a>
            </div>
          </div>

          <div className="resto-final-cta__visual">
            <div className="resto-final-cta__cards">
              <div className="resto-final-cta__card resto-final-cta__card--1">
                <DollarSign size={32} />
                <span>0% commission</span>
              </div>
              <div className="resto-final-cta__card resto-final-cta__card--2">
                <Rocket size={32} />
                <span>En ligne en 24h</span>
              </div>
              <div className="resto-final-cta__card resto-final-cta__card--3">
                <Gift size={32} />
                <span>1er mois offert</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="banner">
        <div className="banner__marquee">
          <div className="banner__track">
            <span>OYONNAX</span>
            <span>•</span>
            <span>0% COMMISSION</span>
            <span>•</span>
            <span>100% LOCAL</span>
            <span>•</span>
            <span>Yumioo</span>
            <span>•</span>
            <span>OYONNAX</span>
            <span>•</span>
            <span>0% COMMISSION</span>
            <span>•</span>
            <span>100% LOCAL</span>
            <span>•</span>
            <span>Yumioo</span>
            <span>•</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Restaurateur;
