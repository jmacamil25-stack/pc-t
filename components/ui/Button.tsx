
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'gradient';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[#1E63FF] text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-white text-[#002B60] border border-gray-300 hover:bg-gray-100 focus:ring-blue-800',
    accent: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-red-200',
    gradient: 'bg-gradient-to-r from-[#1E63FF] to-blue-500 text-white hover:from-blue-600 hover:to-blue-400 focus:ring-blue-500 shadow-blue-200',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
