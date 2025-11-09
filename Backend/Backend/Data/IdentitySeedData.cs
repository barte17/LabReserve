using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.Data
{
    public static class IdentitySeedData
    {
        public static async Task SeedRolesAndUsers(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            // === ROLE ===
            string[] roleNames = { "Student", "Nauczyciel", "Admin", "Opiekun", "Uzytkownik" };

            foreach (var role in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // === UŻYTKOWNIK ADMIN ===
            var adminEmail = "admin@uczelnia.pl";
            var admin = await userManager.FindByEmailAsync(adminEmail);
            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    Id = "test-admin",
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    Imie = "Testowy",
                    Nazwisko = "Admin"
                };

                await userManager.CreateAsync(admin, "Haslo!23"); // hasło tymczasowe
                await userManager.AddToRoleAsync(admin, "Uzytkownik"); // Podstawowa rola techniczna
                await userManager.AddToRoleAsync(admin, "Admin");
            }

            // === UŻYTKOWNIK STUDENT ===
            var studentEmail = "student@uczelnia.pl";
            var student = await userManager.FindByEmailAsync(studentEmail);
            if (student == null)
            {
                student = new ApplicationUser
                {
                    Id = "test-student",
                    UserName = studentEmail,
                    Email = studentEmail,
                    EmailConfirmed = true,
                    Imie = "Testowy",
                    Nazwisko = "Student"
                };

                await userManager.CreateAsync(student, "Haslo!23");
                await userManager.AddToRoleAsync(student, "Uzytkownik"); // Podstawowa rola techniczna
                await userManager.AddToRoleAsync(student, "Student");
            }

            // === NAUCZYCIEL ===
            var teacherEmail = "nauczyciel@uczelnia.pl";
            var teacher = await userManager.FindByEmailAsync(teacherEmail);
            if (teacher == null)
            {
                teacher = new ApplicationUser
                {
                    Id = "test-nauczyciel",
                    UserName = teacherEmail,
                    Email = teacherEmail,
                    EmailConfirmed = true,
                    Imie = "Testowy",
                    Nazwisko = "Nauczyciel"
                };

                await userManager.CreateAsync(teacher, "Haslo!23");
                await userManager.AddToRoleAsync(teacher, "Uzytkownik"); // Podstawowa rola techniczna
                await userManager.AddToRoleAsync(teacher, "Nauczyciel");
            }

            // === OPIEKUN ===
            var opiekunEmail = "opiekun@uczelnia.pl";
            var opiekun = await userManager.FindByEmailAsync(opiekunEmail);
            if (opiekun == null)
            {
                opiekun = new ApplicationUser
                {
                    Id = "test-opiekun",
                    UserName = opiekunEmail,
                    Email = opiekunEmail,
                    EmailConfirmed = true,
                    Imie = "Testowy",
                    Nazwisko = "Opiekun"
                };

                await userManager.CreateAsync(opiekun, "Haslo!23");
                await userManager.AddToRoleAsync(opiekun, "Uzytkownik"); // Podstawowa rola techniczna
                await userManager.AddToRoleAsync(opiekun, "Opiekun");
                await userManager.AddToRoleAsync(opiekun, "Nauczyciel");
            }
        }
    }
}
