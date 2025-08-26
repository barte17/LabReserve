import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
}

export default function ImageUpload({ 
  onFilesChange, 
  maxFiles = 10, 
  maxSizeInMB = 5 
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    Array.from(fileList).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errorMessages.push(validationError);
        return;
      }

      if (images.length + newImages.length >= maxFiles) {
        errorMessages.push(`Maksymalna liczba plików: ${maxFiles}`);
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      newFiles.push(file);
      newImages.push({ file, preview, id });
    });

    if (errorMessages.length > 0) {
      setError(errorMessages.join(', '));
      setTimeout(() => setError(''), 5000);
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onFilesChange(updatedImages.map(img => img.file));
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
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => {
      if (img.id === id) {
        URL.revokeObjectURL(img.preview);
        return false;
      }
      return true;
    });
    setImages(updatedImages);
    onFilesChange(updatedImages.map(img => img.file));
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
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
              
              {/* File Name */}
              <p className="mt-1 text-xs text-gray-500 truncate">
                {image.file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Files Count */}
      {images.length > 0 && (
        <p className="text-sm text-gray-600">
          Wybrano {images.length} z {maxFiles} plików
        </p>
      )}
    </div>
  );
}