import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', className = '', message }) => {
  let spinnerSizeClasses = 'h-8 w-8'; // Default for medium
  let messageSizeClass = 'text-sm';

  switch (size) {
    case 'small':
      spinnerSizeClasses = 'h-5 w-5';
      messageSizeClass = 'text-xs';
      break;
    case 'large':
      spinnerSizeClasses = 'h-12 w-12';
      messageSizeClass = 'text-base';
      break;
  }

  // Ensure you have the 'spin' animation defined in your tailwind.config.js or global CSS.
  // Tailwind CSS includes a basic spin animation by default with the `animate-spin` class.
  // For the border-t-transparent effect, ensure your primary color is set up.

  return (
    <div 
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <div 
        className={`animate-spin rounded-full ${spinnerSizeClasses} border-4 border-primary border-t-transparent`}
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && <p className={`mt-3 ${messageSizeClass} text-muted-foreground`}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

 