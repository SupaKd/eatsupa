import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { ToastProvider, TOAST_POSITIONS } from '@/contexts/ToastContext'
import ToastContainer from '@components/Toast'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider position={TOAST_POSITIONS.TOP_RIGHT} maxToasts={5}>
          <App />
          <ToastContainer />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)