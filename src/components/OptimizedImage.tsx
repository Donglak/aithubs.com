import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width,
  height,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  onError,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [srcLoaded, setSrcLoaded] = useState(placeholder);

  const handleLoad = () => {
    setIsLoaded(true);
    setSrcLoaded(src);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    const target = e.target as HTMLImageElement;
    target.src = 'https://ui-avatars.com/api/?name=Image&background=6366f1&color=fff';
    if (onError) onError(e);
  };

  // For priority images (above the fold), load immediately
  if (priority) {
    loading = 'eager';
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse"
          aria-hidden="true"
        />
      )}
      {!isLoaded && !hasError && placeholder && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}
      <img
        src={srcLoaded}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        className={`
          transition-all duration-500 ease-out
          ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
          ${hasError ? 'grayscale' : ''}
        `}
        onLoad={handleLoad}
        onError={handleError}
        style={
          width || height
            ? {
                width: width ? `${width}px` : 'auto',
                height: height ? `${height}px` : 'auto',
              }
            : undefined
        }
      />
    </div>
  );
}