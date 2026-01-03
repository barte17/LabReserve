import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Zdjecie {
  id: number;
  url: string;
}

interface ImageLightboxProps {
  zdjecia: Zdjecie[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  altText?: string;
}

export default function ImageLightbox({
  zdjecia,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  altText = "Zdjęcie"
}: ImageLightboxProps) {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && zdjecia.length > 1) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && zdjecia.length > 1) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, onNext, onPrevious, zdjecia.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentImage = zdjecia[currentIndex];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
        aria-label="Zamknij"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image counter */}
      {zdjecia.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-50">
          {currentIndex + 1} / {zdjecia.length}
        </div>
      )}

      {/* Main image container */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4 pt-20"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={`${altText} ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          style={{
            imageRendering: '-webkit-optimize-contrast',
            WebkitImageRendering: '-webkit-optimize-contrast',
            msInterpolationMode: 'bicubic'
          } as React.CSSProperties}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNmEyIDIgMCAwMC0yLTJINmEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiBzdHJva2U9IiM5Q0E3QjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
          }}
        />

        {/* Navigation arrows */}
        {zdjecia.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full transition-all duration-200 hover:scale-110 shadow-xl"
              aria-label="Poprzednie zdjęcie"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full transition-all duration-200 hover:scale-110 shadow-xl"
              aria-label="Następne zdjęcie"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip (optional, for multiple images) */}
      {zdjecia.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/60 backdrop-blur-sm p-2 rounded-lg max-w-full overflow-x-auto">
          {zdjecia.map((zdjecie, index) => (
            <button
              key={zdjecie.id}
              onClick={(e) => {
                e.stopPropagation();
                // We'll need to add a callback for this
                const event = new CustomEvent('lightbox-goto', { detail: index });
                window.dispatchEvent(event);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all duration-200 ${index === currentIndex
                  ? 'ring-2 ring-red-500 scale-110'
                  : 'opacity-60 hover:opacity-100'
                }`}
            >
              <img
                src={zdjecie.url}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
