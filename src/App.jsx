import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import ProtectedRoute from './components/ProtectedRoute'; 
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Support from './pages/Support';
import Budgets from './pages/Budgets';
// IMPORTATION DES NOTIFICATIONS
import Notifications from './pages/Notifications';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <LandingPage />} />
        <Route path="/Login" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <Login />} />
        <Route path="/Register" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <Register />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/Transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/Categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/Support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/Budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
        
        {/* NOUVELLE ROUTE DES NOTIFICATIONS */}
        <Route path="/Notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;