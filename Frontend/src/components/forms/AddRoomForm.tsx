import { useState, useEffect } from "react";
import ImageUpload from "../ImageUpload";
import { FormErrorBoundary } from "../ErrorBoundary";
import { LoadingButton } from "../LoadingStates";

type SalaFormData = {
  numer: number;
  budynek: string;
  maxOsob: number | null;
  maStanowiska: boolean;
  czynnaOd: string | null; // format hh:mm:ss
  czynnaDo: string | null;
  opis: string;
  idOpiekuna: string | null;
  zdjecia?: File[];
  zdjeciaDoUsuniecia?: number[];
};

type User = {
  id: string;
  imie: string;
  nazwisko: string;
};

export default function AddRoomForm({ onSubmit, initialData, submitLabel = "Dodaj", onCancel, existingImages = [], isLoading = false }: {
  onSubmit: (data: SalaFormData) => void;
  initialData?: Partial<SalaFormData>;
  submitLabel?: string;
  onCancel?: () => void;
  existingImages?: { id: number; url: string }[];
  isLoading?: boolean;
}) {
  const [numer, setNumer] = useState(initialData?.numer?.toString() ?? "");
  const [budynek, setBudynek] = useState(initialData?.budynek ?? "");
  const [maxOsob, setMaxOsob] = useState(initialData?.maxOsob?.toString() ?? "");
  const [maStanowiska, setMaStanowiska] = useState(initialData?.maStanowiska ?? false);
  const [czynnaOd, setCzynnaOd] = useState(initialData?.czynnaOd ? initialData.czynnaOd.slice(0, 5) : "");
  const [czynnaDo, setCzynnaDo] = useState(initialData?.czynnaDo ? initialData.czynnaDo.slice(0, 5) : "");
  const [opis, setOpis] = useState(initialData?.opis ?? "");
  const [idOpiekuna, setIdOpiekuna] = useState(initialData?.idOpiekuna ?? "");
  const [nauczyciele, setNauczyciele] = useState<User[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);


  const [validationErrors, setValidationErrors] = useState({
    numer: '',
    budynek: '',
    maxOsob: '',
    czynnaOd: '',
    czynnaDo: '',
    opis: ''
  });

  useEffect(() => {
    const fetchOpiekunowie = async () => {
      try {
        const { authenticatedFetch } = await import('../../services/authService');
        const res = await authenticatedFetch("/api/users/opiekunowie");
        if (res.ok) {
          const data = await res.json();
          setNauczyciele(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania opiekunów:", error);
      }
    };
    fetchOpiekunowie();
  }, []);

  const formatTimeToTimeSpan = (time: string): string | null => {
    return time ? `${time}:00` : null;
  };

  const validateNumer = (value: string) => {
    if (!value.trim()) return 'Numer sali jest wymagany';
    const num = parseInt(value);
    if (isNaN(num)) return 'Numer sali musi być liczbą';
    if (num <= 0) return 'Numer sali musi być większy od 0';
    if (num > 9999) return 'Numer sali nie może być większy niż 9999';
    return '';
  };

  const validateBudynek = (value: string) => {
    if (!value.trim()) return 'Nazwa budynku jest wymagana';
    if (value.length < 1) return 'Nazwa budynku musi mieć co najmniej 1 znak';
    if (value.length > 50) return 'Nazwa budynku nie może być dłuższa niż 50 znaków';
    return '';
  };

  const validateMaxOsob = (value: string) => {
    if (!value) return ''; // opcjonalne pole
    const num = parseInt(value);
    if (isNaN(num)) return 'Maksymalna liczba osób musi być liczbą';
    if (num <= 0) return 'Maksymalna liczba osób musi być większa od 0';
    if (num > 1000) return 'Maksymalna liczba osób nie może być większa niż 1000';
    return '';
  };

  const validateTime = (value: string, fieldName: string) => {
    if (!value) return ''; // opcjonalne pole
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) return `${fieldName} musi być w formacie HH:MM`;
    return '';
  };

  const validateOpis = (value: string) => {
    if (value.length > 500) return 'Opis nie może być dłuższy niż 500 znaków';
    return '';
  };

  // Real-time validation 
  const handleNumerChange = (value: string) => {
    setNumer(value);
    setValidationErrors(prev => ({ ...prev, numer: validateNumer(value) }));
  };

  const handleBudynekChange = (value: string) => {
    setBudynek(value);
    setValidationErrors(prev => ({ ...prev, budynek: validateBudynek(value) }));
  };

  const handleMaxOsobChange = (value: string) => {
    setMaxOsob(value);
    setValidationErrors(prev => ({ ...prev, maxOsob: validateMaxOsob(value) }));
  };

  const handleCzynnaOdChange = (value: string) => {
    setCzynnaOd(value);
    setValidationErrors(prev => ({
      ...prev,
      czynnaOd: validateTime(value, 'Godzina otwarcia'),
      czynnaDo: czynnaDo && value && czynnaDo <= value ? 'Godzina zamknięcia musi być późniejsza niż godzina otwarcia' : validateTime(czynnaDo, 'Godzina zamknięcia')
    }));
  };

  const handleCzynnaDoChange = (value: string) => {
    setCzynnaDo(value);
    setValidationErrors(prev => ({
      ...prev,
      czynnaDo: czynnaOd && value && value <= czynnaOd ? 'Godzina zamknięcia musi być późniejsza niż godzina otwarcia' : validateTime(value, 'Godzina zamknięcia')
    }));
  };

  const handleOpisChange = (value: string) => {
    setOpis(value);
    setValidationErrors(prev => ({ ...prev, opis: validateOpis(value) }));
  };

  // Reset formularza po błędzie
  const resetForm = () => {
    setNumer('');
    setBudynek('');
    setMaxOsob('');
    setIdOpiekuna('');
    setCzynnaOd('');
    setCzynnaDo('');
    setOpis('');
    setMaStanowiska(false);
    setSelectedImages([]);
    setImagesToDelete([]);
    setValidationErrors({
      numer: '',
      budynek: '',
      maxOsob: '',
      czynnaOd: '',
      czynnaDo: '',
      opis: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Finalna walidacja przed wysłaniem
    const errors = {
      numer: validateNumer(numer),
      budynek: validateBudynek(budynek),
      maxOsob: validateMaxOsob(maxOsob),
      czynnaOd: validateTime(czynnaOd, 'Godzina otwarcia'),
      czynnaDo: validateTime(czynnaDo, 'Godzina zamknięcia'),
      opis: validateOpis(opis)
    };

    // Additional validation for time range
    if (czynnaOd && czynnaDo && czynnaDo <= czynnaOd) {
      errors.czynnaDo = 'Godzina zamknięcia musi być późniejsza niż godzina otwarcia';
    }

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      return;
    }

    const parsedData: SalaFormData = {
      numer: parseInt(numer),
      budynek,
      maxOsob: maxOsob ? parseInt(maxOsob) : null,
      maStanowiska,
      czynnaOd: formatTimeToTimeSpan(czynnaOd),
      czynnaDo: formatTimeToTimeSpan(czynnaDo),
      opis,
      idOpiekuna: idOpiekuna || null,
      zdjecia: selectedImages,
      zdjeciaDoUsuniecia: imagesToDelete
    };

    onSubmit(parsedData);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          {initialData ? 'Edytuj salę' : 'Dodaj nową salę'}
        </h3>
        <p className="text-neutral-600">
          Wypełnij formularz, aby {initialData ? 'zaktualizować' : 'dodać'} salę do systemu
        </p>
      </div>

      <FormErrorBoundary
        onError={resetForm}
        fallbackMessage="Wystąpił błąd w formularzu sali. Formularz został zresetowany."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Numer sali</label>
              <input
                type="number"
                value={numer}
                onChange={(e) => handleNumerChange(e.target.value)}
                required
                className={`form-input ${validationErrors.numer ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Wprowadź numer sali"
              />
              {validationErrors.numer && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.numer}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Budynek</label>
              <input
                value={budynek}
                onChange={(e) => handleBudynekChange(e.target.value)}
                required
                className={`form-input ${validationErrors.budynek ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Nazwa budynku"
              />
              {validationErrors.budynek && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.budynek}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Maksymalna liczba osób</label>
              <input
                type="number"
                value={maxOsob}
                onChange={(e) => handleMaxOsobChange(e.target.value)}
                className={`form-input ${validationErrors.maxOsob ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Pojemność sali"
              />
              {validationErrors.maxOsob && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.maxOsob}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Opiekun sali</label>
              <select
                value={idOpiekuna}
                onChange={(e) => setIdOpiekuna(e.target.value)}
                className="form-input"
              >
                <option value="">-- Wybierz opiekuna --</option>
                {nauczyciele.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.imie} {user.nazwisko}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={maStanowiska}
                onChange={(e) => setMaStanowiska(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                id="maStanowiska"
              />
              <label htmlFor="maStanowiska" className="ml-3 text-sm font-medium text-neutral-700">
                Sala posiada laboratoria/stanowiska badawcze
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Godzina otwarcia</label>
              <div className="relative">
                <select
                  value={czynnaOd}
                  onChange={(e) => handleCzynnaOdChange(e.target.value)}
                  className={`form-input pr-10 ${validationErrors.czynnaOd ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Wybierz godzinę otwarcia</option>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Godzina zamknięcia</label>
              <div className="relative">
                <select
                  value={czynnaDo}
                  onChange={(e) => handleCzynnaDoChange(e.target.value)}
                  className={`form-input pr-10 ${validationErrors.czynnaDo ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Wybierz godzinę zamknięcia</option>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {validationErrors.czynnaDo && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.czynnaDo}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Opis sali</label>
            <textarea
              value={opis}
              onChange={(e) => handleOpisChange(e.target.value)}
              className={`form-input ${validationErrors.opis ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Dodatkowe informacje o sali..."
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              {validationErrors.opis ? (
                <p className="text-sm text-red-600">{validationErrors.opis}</p>
              ) : (
                <div></div>
              )}
              <p className="text-xs text-gray-500">{opis.length}/500 znaków</p>
            </div>
          </div>

          {/* Sekcja zdjęć */}
          <div className="form-group">
            <label className="form-label">Zdjęcia sali</label>
            <p className="text-sm text-gray-600 mb-3">
              Dodaj zdjęcia sali, aby ułatwić użytkownikom jej identyfikację
            </p>
            <ImageUpload
              onFilesChange={setSelectedImages}
              onExistingImagesChange={setImagesToDelete}
              existingImages={existingImages}
              maxFiles={8}
              maxSizeInMB={5}
            />
          </div>

          <div className="flex items-center space-x-4 pt-6 border-t border-neutral-200">
            <LoadingButton
              type="submit"
              loading={isLoading}
              loadingText={initialData ? "Zapisywanie..." : "Dodawanie..."}
              className="btn btn-primary"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitLabel}
            </LoadingButton>
            {onCancel && (
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Anuluj
              </button>
            )}
          </div>
        </form>
      </FormErrorBoundary>
    </div>
  );
}
