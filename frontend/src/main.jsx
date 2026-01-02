// src/main.jsx
// Point d'entrée de l'application - Configuration Redux uniquement

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

// Import des styles (à ajuster selon votre structure)
// import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ Provider Redux unique - gère tout l'état global */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)