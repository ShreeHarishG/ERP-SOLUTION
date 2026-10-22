import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 ${onClick ? 'cursor-pointer hover:shadow-card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
