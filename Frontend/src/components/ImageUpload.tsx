import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
  isNew: true;
}

interface ExistingImage {
  id: number;
  url: string;
  isNew: false;
  markedForDeletion?: boolean;
}

type ImageItem = ImageFile | ExistingImage;

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  onExistingImagesChange?: (imagesToDelete: number[]) => void;
  existingImages?: { id: number; url: string }[];
  maxFiles?: number;
  maxSizeInMB?: number;
}

export default function ImageUpload({ 
  onFilesChange,
  onExistingImagesChange,
  existingImages = [],
  maxFiles = 10, 
  maxSizeInMB = 5 
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicjalizuj istniejące zdjęcia
  useEffect(() => {
    if (existingImages.length > 0) {
      const existingImageItems: ExistingImage[] = existingImages.map(img => ({
        id: img.id,
        url: img.url,
        isNew: false,
        markedForDeletion: false
      }));
      setImages(existingImageItems);
    }
  }, [existingImages]);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Nieprawidłowy typ pliku: ${file.name}. Dozwolone: JPG, PNG, WebP`;
    }
    if (file.size > maxSizeInBytes) {
      return `Plik ${file.name} jest za duży. Maksymalny rozmiar: ${maxSizeInMB}MB`;
    }
    return null;
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: File[] = [];
    const newImages: ImageFile[] = [];
    let errorMessages: string[] = [];

    // Policz aktualne aktywne zdjęcia (nie oznaczone do usunięcia)
    const activeImagesCount = images.filter(img => 
      img.isNew || (!img.isNew && !img.markedForDeletion)
    ).length;

    Array.from(fileList).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errorMessages.push(validationError);
        return;
      }

      if (activeImagesCount + newImages.length >= maxFiles) {
        errorMessages.push(`Maksymalna liczba plików: ${maxFiles}`);
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      newFiles.push(file);
      newImages.push({ file, preview, id, isNew: true });
    });

    if (errorMessages.length > 0) {
      setError(errorMessages.join(', '));
      setTimeout(() => setError(''), 5000);
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      
      // Notify parent tylko o nowych plikach
      const allNewFiles = updatedImages
        .filter((img): img is ImageFile => img.isNew)
        .map(img => img.file);
      onFilesChange(allNewFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string | number) => {
    const updatedImages = images.map(img => {
      if (img.isNew && img.id === id) {
        // Usuń nowe zdjęcie całkowicie
        URL.revokeObjectURL(img.preview);
        return null;
      } else if (!img.isNew && img.id === id) {
        // Oznacz istniejące zdjęcie do usunięcia
        return { ...img, markedForDeletion: !img.markedForDeletion };
      }
      return img;
    }).filter(Boolean) as ImageItem[];

    setImages(updatedImages);
    
    // Notify parent o nowych plikach
    const allNewFiles = updatedImages
      .filter((img): img is ImageFile => img.isNew)
      .map(img => img.file);
    onFilesChange(allNewFiles);
    
    // Notify parent o istniejących zdjęciach do usunięcia
    if (onExistingImagesChange) {
      const imagesToDelete = updatedImages
        .filter((img): img is ExistingImage => !img.isNew && img.markedForDeletion)
        .map(img => img.id);
      onExistingImagesChange(imagesToDelete);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="space-y-2">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Przeciągnij zdjęcia tutaj
            </p>
            <p className="text-sm text-gray-500">
              lub kliknij aby wybrać pliki
            </p>
          </div>
          <p className="text-xs text-gray-400">
            PNG, JPG, WebP do {maxSizeInMB}MB (max {maxFiles} plików)
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => {
            const isMarkedForDeletion = !image.isNew && image.markedForDeletion;
            const imageUrl = image.isNew ? image.preview : `http://localhost:3000${image.url}`;
            
            return (
              <div key={image.id} className="relative group">
                <div className={`aspect-square rounded-lg overflow-hidden bg-gray-100 transition-all ${
                  isMarkedForDeletion ? 'opacity-50 grayscale' : ''
                }`}>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay for marked for deletion */}
                  {isMarkedForDeletion && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center">
                      <span className="text-white font-bold text-sm bg-red-600 px-2 py-1 rounded">
                        DO USUNIĘCIA
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Remove/Restore Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className={`absolute top-2 right-2 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors opacity-0 group-hover:opacity-100 ${
                    isMarkedForDeletion 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                  title={isMarkedForDeletion ? 'Przywróć zdjęcie' : 'Usuń zdjęcie'}
                >
                  {isMarkedForDeletion ? '↶' : '×'}
                </button>
                
                {/* Badge for existing vs new images */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.isNew ? (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      NOWE
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                      ISTNIEJĄCE
                    </span>
                  )}
                </div>
                
                {/* File Name */}
                <p className="mt-1 text-xs text-gray-500 truncate">
                  {image.isNew ? image.file.name : `Zdjęcie ${image.id}`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Files Count */}
      {images.length > 0 && (() => {
        const activeImages = images.filter(img => img.isNew || (!img.isNew && !img.markedForDeletion));
        const newImages = images.filter(img => img.isNew);
        const existingImages = images.filter(img => !img.isNew && !img.markedForDeletion);
        const markedForDeletion = images.filter(img => !img.isNew && img.markedForDeletion);
        
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <p>Aktywne zdjęcia: {activeImages.length} z {maxFiles}</p>
            {newImages.length > 0 && <p className="text-blue-600">• Nowe: {newImages.length}</p>}
            {existingImages.length > 0 && <p className="text-gray-600">• Istniejące: {existingImages.length}</p>}
            {markedForDeletion.length > 0 && <p className="text-red-600">• Do usunięcia: {markedForDeletion.length}</p>}
          </div>
        );
      })()}
    </div>
  );
}