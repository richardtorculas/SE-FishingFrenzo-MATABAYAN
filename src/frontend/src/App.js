import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import EarthquakeDashboard from './pages/EarthquakeDashboard';
import TyphoonDashboard from './pages/TyphoonDashboard';
import WeatherDashboard from './pages/WeatherDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-muted">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/earthquakes" element={<EarthquakeDashboard />} />
            <Route path="/typhoons" element={<TyphoonDashboard />} />
            <Route path="/weather" element={<ProtectedRoute><WeatherDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
