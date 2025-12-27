using System.Security.Cryptography;
using System.Text;

namespace Backend.Services
{
    public interface ITokenHashingService
    {
        string HashToken(string token);
        bool VerifyToken(string token, string hash);
    }

    public class TokenHashingService : ITokenHashingService
    {
        /// <summary>
        /// Hashuje refresh token używając SHA256
        /// </summary>
        /// <param name="token">Plain text refresh token</param>
        /// <returns>Hex string reprezentujący hash (64 znaki)</returns>
        public string HashToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                throw new ArgumentNullException(nameof(token));

            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }

        /// <summary>
        /// Weryfikuje czy token pasuje do podanego hasha
        /// </summary>
        /// <param name="token">Plain text token do weryfikacji</param>
        /// <param name="hash">Hash do porównania</param>
        /// <returns>True jeśli token pasuje do hasha</returns>
        public bool VerifyToken(string token, string hash)
        {
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(hash))
                return false;

            var computedHash = HashToken(token);
            return computedHash.Equals(hash, StringComparison.OrdinalIgnoreCase);
        }
    }
}
