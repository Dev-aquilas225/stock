import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2 } : {}}
      className={`
        bg-nexsaas-pure-white dark:bg-gray-800 
        rounded-xl shadow-sm border border-nexsaas-light-gray dark:border-gray-700
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-md transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;