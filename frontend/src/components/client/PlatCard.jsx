// src/components/client/PlatCard.jsx - Version corrigée
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { Plus } from 'lucide-react';
import { getImageUrl } from '@/services/imageUtils';
import { formatPrice } from '@/utils';

function PlatCard({ plat, restaurantId, restaurantName, restaurantOuvert = true }) {
  const dispatch = useDispatch();

  const { id, nom, description, prix, image_url, disponible, allergenes } = plat;

  const imageSource = getImageUrl(image_url);

  const handleAddToCart = () => {
    if (!disponible || !restaurantOuvert) return;
    dispatch(addToCart({ plat, restaurantId, restaurantName }));
  };

  // Parser les allergènes si c'est une string
  const allergenesArray = typeof allergenes === 'string' 
    ? JSON.parse(allergenes) 
    : allergenes;

  const isUnavailable = !disponible || !restaurantOuvert;

  const getButtonText = () => {
    if (!restaurantOuvert) return 'Fermé';
    if (!disponible) return 'Indisponible';
    return 'Ajouter';
  };

  return (
    <div className={`plat-card ${isUnavailable ? 'plat-card--unavailable' : ''}`}>
      {/* Image */}
      {imageSource && (
        <div className="plat-card__image-wrapper">
          <img 
            src={imageSource} 
            alt={nom} 
            className="plat-card__image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
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
          {allergenesArray?.length > 0 && (
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
            <Plus size={18} strokeWidth={2} />
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlatCard;