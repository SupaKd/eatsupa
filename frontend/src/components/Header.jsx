// src/components/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { selectCartItemsCount, selectCartTotal } from '@/store/slices/cartSlice';
import { formatPrice } from '@/utils';
import CartSidebar from './client/CartSidebar';
import {
  Menu,
  X,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Settings,
  ClipboardList,
  Home,
  Store,
  UserPlus,
  LogIn,
} from 'lucide-react';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const cartTotal = useSelector(selectCartTotal);
  
  // Local state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Refs
  const userMenuRef = useRef(null);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Détecter le scroll pour ajouter un style au header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu utilisateur au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  // Déterminer le lien du dashboard selon le rôle
  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'restaurateur') return '/dashboard';
    return '/profil';
  };

  const getDashboardLabel = () => {
    if (user?.role === 'admin') return 'Administration';
    if (user?.role === 'restaurateur') return 'Mon restaurant';
    return 'Mon compte';
  };

  // Ne pas afficher le header sur certaines pages (dashboard, admin)
  const isAdminPage = location.pathname.startsWith('/admin');
  const isDashboardPage = location.pathname.startsWith('/dashboard');
  
  if (isAdminPage || isDashboardPage) {
    return null;
  }

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header__container">
          {/* Logo */}
          <Link to="/" className="header__logo">
            <span className="header__logo-text">Yumioo</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="header__nav">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
              }
            >
              Restaurants
            </NavLink>
            <NavLink 
              to="/devenir-restaurateur" 
              className={({ isActive }) => 
                `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
              }
            >
              Devenir partenaire
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="header__actions">
            {/* Panier */}
            <button 
              className="header__cart-btn"
              onClick={toggleCart}
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag size={22} strokeWidth={2} />
              {cartItemsCount > 0 && (
                <span className="header__cart-badge">{cartItemsCount}</span>
              )}
            </button>

            {/* Utilisateur */}
            {isAuthenticated ? (
              <div className="header__user" ref={userMenuRef}>
                <button 
                  className="header__user-btn"
                  onClick={toggleUserMenu}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="header__user-avatar">
                    {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                  </div>
                  <span className="header__user-name">{user?.prenom}</span>
                  <ChevronDown 
                    size={16} 
                    className={`header__user-chevron ${userMenuOpen ? 'header__user-chevron--open' : ''}`}
                  />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="header__dropdown">
                    <div className="header__dropdown-header">
                      <span className="header__dropdown-name">
                        {user?.prenom} {user?.nom}
                      </span>
                      <span className="header__dropdown-email">{user?.email}</span>
                      <span className={`header__dropdown-role header__dropdown-role--${user?.role}`}>
                        {user?.role === 'admin' ? 'Administrateur' : 
                         user?.role === 'restaurateur' ? 'Restaurateur' : 'Client'}
                      </span>
                    </div>

                    <div className="header__dropdown-divider" />

                    <Link 
                      to={getDashboardLink()} 
                      className="header__dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      {getDashboardLabel()}
                    </Link>

                    <Link 
                      to="/mes-commandes" 
                      className="header__dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ClipboardList size={18} />
                      Mes commandes
                    </Link>

                    <Link 
                      to="/profil" 
                      className="header__dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={18} />
                      Paramètres
                    </Link>

                    <div className="header__dropdown-divider" />

                    <button 
                      className="header__dropdown-item header__dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header__auth">
                <Link to="/login" className="header__auth-link">
                  Connexion
                </Link>
                <Link to="/register" className="header__auth-btn">
                  Inscription
                </Link>
              </div>
            )}

            {/* Bouton menu mobile */}
            <button 
              className="header__mobile-toggle"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <div className={`header__mobile-menu ${mobileMenuOpen ? 'header__mobile-menu--open' : ''}`}>
          <nav className="header__mobile-nav">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `header__mobile-link ${isActive ? 'header__mobile-link--active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={20} />
              Restaurants
            </NavLink>

            <NavLink 
              to="/devenir-restaurateur" 
              className={({ isActive }) => 
                `header__mobile-link ${isActive ? 'header__mobile-link--active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <Store size={20} />
              Devenir partenaire
            </NavLink>

            {isAuthenticated && (
              <>
                <div className="header__mobile-divider" />
                
                <Link 
                  to={getDashboardLink()}
                  className="header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={20} />
                  {getDashboardLabel()}
                </Link>

                <Link 
                  to="/mes-commandes"
                  className="header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ClipboardList size={20} />
                  Mes commandes
                </Link>

                <Link 
                  to="/profil"
                  className="header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  Mon profil
                </Link>
              </>
            )}
          </nav>

          {/* Auth section mobile */}
          <div className="header__mobile-footer">
            {isAuthenticated ? (
              <div className="header__mobile-user">
                <div className="header__mobile-user-info">
                  <div className="header__mobile-user-avatar">
                    {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                  </div>
                  <div>
                    <span className="header__mobile-user-name">
                      {user?.prenom} {user?.nom}
                    </span>
                    <span className="header__mobile-user-email">{user?.email}</span>
                  </div>
                </div>
                <button 
                  className="header__mobile-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="header__mobile-auth">
                <Link 
                  to="/login" 
                  className="header__mobile-auth-btn header__mobile-auth-btn--secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={20} />
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="header__mobile-auth-btn header__mobile-auth-btn--primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus size={20} />
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Overlay mobile */}
        {mobileMenuOpen && (
          <div 
            className="header__mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Spacer pour compenser le header fixed */}
      <div className="header-spacer" />
    </>
  );
}

export default Header;