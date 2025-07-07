using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Backend.Data.CustomDataValidations
{
        public class OnlyLettersAttribute : ValidationAttribute
        {
            public override bool IsValid(object value)
            {
                if (value == null) return true; 

                string input = value.ToString();
                // Tylko litery (polskie znaki też uwzględnione)
                return Regex.IsMatch(input, @"^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\s-]+$");
            }

            public override string FormatErrorMessage(string name)
            {
                return $"{name} może zawierać tylko litery.";
            }
        }

        public class StrongPasswordAttribute : ValidationAttribute
        {
            public override bool IsValid(object value)
            {
                if (value == null) return true;

                string password = value.ToString();
                // Minimum 8 znaków, 1 wielka litera, 1 mała, 1 cyfra, 1 znak specjalny
                return Regex.IsMatch(password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$");
            }

            public override string FormatErrorMessage(string name)
            {
                return $"{name} musi zawierać minimum 8 znaków, w tym dużą i małą literę, cyfrę oraz znak specjalny.";
            }
        }
    }

