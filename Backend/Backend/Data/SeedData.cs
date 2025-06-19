using Backend.Models;

namespace Backend.Data
{
    public static class SeedData
    {
        public static void Seed(AppDbContext db)
        {

            if (!db.Sale.Any(s => s.Id == 1001))
            {
                var sala = new Sala
                {
                    Id = 1001,
                    Numer = 1,
                    Budynek = "A",
                    MaxOsob = 20,
                    MaStanowiska = true,
                    CzynnaOd = new TimeOnly(8, 0),
                    CzynnaDo = new TimeOnly(18, 0),
                    Opis = "Testowa sala z SeedData",
                    IdOpiekuna = "test-opiekun"
                };
                db.Sale.Add(sala);
                db.SaveChanges();
            }

            var sala1 = db.Sale.FirstOrDefault(s => s.Id == 1001);
            if (sala1 == null) return;

            if (!db.Stanowiska.Any(s => s.Id == 1001))
            {
                var stanowisko = new Stanowisko
                {
                    Id = 1001,
                    Nazwa = "Stanowisko 1",
                    SalaId = sala1.Id,
                    Typ = "Komputer",
                    Opis = "Testowe stanowisko z SeedData"
                };

                db.Stanowiska.Add(stanowisko);
                db.SaveChanges();
            }

            var stanowisko1 = db.Stanowiska.FirstOrDefault(s => s.Id == 1001);
            if (stanowisko1 == null) return;


            if (!db.Rezerwacje.Any(r => r.Id == 1001))
            {
                var rezerwacja1 = new Rezerwacja
                {
                    Id = 1001,
                    DataStart = DateTime.SpecifyKind(new DateTime(2025, 6, 26, 10, 0, 0), DateTimeKind.Utc),
                    DataKoniec = DateTime.SpecifyKind(new DateTime(2025, 6, 26, 12, 0, 0), DateTimeKind.Utc),
                    DataUtworzenia = DateTime.Now.ToUniversalTime(),
                    StanowiskoId = stanowisko1.Id,
                    UzytkownikId = "test-student"
                };

                db.Rezerwacje.Add(rezerwacja1);
            }

            if (!db.Rezerwacje.Any(r => r.Id == 1002))
            {
                var rezerwacja2 = new Rezerwacja
                {
                    Id = 1002,
                    DataStart = DateTime.SpecifyKind(new DateTime(2025, 6, 27, 11, 0, 0), DateTimeKind.Utc),
                    DataKoniec = DateTime.SpecifyKind(new DateTime(2025, 6, 27, 13, 0, 0), DateTimeKind.Utc),
                    DataUtworzenia = DateTime.Now.ToUniversalTime(),
                    SalaId = sala1.Id,
                    UzytkownikId = "test-nauczyciel",
                    Opis = "Rezerwacja sali testowa dla nauczyciela",
                    Status = "zaakceptowana"
                };

                db.Rezerwacje.Add(rezerwacja2);
            }

            db.SaveChanges();
        }
    }
}
