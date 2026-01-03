import { useState, useEffect } from 'react';
import ImageLightbox from './ImageLightbox';

interface Zdjecie {
  id: number;
  url: string;
}

interface ImageGalleryProps {
  zdjecia: Zdjecie[];
  altText?: string;
}

export default function ImageGallery({ zdjecia, altText = "Zdjęcie" }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!zdjecia || zdjecia.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-100/30 to-gray-200/30 rounded-xl flex items-center justify-center aspect-video border border-gray-200/50">
        <div className="text-center">
          <img
            src="/placeholder-image.png"
            alt="Brak zdjęć"
            className="mx-auto h-16 w-16 opacity-40 mb-4"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              WebkitImageRendering: '-webkit-optimize-contrast',
              msInterpolationMode: 'bicubic'
            } as React.CSSProperties}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <svg className="mx-auto h-16 w-16 text-gray-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-600">Brak zdjęć</p>
          <p className="mt-1 text-sm text-gray-400">Zdjęcia będą dostępne wkrótce</p>
        </div>
      </div>
    );
  }

  const currentImage = zdjecia[currentImageIndex];

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? zdjecia.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === zdjecia.length - 1 ? 0 : prev + 1
    );
  };


  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Lightbox handlers
  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Keyboard navigation
  useEffect(() => {
    // Don't handle keyboard if lightbox is open (it has its own handler)
    if (isLightboxOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (zdjecia.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [zdjecia.length, currentImageIndex, isLightboxOpen]);

  // Listen for thumbnail clicks from lightbox
  useEffect(() => {
    const handleLightboxGoto = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCurrentImageIndex(customEvent.detail);
    };

    window.addEventListener('lightbox-goto', handleLightboxGoto);
    return () => window.removeEventListener('lightbox-goto', handleLightboxGoto);
  }, []);

  return (
    <>
      <div className="w-full pt-0">
        <div
          className="relative w-full bg-gradient-to-br from-gray-100/20 to-gray-200/20 rounded-xl overflow-hidden shadow-lg group aspect-video border border-gray-200/40 cursor-pointer"
          onClick={openLightbox}
        >
          {/* Blurred background - same image */}
          <img
            src={currentImage.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
            aria-hidden="true"
          />

          {/* Main image on top */}
          <img
            src={currentImage.url}
            alt={`${altText} ${currentImageIndex + 1}`}
            className="relative w-full h-full object-contain transition-all duration-500 ease-out z-10"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitImageRendering: '-webkit-optimize-contrast',
              msInterpolationMode: 'bicubic'
            } as React.CSSProperties}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNmEyIDIgMCAwMC0yLTJINmEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiBzdHJva2U9IiM5Q0E3QjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
            }}
          />

          {/* Click to expand icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none z-20">
            <svg className="w-16 h-16 text-white drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>

          {/* Gradient Overlays for better button visibility */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Navigation Arrows - Enhanced Design */}
          {zdjecia.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg z-30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg z-30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {zdjecia.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {zdjecia.length}
            </div>
          )}

          {/* Dots */}
          {zdjecia.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
              {zdjecia.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                    ? 'bg-white scale-125 shadow-lg'
                    : 'bg-white/50 hover:bg-white/80 hover:scale-110'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        zdjecia={zdjecia}
        currentIndex={currentImageIndex}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        onNext={goToNext}
        onPrevious={goToPrevious}
        altText={altText}
      />
    </>
  );
}