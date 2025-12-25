import { Routes, Route } from 'react-router-dom';
import './styles/main.scss';
// Pages
import HomePage from '@pages/HomePage';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Ajouter d'autres routes ici */}
      </Routes>
    </div>
  );
}

export default App;