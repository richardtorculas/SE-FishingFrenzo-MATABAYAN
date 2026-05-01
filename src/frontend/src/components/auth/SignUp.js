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

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
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
    if (passwordStrength.score < 2) return 'bg-red-400';
    if (passwordStrength.score < 4) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-card w-full max-w-md overflow-hidden border border-gray-100"
      >
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <img src="/logo.png" alt="MataBayan" className="h-8 w-auto" />
            <span className="text-lg font-bold text-ink tracking-tight">MataBayan</span>
          </div>
          <p className="text-sm text-subtle mt-0.5">Create your account</p>
        </div>

        <div className="px-8 py-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s ? 'bg-ink text-white' : 'bg-gray-100 text-gray-400'
                  }`}>{s}</div>
                  <span className={`text-sm font-medium transition-all ${step >= s ? 'text-ink' : 'text-gray-400'}`}>
                    {s === 1 ? 'Account' : 'Location'}
                  </span>
                </div>
                {s < 2 && <div className={`flex-1 h-px transition-all ${step >= 2 ? 'bg-ink' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field pl-10" placeholder="Juan Dela Cruz" />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field pl-10" placeholder="juan@example.com" />
                      {formData.email && validateEmail(formData.email) && <CheckCircle2 className="absolute right-3.5 top-3.5 text-emerald-400" size={16} />}
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field pl-10" placeholder="••••••••" />
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < passwordStrength.score ? getStrengthColor() : 'bg-gray-100'}`} />
                          ))}
                        </div>
                        {passwordStrength.feedback.length > 0 && <p className="text-xs text-subtle">Need: {passwordStrength.feedback.join(', ')}</p>}
                      </div>
                    )}
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-field pl-10" placeholder="••••••••" />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Province</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <select value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value, cityMunicipality: '' })} className="input-field pl-10 appearance-none">
                        <option value="">Select Province</option>
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">City / Municipality</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <select value={formData.cityMunicipality} onChange={(e) => setFormData({ ...formData, cityMunicipality: e.target.value })} className="input-field pl-10 appearance-none" disabled={!formData.province}>
                        <option value="">Select City</option>
                        {formData.province && citiesByProvince[formData.province]?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {errors.cityMunicipality && <p className="text-red-500 text-xs mt-1">{errors.cityMunicipality}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Language</label>
                    <div className="flex gap-4">
                      {[{ val: 'en', label: 'English' }, { val: 'fil', label: 'Filipino' }].map(({ val, label }) => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" value={val} checked={formData.language === val} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-4 h-4 accent-gray-900" />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl text-sm">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1">
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-subtle mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-ink font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
