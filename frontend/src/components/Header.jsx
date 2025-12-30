import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@store/slices/authSlice";
import { selectCartItemsCount } from "@store/slices/cartSlice";
import {
  User,
  ShoppingCart,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";

function Header({ onCartClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
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
            <ShoppingCart size={24} />
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
                  {user?.prenom?.charAt(0)}
                  {user?.nom?.charAt(0)}
                </span>
                <span className="header__user-name">{user?.prenom}</span>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className="header__user-menu">
                  <div className="header__user-menu-header">
                    <p className="header__user-menu-name">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="header__user-menu-email">{user?.email}</p>
                  </div>
                  <div className="header__user-menu-divider"></div>
                  <Link
                    to="/profil"
                    className="header__user-menu-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <UserCircle size={18} />
                    Mon profil
                  </Link>

                  <Link
                    to="/mes-commandes"
                    className="header__user-menu-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FileText size={18} />
                    Mes commandes
                  </Link>

                  {user?.role === "restaurateur" && (
                    <Link
                      to="/dashboard"
                      className="header__user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="header__user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={18} />
                      Administration
                    </Link>
                  )}
                  <div className="header__user-menu-divider"></div>
                  <button
                    className="header__user-menu-item header__user-menu-item--danger"
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
                <User size={25} />
              </Link>{" "}
              <Link to="/register" className="header__auth-btn">
                S'inscrire
              </Link>
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
