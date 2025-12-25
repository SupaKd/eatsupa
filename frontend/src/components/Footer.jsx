import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Logo & Description */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">🍽️</span>
              <span className="footer__logo-text">SupaFood</span>
            </Link>
            <p className="footer__description">
              Découvrez les meilleurs restaurants près de chez vous et commandez facilement vos plats préférés.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="footer__links">
            <h4 className="footer__title">Navigation</h4>
            <ul className="footer__list">
              <li><Link to="/">Restaurants</Link></li>
              <li><Link to="/suivi">Suivre ma commande</Link></li>
              <li><Link to="/login">Connexion</Link></li>
              <li><Link to="/register">Inscription</Link></li>
            </ul>
          </div>

          {/* Restaurateurs */}
          <div className="footer__links">
            <h4 className="footer__title">Restaurateurs</h4>
            <ul className="footer__list">
              <li><Link to="/register?role=restaurateur">Devenir partenaire</Link></li>
              <li><Link to="/login">Espace restaurateur</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__links">
            <h4 className="footer__title">Contact</h4>
            <ul className="footer__list">
              <li>
                <a href="mailto:contact@localfood.fr">
                  contact@localfood.fr
                </a>
              </li>
              <li>
                <a href="tel:+33123456789">
                  01 23 45 67 89
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} LocalFood. Tous droits réservés.
          </p>
          <div className="footer__legal">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/confidentialite">Confidentialité</Link>
            <Link to="/cgv">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;