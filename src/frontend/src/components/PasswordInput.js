import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder = '••••••••', label, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <Lock className="absolute left-3.5 top-3.5 text-gray-300" size={16} />
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="input-field pl-10 pr-10"
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
