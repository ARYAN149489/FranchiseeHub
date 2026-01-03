import React from 'react';

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  required = false,
  disabled = false,
  placeholder = '',
  className = '',
  rows,
  minLength
}) {
  const isTextarea = type === 'textarea';
  
  const inputClasses = `
    w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 
    border border-gray-300 rounded-lg 
    focus:ring-2 focus:ring-indigo-500 focus:outline-none
    ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && !isTextarea && (
          <Icon 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
            size={20} 
          />
        )}
        {isTextarea ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows || 3}
            className={inputClasses}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            minLength={minLength}
            className={inputClasses}
          />
        )}
      </div>
    </div>
  );
}
