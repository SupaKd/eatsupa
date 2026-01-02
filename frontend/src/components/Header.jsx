// src/components/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingCart, Instagram } from "lucide-react";
import { selectCartItemsCount } from "@/store/slices/cartSlice";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // ✅ Utiliser le sélecteur Redux correct
  const itemCount = useSelector(selectCartItemsCount) || 0;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <img src="/images/logonoel.png" alt="logo" />
        </Link>

        {/* Actions */}
        <div className="navbar__actions">
          <div className="navbar__right">
            <a
              href="https://www.instagram.com/restaurantlesabai/?hl=fr"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__instagram"
            >
              <Instagram size={24} />
            </a>

            <Link to="/commander" className="navbar__cart-link">
              <ShoppingCart size={24} className="navbar__cart-icon" />
              {itemCount > 0 && (
                <span className="navbar__cart-badge">{itemCount}</span>
              )}
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="navbar__overlay" onClick={closeMenu}></div>
        )}
      </div>
    </nav>
  );
}

export default Header;