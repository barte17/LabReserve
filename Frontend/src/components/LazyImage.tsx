import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string | null;
  alt: string;
  placeholder: React.ReactNode;
  className?: string;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className = "",
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Załaduj obraz 50px przed wejściem w viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Skeleton loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 to-gray-200/20 animate-pulse border border-gray-200/40" />
      )}

      {/* Placeholder gdy nie ma zdjęcia lub błąd */}
      {(!src || hasError) && (
        <div className="absolute inset-0">
          {placeholder}
        </div>
      )}

      {/* Rzeczywisty obraz */}
      {src && isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            imageRendering: '-webkit-optimize-contrast',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitImageRendering: '-webkit-optimize-contrast',
            msInterpolationMode: 'bicubic'
          } as React.CSSProperties}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}
    </div>
  );
};