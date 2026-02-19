import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, MapPin, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validation';
import { provinces, citiesByProvince } from '../../utils/phLocations';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    province: '',
    cityMunicipality: '',
    language: 'en',
    alertTypes: { typhoon: true, earthquake: true, volcano: true, flood: true }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = validatePassword(formData.password);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email';
    if (passwordStrength.score < 3) newErrors.password = 'Password too weak';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.province) newErrors.province = 'Province required';
    if (!formData.cityMunicipality) newErrors.cityMunicipality = 'City required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        preferences: {
          province: formData.province,
          cityMunicipality: formData.cityMunicipality,
          language: formData.language,
          alertTypes: formData.alertTypes
        }
      }, { withCredentials: true });
      login(response.data.data.user);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength.score < 2) return 'bg-red-500';
    if (passwordStrength.score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">MataBayan</h1>
          <p className="text-blue-100 text-sm">Disaster Alert System</p>
        </div>

        <div className="p-8">
          <div className="flex justify-between mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Account</span>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Location</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none" placeholder="Juan Dela Cruz" />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none" placeholder="juan@example.com" />
                      {formData.email && validateEmail(formData.email) && <CheckCircle2 className="absolute right-3 top-3 text-green-500" size={20} />}
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none" placeholder="••••••••" />
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[...Array(5)].map((_, i) => <div key={i} className={`h-1 flex-1 rounded ${i < passwordStrength.score ? getStrengthColor() : 'bg-gray-200'}`} />)}
                        </div>
                        {passwordStrength.feedback.length > 0 && <p className="text-xs text-gray-600">Need: {passwordStrength.feedback.join(', ')}</p>}
                      </div>
                    )}
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none" placeholder="••••••••" />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <button onClick={handleNext} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    Continue <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Province</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                      <select value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value, cityMunicipality: '' })} className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none">
                        <option value="">Select Province</option>
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City/Municipality</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                      <select value={formData.cityMunicipality} onChange={(e) => setFormData({ ...formData, cityMunicipality: e.target.value })} className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none" disabled={!formData.province}>
                        <option value="">Select City</option>
                        {formData.province && citiesByProvince[formData.province]?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {errors.cityMunicipality && <p className="text-red-500 text-xs mt-1">{errors.cityMunicipality}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" value="en" checked={formData.language === 'en'} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-4 h-4" />
                        <span className="text-sm">English</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" value="fil" checked={formData.language === 'fil'} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-4 h-4" />
                        <span className="text-sm">Filipino</span>
                      </label>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
                      <AlertCircle size={20} />
                      <span className="text-sm">{errors.submit}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                      <ChevronLeft size={20} /> Back
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                      {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
