// src/components/RestaurantLayout.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Menu as MenuIcon, 
  Home, 
  CreditCard, 
  X, 
  User, 
  LogOut,
  MenuSquare
} from 'lucide-react';

function RestaurantLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const menuItems = [
    {
      label: 'Tableau de bord',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: 'Commandes',
      path: '/dashboard/commandes',
      icon: <ShoppingBag size={20} />,
    },
    {
      label: 'Menu',
      path: '/dashboard/menu',
      icon: <MenuIcon size={20} />,
    },
    {
      label: 'Restaurant',
      path: '/dashboard/restaurant',
      icon: <Home size={20} />,
    },
    {
      label: 'Paiement',
      path: '/dashboard/paiement',
      icon: <CreditCard size={20} />,
    },
  ];

  return (
    <div className="restaurant-layout">
      {/* Sidebar */}
      <aside className={`restaurant-sidebar ${sidebarOpen ? 'restaurant-sidebar--open' : ''}`}>
        <div className="restaurant-sidebar__header">
          <NavLink to="/" className="restaurant-sidebar__logo">
            <span className="restaurant-sidebar__logo-text">Yumioo</span>
          </NavLink>
          <button
            className="restaurant-sidebar__close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="restaurant-sidebar__user">
          <div className="restaurant-sidebar__user-avatar">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
          <div className="restaurant-sidebar__user-info">
            <div className="restaurant-sidebar__user-name">
              {user?.prenom} {user?.nom}
            </div>
            <div className="restaurant-sidebar__user-role">Restaurateur</div>
          </div>
        </div>

        <nav className="restaurant-sidebar__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `restaurant-sidebar__nav-item ${isActive ? 'restaurant-sidebar__nav-item--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="restaurant-sidebar__footer">
          <NavLink to="/dashboard/profil" className="restaurant-sidebar__footer-item">
            <User size={18} />
            <span>Mon profil</span>
          </NavLink>
          <button onClick={handleLogout} className="restaurant-sidebar__footer-item">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="restaurant-main">
        <header className="rest-header">
          <button
            className="restaurant-header__burger"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuSquare size={24} />
          </button>

          <div className="restaurant-header__title">Espace Restaurateur</div>
        </header>

        <main className="restaurant-content">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="restaurant-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default RestaurantLayout;