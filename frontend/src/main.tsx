import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css';
import { BrowserRouter } from 'react-router-dom'
import { ThirdwebProvider } from "thirdweb/react";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThirdwebProvider>

  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  </ThirdwebProvider>
)
