import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useMinimumLoadingDelay } from '../../hooks/useMinimumLoadingDelay';

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  loadingText,
  disabled,
  className = '',
  type = 'button',
  onClick
}) => {
  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 100, // Krótki delay dla przycisków
    minimumDuration: 500 // Ale jeśli się już pokazał, trzymaj przez chwilę
  });
  
  const isDisabled = shouldShowLoading || disabled;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
        transition-opacity duration-200
        ${className}
      `}
    >
      {shouldShowLoading && (
        <LoadingSpinner 
          size="sm" 
          color="white" 
          className="mr-2" 
        />
      )}
      {shouldShowLoading && loadingText ? loadingText : children}
    </button>
  );
};

export default LoadingButton;