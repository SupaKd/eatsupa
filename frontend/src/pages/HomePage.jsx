import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function HomePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="home-page">
      <div className="container">
        <h1>Bienvenue sur Restaurant App</h1>
        {isAuthenticated ? (
          <p>Connecté en tant que: {user?.nom} {user?.prenom}</p>
        ) : (
          <p>Veuillez vous connecter pour continuer</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;