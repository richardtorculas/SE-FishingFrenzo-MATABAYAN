import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData, { withCredentials: true });
      login(response.data.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-card w-full max-w-md overflow-hidden border border-gray-200"
      >
        {/* Card header */}
        <div className="px-8 pt-8 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-1">
            <img src="/logo.png" alt="MataBayan" className="h-8 w-auto" />
            <span className="text-lg font-bold text-ink tracking-tight">MataBayan</span>
          </div>
          <p className="text-sm text-subtle">Disaster Alert & Preparedness System</p>
        </div>

        {/* Card body */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-bold text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-subtle mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="juan@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl text-sm">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-subtle mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-ink font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
