import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, MapPin, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Phone, Bell } from 'lucide-react';
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
    phoneNumber: '',
    notificationPreferences: {
      smsEnabled: false,
      inAppEnabled: true
    },
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

  const validateStep3 = () => {
    const newErrors = {};
    if (formData.phoneNumber && !/^\+63\d{9,10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone format (e.g., +639123456789)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || null,
        preferences: {
          province: formData.province,
          cityMunicipality: formData.cityMunicipality,
          language: formData.language,
          alertTypes: formData.alertTypes
        },
        notificationPreferences: formData.notificationPreferences
      }, { withCredentials: true });
      login(response.data.data.user);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength.score < 2) return 'bg-red-400';
    if (passwordStrength.score < 4) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  const handleNotificationChange = (channel) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [channel]: !prev.notificationPreferences[channel]
      }
    }));
  };

  const FieldError = ({ msg }) => msg
    ? <p className="text-red-500 text-xs mt-1">{msg}</p>
    : null;

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
          <p className="text-sm text-subtle">Create your account</p>
        </div>

        {/* Card body */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-bold text-ink mb-1">Get started</h2>
          <p className="text-sm text-subtle mb-6">Fill in your details to create an account</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s ? 'bg-ink text-white' : 'bg-gray-100 text-gray-400'
                  }`}>{s}</div>
                  <span className={`text-xs font-medium transition-all hidden sm:inline ${step >= s ? 'text-ink' : 'text-gray-400'}`}>
                    {s === 1 ? 'Account' : s === 2 ? 'Location' : 'Notifications'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-1 h-px transition-all ${step >= s + 1 ? 'bg-ink' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field pl-10" placeholder="Juan Dela Cruz" />
                    </div>
                    <FieldError msg={errors.name} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field pl-10" placeholder="juan@example.com" />
                      {formData.email && validateEmail(formData.email) && <CheckCircle2 className="absolute right-3.5 top-3.5 text-emerald-400" size={16} />}
                    </div>
                    <FieldError msg={errors.email} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
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
                    <FieldError msg={errors.password} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-field pl-10" placeholder="••••••••" />
                    </div>
                    <FieldError msg={errors.confirmPassword} />
                  </div>

                  <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Province</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <select value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value, cityMunicipality: '' })} className="input-field pl-10 appearance-none">
                        <option value="">Select Province</option>
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <FieldError msg={errors.province} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City / Municipality</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <select value={formData.cityMunicipality} onChange={(e) => setFormData({ ...formData, cityMunicipality: e.target.value })} className="input-field pl-10 appearance-none" disabled={!formData.province}>
                        <option value="">Select City</option>
                        {formData.province && citiesByProvince[formData.province]?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <FieldError msg={errors.cityMunicipality} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Language</label>
                    <div className="flex gap-4">
                      {[{ val: 'en', label: 'English' }, { val: 'fil', label: 'Filipino' }].map(({ val, label }) => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" value={val} checked={formData.language === val} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-4 h-4 accent-gray-900" />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-1">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button type="button" onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      Continue <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
                      <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="input-field pl-10" placeholder="+639123456789" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Format: +639XXXXXXXXX</p>
                    <FieldError msg={errors.phoneNumber} />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Notification Channels</label>
                    <div className="space-y-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notificationPreferences.smsEnabled}
                          onChange={() => handleNotificationChange('smsEnabled')}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2.5 text-sm text-gray-700">SMS Notifications (Primary)</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notificationPreferences.inAppEnabled}
                          onChange={() => handleNotificationChange('inAppEnabled')}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2.5 text-sm text-gray-700">In-App Notifications</span>
                      </label>

                    </div>
                  </div>

                  {errors.submit && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl text-sm">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-1">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
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
