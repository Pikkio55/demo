import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Assistants from './pages/Assistants';
import Appointments from './pages/Appointments';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            <h1>📞 Telnyx Campaigns</h1>
          </div>
          <div className="navbar-links">
            <Link to="/">Dashboard</Link>
            <Link to="/leads">Leads</Link>
            <Link to="/campaigns">Campagne</Link>
            <Link to="/assistants">Assistenti AI</Link>
            <Link to="/appointments">Appuntamenti</Link>
          </div>
        </nav>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/assistants" element={<Assistants />} />
            <Route path="/appointments" element={<Appointments />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
