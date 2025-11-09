# Instrukcje Wdrożenia - Nowy System Ról

## ⚠️ WAŻNE - Przed wdrożeniem

### 1. Backup Bazy Danych
```bash
# PostgreSQL backup
pg_dump -h localhost -U your_user -d your_database > backup_before_roles_migration.sql
```

### 2. Migracja Ról (WYMAGANA)
Wykonaj skrypt migracji **PRZED** uruchomieniem nowej wersji:

```sql
-- W PostgreSQL console:
\i Backend/Migrations/UpdateUserRolesMigration.sql
```

### 3. Sprawdź Migrację
Po wykonaniu migracji sprawdź czy wszystko jest OK:

```sql
-- Sprawdź role w systemie
SELECT "Name" FROM "AspNetRoles" ORDER BY "Name";
-- Powinny być: Admin, Nauczyciel, Opiekun, Student, Uzytkownik

-- Sprawdź użytkowników bez ról biznesowych
SELECT u."Email", COUNT(ur."RoleId") as role_count
FROM "AspNetUsers" u
LEFT JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
GROUP BY u."Id", u."Email"
HAVING COUNT(ur."RoleId") = 1;
```

## 🔄 Zmiany w Systemie

### Nowy Model Ról:
- **"Uzytkownik"** - Podstawowa rola techniczna (dostęp do systemu)
- **"Student"** - Może rezerwować stanowiska
- **"Nauczyciel"** - Może rezerwować stanowiska i sale  
- **"Opiekun"** - Zarządzanie przypisanymi salami + Nauczyciel
- **"Admin"** - Pełne uprawnienia

### Autoryzacja Rezerwacji:
- **Rezerwacje stanowisk**: Student, Nauczyciel, Opiekun, Admin
- **Rezerwacje sal**: Nauczyciel, Opiekun, Admin
- **Tylko rola "Uzytkownik"**: Oczekuje aktywacji (nie może rezerwować)

## 🎯 Co się zmieni dla użytkowników

### Nowi użytkownicy:
1. Rejestrują się → otrzymują rolę "Uzytkownik"
2. Mogą przeglądać system ale nie mogą rezerwować
3. Admin nadaje im odpowiednie role biznesowe

### Istniejący użytkownicy:
1. Wszyscy otrzymują rolę "Uzytkownik" automatycznie
2. Zachowują swoje obecne role biznesowe
3. Użytkownicy z rolą "Niezatwierdzony" pozostają tylko z "Uzytkownik"

## 🐛 Troubleshooting

### Problem: Użytkownik nie może się zalogować
**Rozwiązanie:** Sprawdź czy ma rolę "Uzytkownik"
```sql
SELECT r."Name" 
FROM "AspNetUserRoles" ur
JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE ur."UserId" = 'USER_ID';
```

### Problem: Błąd "Użytkownik nie ma przypisanych ról"
**Rozwiązanie:** Dodaj rolę "Uzytkownik"
```sql
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT 'USER_ID', r."Id" 
FROM "AspNetRoles" r 
WHERE r."NormalizedName" = 'UZYTKOWNIK';
```

### Problem: Frontend pokazuje błędy autoryzacji
**Przyczyna:** Stare tokeny JWT z rolą "Niezatwierdzony"
**Rozwiązanie:** Użytkownicy muszą się wylogować i zalogować ponownie

## 📊 Monitorowanie po wdrożeniu

### Sprawdź statystyki użytkowników:
```
GET /api/Account/stats
```

### Sprawdź użytkowników oczekujących aktywacji:
```sql
SELECT u."Email", u."Imie", u."Nazwisko"
FROM "AspNetUsers" u
JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"  
JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE r."NormalizedName" = 'UZYTKOWNIK'
GROUP BY u."Id", u."Email", u."Imie", u."Nazwisko"
HAVING COUNT(ur."RoleId") = 1;
```

## ✅ Checklist Wdrożenia

- [ ] Backup bazy danych
- [ ] Wykonanie skryptu migracji ról
- [ ] Sprawdzenie poprawności migracji
- [ ] Wdrożenie nowej wersji backendu
- [ ] Wdrożenie nowej wersji frontendu  
- [ ] Test logowania istniejących użytkowników
- [ ] Test rejestracji nowego użytkownika
- [ ] Test nadawania ról przez admina
- [ ] Test autoryzacji rezerwacji
- [ ] Komunikacja do użytkowników o zmianach