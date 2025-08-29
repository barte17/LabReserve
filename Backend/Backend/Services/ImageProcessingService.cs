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

        public bool IsValidImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (file.Length > MAX_FILE_SIZE)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            return _allowedExtensions.Contains(extension);
        }

        public async Task<string> ProcessAndSaveImageAsync(IFormFile file, string uploadPath, string fileName)
        {
            if (!IsValidImageFile(file))
                throw new ArgumentException("Invalid image file");

            // Ensure directory exists
            Directory.CreateDirectory(uploadPath);

            // Generate final file path with .webp extension
            var webpFileName = Path.ChangeExtension(fileName, ".webp");
            var filePath = Path.Combine(uploadPath, webpFileName);

            try
            {
                using var image = await Image.LoadAsync(file.OpenReadStream());
                
                // Get original dimensions
                var originalWidth = image.Width;
                var originalHeight = image.Height;
                var originalRatio = (double)originalWidth / originalHeight;
                var targetRatio = (double)TARGET_WIDTH / TARGET_HEIGHT;

                // Process image based on aspect ratio
                if (Math.Abs(originalRatio - targetRatio) < 0.1)
                {
                    // Already close to 16:9 - simple resize
                    image.Mutate(x => x.Resize(TARGET_WIDTH, TARGET_HEIGHT, KnownResamplers.Lanczos3));
                }
                else if (originalRatio > targetRatio * 1.5)
                {
                    // Very wide (panoramic) - crop to 16:9
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(TARGET_WIDTH, TARGET_HEIGHT),
                        Mode = ResizeMode.Crop,
                        Position = AnchorPositionMode.Center,
                        Sampler = KnownResamplers.Lanczos3
                    }));
                }
                else if (originalRatio < targetRatio * 0.7)
                {
                    // Very tall (portrait) - pad with gradient background
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(TARGET_WIDTH, TARGET_HEIGHT),
                        Mode = ResizeMode.Pad,
                        Position = AnchorPositionMode.Center,
                        PadColor = Color.FromRgb(240, 240, 240), // Light gray background
                        Sampler = KnownResamplers.Lanczos3
                    }));
                }
                else
                {
                    // Normal ratio - resize to fit
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(TARGET_WIDTH, TARGET_HEIGHT),
                        Mode = ResizeMode.Max,
                        Position = AnchorPositionMode.Center,
                        Sampler = KnownResamplers.Lanczos3
                    }));
                }

                // Apply subtle sharpening for better quality
                image.Mutate(x => x.GaussianSharpen(0.5f));

                // Save as WebP with high quality
                var encoder = new WebpEncoder
                {
                    Quality = 90, // High quality
                    Method = WebpEncodingMethod.BestQuality,
                    FileFormat = WebpFileFormatType.Lossy
                };

                await image.SaveAsync(filePath, encoder);
                
                return webpFileName;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error processing image: {ex.Message}", ex);
            }
        }
    }
}