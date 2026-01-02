// src/components/client/CartSidebar.jsx
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { 
  selectCartItems, 
  selectCartTotal, 
  selectCartItemsCount,
  removeFromCart,
  updateQuantity,
  clearCart 
} from "@/store/slices/cartSlice";

const CartSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  
  // ✅ Utiliser les sélecteurs Redux
  const items = useSelector(selectCartItems) || [];
  const total = useSelector(selectCartTotal) || 0;
  const itemCount = useSelector(selectCartItemsCount) || 0;

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ platId: productId, quantity: newQuantity }));
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="cart-sidebar-overlay" 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 998,
        }}
      />
      
      {/* Sidebar */}
      <div 
        className="cart-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '400px',
          height: '100vh',
          backgroundColor: '#fff',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Header */}
        <div 
          className="cart-sidebar__header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #eee',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} />
            Mon panier ({itemCount})
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenu */}
        <div 
          className="cart-sidebar__content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.5rem',
          }}
        >
          {items.length === 0 ? (
            <div 
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#666',
              }}
            >
              <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => {
                if (!item) return null;
                
                const price = parseFloat(item.prix) || 0;
                const quantity = parseInt(item.quantite) || 0;
                
                return (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                    }}
                  >
                    {/* Image */}
                    {item.image_url && (
                      <img 
                        src={item.image_url}
                        alt={item.nom}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                        }}
                      />
                    )}
                    
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
                        {item.nom}
                      </h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                        {price.toFixed(2)} €
                      </p>
                      
                      {/* Contrôles quantité */}
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        <button
                          onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          {quantity <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        
                        <span style={{ fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        
                        <button
                          onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Sous-total */}
                    <div style={{ fontWeight: 700, color: '#222' }}>
                      {(price * quantity).toFixed(2)} €
                    </div>
                  </div>
                );
              })}
              
              {/* Bouton vider le panier */}
              {items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  <Trash2 size={16} />
                  Vider le panier
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div 
            className="cart-sidebar__footer"
            style={{
              padding: '1.5rem',
              borderTop: '1px solid #eee',
              backgroundColor: '#fff',
            }}
          >
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            >
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            
            <Link
              to="/commander"
              onClick={onClose}
              style={{
                display: 'block',
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                color: '#fff',
                textAlign: 'center',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              Commander
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;