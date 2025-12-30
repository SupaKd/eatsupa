import { Link } from 'react-router-dom';
import { Clock, MapPin } from "lucide-react";

function RestaurantCard({ restaurant }) {
  const {
    id,
    nom,
    description,
    type_cuisine,
    ville,
    image,
    delai_preparation,
    est_ouvert,
    prochaine_ouverture,
  } = restaurant;

  // Image par défaut si pas d'image
  const imageUrl = image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';

  return (
    <Link to={`/restaurant/${id}`} className="restaurant-card">
      <div className="restaurant-card__image-wrapper">
        <img 
          src={imageUrl} 
          alt={nom} 
          className="restaurant-card__image"
          loading="lazy"
        />
        {/* Badge ouvert/fermé */}
        <div className={`restaurant-card__status ${est_ouvert ? 'restaurant-card__status--open' : 'restaurant-card__status--closed'}`}>
          {est_ouvert ? 'Ouvert' : 'Fermé'}
        </div>
        {/* Délai de préparation */}
        <div className="restaurant-card__time">
        <Clock size={14} strokeWidth={2} />

          {delai_preparation} min
        </div>
      </div>
      
      <div className="restaurant-card__content">
        <div className="restaurant-card__header">
          <h3 className="restaurant-card__name">{nom}</h3>
          {type_cuisine && (
            <span className="restaurant-card__cuisine">{type_cuisine}</span>
          )}
        </div>
        
        {description && (
          <p className="restaurant-card__description">{description}</p>
        )}
        
        <div className="restaurant-card__footer">
          <div className="restaurant-card__location">
          <MapPin size={14} strokeWidth={2} />

            {ville}
          </div>
          
          {!est_ouvert && prochaine_ouverture && (
            <div className="restaurant-card__next-open">
              Ouvre {prochaine_ouverture.estAujourdHui ? 'à' : prochaine_ouverture.estDemain ? 'demain à' : prochaine_ouverture.jourCapitalized + ' à'} {prochaine_ouverture.heure}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default RestaurantCard;