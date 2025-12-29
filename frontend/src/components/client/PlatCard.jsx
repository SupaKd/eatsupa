import { useDispatch } from 'react-redux';
import { addToCart } from '@store/slices/cartSlice';

function PlatCard({ plat, restaurantId, restaurantName, restaurantOuvert = true }) {
  const dispatch = useDispatch();

  const { id, nom, description, prix, image_url, disponible, allergenes } = plat;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleAddToCart = () => {
    // Vérifier que le restaurant est ouvert ET le plat disponible
    if (!disponible || !restaurantOuvert) return;
    dispatch(addToCart({ plat, restaurantId, restaurantName }));
  };

  // Parser les allergènes si c'est une string
  const allergenesArray = typeof allergenes === 'string' 
    ? JSON.parse(allergenes) 
    : allergenes;

  // Déterminer si la carte doit être désactivée
  const isUnavailable = !disponible || !restaurantOuvert;

  // Déterminer le texte du bouton
  const getButtonText = () => {
    if (!restaurantOuvert) return 'Fermé';
    if (!disponible) return 'Indisponible';
    return 'Ajouter';
  };

  return (
    <div className={`plat-card ${isUnavailable ? 'plat-card--unavailable' : ''}`}>
      {/* Image */}
      {image_url && (
        <div className="plat-card__image-wrapper">
          <img 
            src={image_url} 
            alt={nom} 
            className="plat-card__image"
            loading="lazy"
          />
          {isUnavailable && (
            <div className="plat-card__unavailable-badge">
              {!restaurantOuvert ? 'Restaurant fermé' : 'Indisponible'}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="plat-card__content">
        <div className="plat-card__info">
          <h4 className="plat-card__name">{nom}</h4>
          {description && (
            <p className="plat-card__description">{description}</p>
          )}
          {allergenesArray && allergenesArray.length > 0 && (
            <div className="plat-card__allergenes">
              <span className="plat-card__allergenes-label">Allergènes:</span>
              {allergenesArray.map((allergene, index) => (
                <span key={index} className="plat-card__allergene">{allergene}</span>
              ))}
            </div>
          )}
        </div>

        <div className="plat-card__footer">
          <span className="plat-card__price">{formatPrice(prix)}</span>
          <button 
            className="plat-card__add-btn"
            onClick={handleAddToCart}
            disabled={isUnavailable}
            title={!restaurantOuvert ? 'Le restaurant est actuellement fermé' : !disponible ? 'Ce plat n\'est pas disponible' : 'Ajouter au panier'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlatCard;