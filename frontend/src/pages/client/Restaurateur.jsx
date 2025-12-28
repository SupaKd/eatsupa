import { useState } from 'react';
import { Link } from 'react-router-dom';

function Restaurateur() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      title: '0% de Commission',
      description: 'Gardez 100% de vos ventes. Contrairement aux géants qui prennent jusqu\'à 30%, nous fonctionnons avec un simple abonnement mensuel.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
      title: 'Dashboard Complet',
      description: 'Gérez vos commandes, votre menu, vos horaires et vos statistiques depuis une interface moderne et intuitive.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: 'Notifications Temps Réel',
      description: 'Recevez instantanément les nouvelles commandes. Ne manquez plus jamais une opportunité de vente.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: 'Paiements Sécurisés',
      description: 'Stripe gère tous les paiements. Virements automatiques sur votre compte bancaire sous 48h.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: 'Gestion des Horaires',
      description: 'Définissez vos créneaux de service, vos jours de fermeture et vos congés en quelques clics.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: 'Zone de Livraison',
      description: 'Configurez vos zones de livraison et vos frais selon les secteurs. Optimisez votre rayon d\'action.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Inscription',
      description: 'Créez votre compte en 2 minutes. Renseignez les informations de base de votre établissement.',
    },
    {
      number: '02',
      title: 'Configuration',
      description: 'Ajoutez votre menu, vos photos, vos horaires et personnalisez votre page restaurant.',
    },
    {
      number: '03',
      title: 'Validation',
      description: 'Notre équipe valide votre établissement sous 24h. Nous vérifions que tout est en ordre.',
    },
    {
      number: '04',
      title: 'Lancement',
      description: 'Votre restaurant est en ligne ! Commencez à recevoir des commandes sans commission.',
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '29',
      description: 'Idéal pour démarrer',
      features: [
        'Page restaurant personnalisée',
        'Gestion des commandes',
        'Paiements sécurisés',
        'Support par email',
        'Jusqu\'à 100 commandes/mois',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '49',
      description: 'Pour les restaurants établis',
      features: [
        'Tout Starter inclus',
        'Commandes illimitées',
        'Statistiques avancées',
        'Support prioritaire',
        'Promotions & codes promo',
        'Multi-utilisateurs',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: '79',
      description: 'Pour les plus ambitieux',
      features: [
        'Tout Pro inclus',
        'API personnalisée',
        'Intégration caisse',
        'Account manager dédié',
        'Formation équipe',
        'Visibilité boostée',
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Comment fonctionne l\'abonnement ?',
      answer: 'L\'abonnement est mensuel et sans engagement. Vous pouvez résilier à tout moment. Le premier mois est offert pour vous permettre de tester la plateforme sans risque.',
    },
    {
      question: 'Quand et comment suis-je payé ?',
      answer: 'Les paiements sont traités par Stripe. Vous recevez vos fonds directement sur votre compte bancaire sous 48h après chaque commande. Vous gardez 100% du montant des ventes.',
    },
    {
      question: 'Puis-je modifier mon menu à tout moment ?',
      answer: 'Oui, vous avez un contrôle total sur votre menu. Ajoutez, modifiez ou supprimez des plats instantanément depuis votre dashboard. Les changements sont visibles immédiatement.',
    },
    {
      question: 'Que se passe-t-il si j\'ai un problème technique ?',
      answer: 'Notre équipe support basée à Oyonnax est disponible pour vous aider. Les abonnés Pro et Premium bénéficient d\'un support prioritaire avec réponse sous 2h.',
    },
    {
      question: 'Dois-je gérer la livraison moi-même ?',
      answer: 'Vous choisissez votre mode de fonctionnement : livraison par vos propres moyens, click & collect, ou les deux. Vous définissez vos zones et vos frais de livraison.',
    },
    {
      question: 'Comment les clients me trouvent-ils ?',
      answer: 'Votre restaurant apparaît sur la plateforme Yumioo visible par tous les habitants d\'Oyonnax. Vous pouvez aussi partager directement le lien de votre page restaurant.',
    },
  ];

  const testimonials = [
    {
      name: 'Marco B.',
      restaurant: 'Pizzeria Da Marco',
      image: '🍕',
      text: 'Depuis que j\'ai quitté UberEats pour Yumioo, je garde enfin mes marges. Le dashboard est super simple à utiliser.',
    },
    {
      name: 'Linh T.',
      restaurant: 'Saveurs d\'Asie',
      image: '🍜',
      text: 'Le support est vraiment local et réactif. Ça change des plateformes où on parle à des robots !',
    },
    {
      name: 'Karim A.',
      restaurant: 'Le Kebab d\'Oyonnax',
      image: '🥙',
      text: 'Mes clients apprécient que leur argent reste dans l\'économie locale. C\'est bon pour tout le monde.',
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
            <span className="resto-hero__title-line resto-hero__title-line--accent">100% de vos ventes</span>
            <span className="resto-hero__title-line resto-hero__title-line--small">Zéro commission. Toujours.</span>
          </h1>

          <p className="resto-hero__subtitle">
            Les grandes plateformes prennent jusqu'à 30% de vos revenus.
            <strong> Reprenez le contrôle avec Yumioo.</strong>
          </p>

          <div className="resto-hero__cta">
            <Link to="/register?role=restaurateur" className="resto-hero__btn resto-hero__btn--primary">
              <span>Essayer gratuitement 1 mois</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <a href="#pricing" className="resto-hero__btn resto-hero__btn--secondary">
              <span>Voir les tarifs</span>
            </a>
          </div>

          {/* Comparison */}
          <div className="resto-hero__comparison">
            <div className="resto-hero__comparison-item resto-hero__comparison-item--bad">
              <span className="resto-hero__comparison-label">Plateformes classiques</span>
              <span className="resto-hero__comparison-value">-30%</span>
              <span className="resto-hero__comparison-note">de commission par commande</span>
            </div>
            <div className="resto-hero__comparison-vs">VS</div>
            <div className="resto-hero__comparison-item resto-hero__comparison-item--good">
              <span className="resto-hero__comparison-label">Yumioo</span>
              <span className="resto-hero__comparison-value">0%</span>
              <span className="resto-hero__comparison-note">de commission, jamais</span>
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
              Sur une commande de <strong>50€</strong>, les plateformes traditionnelles prennent jusqu'à <strong>15€</strong>. 
              Sur un mois avec 200 commandes, c'est <strong>3000€</strong> qui disparaissent de votre tiroir-caisse.
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
              Une plateforme complète pensée pour les restaurateurs, pas pour les actionnaires
            </p>
          </div>

          <div className="resto-features__grid">
            {features.map((feature, index) => (
              <div key={index} className="resto-features__card" style={{ '--delay': `${index * 0.1}s` }}>
                <div className="resto-features__card-icon">{feature.icon}</div>
                <h3 className="resto-features__card-title">{feature.title}</h3>
                <p className="resto-features__card-desc">{feature.description}</p>
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
              <span className="resto-testimonials__title-accent"> bon choix</span>
            </h2>
          </div>

          <div className="resto-testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="resto-testimonials__card">
                <div className="resto-testimonials__card-header">
                  <div className="resto-testimonials__card-avatar">{testimonial.image}</div>
                  <div>
                    <h4 className="resto-testimonials__card-name">{testimonial.name}</h4>
                    <span className="resto-testimonials__card-restaurant">{testimonial.restaurant}</span>
                  </div>
                </div>
                <p className="resto-testimonials__card-text">"{testimonial.text}"</p>
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
                className={`resto-pricing__card ${plan.popular ? 'resto-pricing__card--popular' : ''}`}
              >
                {plan.popular && <span className="resto-pricing__card-badge">Le plus populaire</span>}
                <h3 className="resto-pricing__card-name">{plan.name}</h3>
                <p className="resto-pricing__card-desc">{plan.description}</p>
                <div className="resto-pricing__card-price">
                  <span className="resto-pricing__card-amount">{plan.price}€</span>
                  <span className="resto-pricing__card-period">/mois</span>
                </div>
                <ul className="resto-pricing__card-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/register?role=restaurateur" 
                  className={`resto-pricing__card-btn ${plan.popular ? 'resto-pricing__card-btn--primary' : ''}`}
                >
                  Commencer gratuitement
                </Link>
              </div>
            ))}
          </div>

          <p className="resto-pricing__note">
            ✨ Premier mois offert sur tous les plans • Sans engagement • Annulation en 1 clic
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
                className={`resto-faq__item ${openFaq === index ? 'resto-faq__item--open' : ''}`}
              >
                <button 
                  className="resto-faq__question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
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
              <span className="resto-final-cta__title-accent"> 100% de vos ventes ?</span>
            </h2>
            <p className="resto-final-cta__text">
              Rejoignez les restaurateurs d'Oyonnax qui ont fait le choix d'une plateforme éthique et locale.
              Premier mois offert, sans engagement.
            </p>
            <div className="resto-final-cta__buttons">
              <Link to="/register?role=restaurateur" className="resto-final-cta__btn resto-final-cta__btn--primary">
                <span>Inscrire mon restaurant</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <a href="mailto:contact@yumioo.fr" className="resto-final-cta__btn resto-final-cta__btn--secondary">
                <span>Nous contacter</span>
              </a>
            </div>
          </div>

          <div className="resto-final-cta__visual">
            <div className="resto-final-cta__cards">
              <div className="resto-final-cta__card resto-final-cta__card--1">
                <span>💰</span>
                <span>0% commission</span>
              </div>
              <div className="resto-final-cta__card resto-final-cta__card--2">
                <span>🚀</span>
                <span>En ligne en 24h</span>
              </div>
              <div className="resto-final-cta__card resto-final-cta__card--3">
                <span>🎁</span>
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