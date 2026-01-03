using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Webp;

namespace Backend.Services
{
    public interface IImageProcessingService
    {
        Task<string> ProcessAndSaveImageAsync(IFormFile file, string uploadPath, string fileName);
        bool IsValidImageFile(IFormFile file);
    }

    public class ImageProcessingService : IImageProcessingService
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff" };
        private const int TARGET_WIDTH = 1920;
        private const int TARGET_HEIGHT = 1080;
        private const int MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        private readonly string[] _reservedNames = { "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9" };

        public bool IsValidImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (file.Length > MAX_FILE_SIZE)
                return false;

            // Walidacja nazwy pliku
            if (string.IsNullOrWhiteSpace(file.FileName))
                return false;

            // Sprawdź rozszerzenie
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                return false;

            // Sprawdź czy nazwa pliku nie zawiera niebezpiecznych znaków
            var fileName = Path.GetFileNameWithoutExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(fileName))
                return false;

            // Sprawdź czy nie jest to nazwa systemowa
            if (_reservedNames.Contains(fileName.ToUpperInvariant()))
                return false;

            // Sprawdź czy nazwa nie zawiera nielegalnych znaków
            var invalidChars = Path.GetInvalidFileNameChars();
            if (fileName.IndexOfAny(invalidChars) >= 0)
                return false;

            return true;
        }

        public async Task<string> ProcessAndSaveImageAsync(IFormFile file, string uploadPath, string fileName)
        {
            if (!IsValidImageFile(file))
                throw new ArgumentException("Nieprawidłowy plik obrazu");

            // Walidacja parametrów wejściowych
            if (string.IsNullOrWhiteSpace(uploadPath))
                throw new ArgumentException("Ścieżka uploadu nie może być pusta", nameof(uploadPath));
            
            if (string.IsNullOrWhiteSpace(fileName))
                throw new ArgumentException("Nazwa pliku nie może być pusta", nameof(fileName));

            // Bezpieczne generowanie ścieżki pliku
            var safeFilePath = GetSafeFilePath(uploadPath, fileName);
            var webpFileName = Path.GetFileName(safeFilePath);

            try
            {
                using var image = await Image.LoadAsync(file.OpenReadStream());
                
                // Zachowaj oryginalne proporcje, tylko ogranicz maksymalny wymiar
                const int MAX_DIMENSION = 1920;
                
                if (image.Width > MAX_DIMENSION || image.Height > MAX_DIMENSION)
                {
                    // Skaluj proporcjonalnie jeśli któryś wymiar przekracza MAX_DIMENSION
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(MAX_DIMENSION, MAX_DIMENSION),
                        Mode = ResizeMode.Max, // Zachowuje proporcje, zmniejsza tylko jeśli za duże
                        Sampler = KnownResamplers.Lanczos3
                    }));
                }
                // Jeśli zdjęcie jest mniejsze niż MAX_DIMENSION, zostaw oryginalne wymiary

                // Nałożenie lekkiego wyostrzenia
                image.Mutate(x => x.GaussianSharpen(0.5f));

                // Zapisywanie jako webP
                var encoder = new WebpEncoder
                {
                    Quality = 90, // High quality
                    Method = WebpEncodingMethod.BestQuality,
                    FileFormat = WebpFileFormatType.Lossy
                };

                await image.SaveAsync(safeFilePath, encoder);
                
                return webpFileName;
            }
            catch (UnauthorizedAccessException)
            {
                throw; // Przekaż wyjątki bezpieczeństwa bez zmian
            }
            catch (DirectoryNotFoundException ex)
            {
                throw new InvalidOperationException($"Katalog uploadu nie został znaleziony: {ex.Message}", ex);
            }
            catch (IOException ex)
            {
                throw new InvalidOperationException($"Błąd operacji na pliku: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Błąd przetwarzania obrazu: {ex.Message}", ex);
            }
        }

        private string GetSafeFilePath(string uploadDirectory, string fileName)
        {
            // Upewnij się, że katalog uploadu istnieje
            Directory.CreateDirectory(uploadDirectory);

            // Oczyść nazwę pliku - usuń komponenty ścieżki
            var safeFileName = Path.GetFileName(fileName);
            if (string.IsNullOrWhiteSpace(safeFileName))
                throw new ArgumentException("Nieprawidłowa nazwa pliku", nameof(fileName));

            // Wygeneruj unikalną nazwę pliku aby uniknąć konfliktów
            var extension = Path.GetExtension(safeFileName);
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(safeFileName);
            var uniqueFileName = $"{nameWithoutExtension}_{Guid.NewGuid()}.webp";

            // Stwórz pełną ścieżkę
            var fullPath = Path.Combine(uploadDirectory, uniqueFileName);

            // Znormalizuj ścieżki do porównania
            var normalizedUploadDir = Path.GetFullPath(uploadDirectory);
            var normalizedFilePath = Path.GetFullPath(fullPath);

            // Sprawdzenie bezpieczeństwa: upewnij się, że wynikowa ścieżka jest w dozwolonym katalogu
            if (!normalizedFilePath.StartsWith(normalizedUploadDir, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Wykryto próbę ataku path traversal. Ścieżka pliku jest poza dozwolonym katalogiem.");
            }

            // Dodatkowe zabezpieczenie: sprawdź czy ścieżka zawiera podejrzane wzorce
            var relativePath = Path.GetRelativePath(normalizedUploadDir, normalizedFilePath);
            if (relativePath.Contains("..") || relativePath.StartsWith("/") || relativePath.StartsWith("\\"))
            {
                throw new UnauthorizedAccessException("Wykryto nieprawidłową ścieżkę pliku.");
            }

            return normalizedFilePath;
        }
    }
}