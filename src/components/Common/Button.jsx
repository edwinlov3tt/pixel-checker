import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', icon, className = '', disabled = false }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-red hover:bg-brand-red-dark text-white';
      case 'secondary':
        return 'bg-white/10 hover:bg-white/20 text-gray-300';
      case 'ghost':
        return 'bg-transparent hover:bg-white/10 text-gray-400';
      default:
        return '';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;