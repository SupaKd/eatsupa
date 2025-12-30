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
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

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

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <>
      {/* Overlay */}
      <div className={`cart-overlay ${isOpen ? 'cart-overlay--open' : ''}`} onClick={onClose} />

      {/* Sidebar */}
      <aside className={`cart-sidebar ${isOpen ? 'cart-sidebar--open' : ''}`}>
        {/* Header */}
        <div className="cart-sidebar__header">
          <h2 className="cart-sidebar__title">
            <ShoppingCart size={24} strokeWidth={2} />
            Mon panier
          </h2>
          <button className="cart-sidebar__close" onClick={onClose}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-sidebar__content">
          {isEmpty ? (
            <div className="cart-sidebar__empty">
<div className="cart-sidebar__empty-icon">
  <ShoppingCart size={48} strokeWidth={2} />
</div>              <p className="cart-sidebar__empty-text">Votre panier est vide</p>
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
                          <Minus size={16} strokeWidth={2} />
                        </button>
                        <span className="cart-item__qty-value">{item.quantite}</span>
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => dispatch(incrementQuantity(item.id))}
                        >
                          <Plus size={16} strokeWidth={2} />
                        </button>
                      </div>
                      <button
                        className="cart-item__remove"
                        onClick={() => dispatch(removeFromCart(item.id))}
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                    <div className="cart-item__subtotal">{formatPrice(item.prix * item.quantite)}</div>
                  </div>
                ))}
              </div>

              {/* Clear cart button */}
              <button className="cart-sidebar__clear" onClick={() => dispatch(clearCart())}>
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
            <button className="cart-sidebar__checkout" onClick={handleCheckout}>
              Commander <ArrowRight size={20} strokeWidth={2} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartSidebar;
