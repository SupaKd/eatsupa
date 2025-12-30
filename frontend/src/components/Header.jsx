import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@store/slices/authSlice';
import { selectCartItemsCount } from '@store/slices/cartSlice';

function Header({ onCartClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <span className="header__logo-text">Yumioo</span>
        </Link>

       

        {/* Actions */}
        <div className="header__actions">
          {/* Panier */}
          <button className="header__cart" onClick={onCartClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemsCount > 0 && (
              <span className="header__cart-badge">{cartItemsCount}</span>
            )}
          </button>

          {/* Utilisateur */}
          {isAuthenticated ? (
            <div className="header__user">
              <button 
                className="header__user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="header__user-avatar">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </span>
                <span className="header__user-name">{user?.prenom}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {userMenuOpen && (
                <div className="header__user-menu">
                  <div className="header__user-menu-header">
                    <p className="header__user-menu-name">{user?.prenom} {user?.nom}</p>
                    <p className="header__user-menu-email">{user?.email}</p>
                  </div>
                  <div className="header__user-menu-divider"></div>
                  <Link 
                    to="/profil" 
                    className="header__user-menu-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Mon profil
                  </Link>
                  <Link 
                    to="/mes-commandes" 
                    className="header__user-menu-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Mes commandes
                  </Link>
                  {user?.role === 'restaurateur' && (
                    <Link 
                      to="/dashboard" 
                      className="header__user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="header__user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Administration
                    </Link>
                  )}
                  <div className="header__user-menu-divider"></div>
                  <button 
                    className="header__user-menu-item header__user-menu-item--danger"
                    onClick={handleLogout}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header__auth">
              <Link to="/login" className="header__auth-link">Connexion</Link>
              <Link to="/register" className="header__auth-btn">S'inscrire</Link>
            </div>
          )}

          
        </div>
      </div>

      {/* Overlay pour fermer les menus */}
      {(userMenuOpen || menuOpen) && (
        <div 
          className="header__overlay" 
          onClick={() => {
            setUserMenuOpen(false);
            setMenuOpen(false);
          }}
        ></div>
      )}
    </header>
  );
}

export default Header;