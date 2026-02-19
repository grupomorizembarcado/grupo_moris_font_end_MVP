import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from "./pages/Login";
// import Header from './components/Header';
// import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import Galpoes from './pages/Galpoes';
import Silos from './pages/Silos';
import Alertas from './pages/Alertas';
import Relatorios from './pages/Relatorios';
import PrivateRoutes from "./components/PrivateRoutes";
import Monitor from './pages/Monitor';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pública */}
        <Route path="/" element={<Login />} />
        <Route path="/monitor" element={<Monitor />} />
        {/* Rotas privadas */}
        <Route
          path="/*"
          element={
            <PrivateRoutes>
              <Routes>
                {/* <Route path="/" element={<Dashboard />} /> */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/galpoes" element={<Galpoes />} />
                <Route path="/silos" element={<Silos />} />
                <Route path="/alertas" element={<Alertas />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>

            </PrivateRoutes>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;