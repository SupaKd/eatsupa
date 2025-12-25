import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartRestaurant,
  selectCartTotal,
  selectIsCartEmpty,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} from '@store/slices/cartSlice';

function CartSidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const restaurant = useSelector(selectCartRestaurant);
  const total = useSelector(selectCartTotal);
  const isEmpty = useSelector(selectIsCartEmpty);

  const handleCheckout = () => {
    onClose();
    navigate('/commander');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`cart-overlay ${isOpen ? 'cart-overlay--open' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`cart-sidebar ${isOpen ? 'cart-sidebar--open' : ''}`}>
        {/* Header */}
        <div className="cart-sidebar__header">
          <h2 className="cart-sidebar__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Mon panier
          </h2>
          <button className="cart-sidebar__close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="cart-sidebar__content">
          {isEmpty ? (
            <div className="cart-sidebar__empty">
              <div className="cart-sidebar__empty-icon">🛒</div>
              <p className="cart-sidebar__empty-text">Votre panier est vide</p>
              <p className="cart-sidebar__empty-subtext">
                Ajoutez des plats depuis un restaurant pour commencer votre commande
              </p>
            </div>
          ) : (
            <>
              {/* Restaurant info */}
              <div className="cart-sidebar__restaurant">
                <span className="cart-sidebar__restaurant-label">Restaurant</span>
                <span className="cart-sidebar__restaurant-name">{restaurant.name}</span>
              </div>

              {/* Items */}
              <div className="cart-sidebar__items">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item__info">
                      <h4 className="cart-item__name">{item.nom}</h4>
                      <p className="cart-item__price">{formatPrice(item.prix)}</p>
                    </div>
                    <div className="cart-item__actions">
                      <div className="cart-item__quantity">
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => dispatch(decrementQuantity(item.id))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <span className="cart-item__qty-value">{item.quantite}</span>
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => dispatch(incrementQuantity(item.id))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                      <button
                        className="cart-item__remove"
                        onClick={() => dispatch(removeFromCart(item.id))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="cart-item__subtotal">
                      {formatPrice(item.prix * item.quantite)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear cart button */}
              <button
                className="cart-sidebar__clear"
                onClick={() => dispatch(clearCart())}
              >
                Vider le panier
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__total">
              <span>Total</span>
              <span className="cart-sidebar__total-amount">{formatPrice(total)}</span>
            </div>
            <button
              className="cart-sidebar__checkout"
              onClick={handleCheckout}
            >
              Commander
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartSidebar;