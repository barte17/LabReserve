-- Skrypt migracji systemu ról
-- Wykonaj to PRZED uruchomieniem nowej wersji aplikacji

-- 1. Dodaj nową rolę "Uzytkownik" jeśli nie istnieje
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp") 
SELECT 
    gen_random_uuid()::text,
    'Uzytkownik',
    'UZYTKOWNIK',
    gen_random_uuid()::text
WHERE NOT EXISTS (
    SELECT 1 FROM "AspNetRoles" WHERE "NormalizedName" = 'UZYTKOWNIK'
);

-- 2. Dodaj rolę "Uzytkownik" do wszystkich użytkowników
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT 
    u."Id",
    r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE r."NormalizedName" = 'UZYTKOWNIK'
AND NOT EXISTS (
    SELECT 1 
    FROM "AspNetUserRoles" ur 
    WHERE ur."UserId" = u."Id" 
    AND ur."RoleId" = r."Id"
);

-- 3. Usuń rolę "Niezatwierdzony" od użytkowników z innymi rolami
-- (pozostaw tylko użytkowników, którzy mają TYLKO rolę "Niezatwierdzony")
DELETE FROM "AspNetUserRoles" ur1
WHERE ur1."RoleId" IN (
    SELECT "Id" FROM "AspNetRoles" WHERE "NormalizedName" = 'NIEZATWIERDZONY'
)
AND EXISTS (
    SELECT 1 
    FROM "AspNetUserRoles" ur2
    INNER JOIN "AspNetRoles" r2 ON ur2."RoleId" = r2."Id"
    WHERE ur2."UserId" = ur1."UserId" 
    AND r2."NormalizedName" != 'NIEZATWIERDZONY'
);

-- 4. Usuń samą rolę "Niezatwierdzony" z tabeli ról
-- (to automatycznie usuwa pozostałe powiązania przez CASCADE)
DELETE FROM "AspNetRoles" WHERE "NormalizedName" = 'NIEZATWIERDZONY';

-- 5. Sprawdź rezultaty
SELECT 
    'Status after migration' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role_count = 1 AND has_uzytkownik = 1 THEN 1 END) as unconfirmed_users,
    COUNT(CASE WHEN role_count > 1 THEN 1 END) as confirmed_users
FROM (
    SELECT 
        u."Id",
        COUNT(ur."RoleId") as role_count,
        MAX(CASE WHEN r."NormalizedName" = 'UZYTKOWNIK' THEN 1 ELSE 0 END) as has_uzytkownik
    FROM "AspNetUsers" u
    LEFT JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
    LEFT JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
    GROUP BY u."Id"
) stats;