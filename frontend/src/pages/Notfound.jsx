// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-page__container">
        <div className="not-found-page__content">
          <div className="not-found-page__code">404</div>
          <h1 className="not-found-page__title">Page non trouvée</h1>
          <p className="not-found-page__description">
            Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
          <div className="not-found-page__actions">
            <Link to="/" className="not-found-page__btn not-found-page__btn--primary">
              <Home size={18} />
              Retour à l'accueil
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="not-found-page__btn not-found-page__btn--secondary"
            >
              <ArrowLeft size={18} />
              Page précédente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;