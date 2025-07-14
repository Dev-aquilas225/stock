import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: LucideIcon;
  required?: boolean;
  disabled?: boolean;
  step?: string; // Added step prop for number inputs
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  step,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}

        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          step={step} // Pass step prop to input element
          className={`
            w-full px-4 py-3 rounded-lg border transition-all duration-200
            ${Icon ? 'pl-12' : ''}
            ${type === 'password' ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-nexsaas-light-gray focus:ring-nexsaas-saas-green'}
            ${isFocused ? 'ring-2' : ''}
            bg-nexsaas-pure-white dark:bg-gray-800
            text-nexsaas-deep-blue dark:text-nexsaas-pure-white
            placeholder-gray-400
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;