import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card = ({ children, className = '', style }: CardProps) => {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
};
