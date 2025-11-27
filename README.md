# 🏫 LabReserve - System Rezerwacji Laboratoriów

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)
![React](https://img.shields.io/badge/React-18.0-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)

**LabReserve** to nowoczesny system zarządzania rezerwacjami sal laboratoryjnych i stanowisk pracy, stworzony z myślą o uczelniach wyższych i instytucjach badawczych.

## 🚀 Funkcjonalności

### 👥 System Ról
- **Admin** - pełne zarządzanie systemem, użytkownikami i zasobami
- **Opiekun** - zarządzanie przypisanymi salami i stanowiskami
- **Nauczyciel** - rezerwacja sal i stanowisk do prowadzenia zajęć
- **Student** - rezerwacja dostępnych stanowisk
- **Użytkownik** - konto podstawowe (do zatwierdzenia)

### 📅 System Rezerwacji
- Rezerwacja sal laboratoryjnych i stanowisk pracy
- Kalendarz dostępności w czasie rzeczywistym
- Automatyczne powiadomienia o rezerwacjach
- Zarządzanie statusami rezerwacji (oczekujące, zatwierdzone, odrzucone)
- Automatyczne usuwanie wygasłych rezerwacji

### 🔔 Powiadomienia
- Powiadomienia w czasie rzeczywistym (SignalR)
- System priorytetów powiadomień
- Powiadomienia email (Azure Communication Services)
- Historia powiadomień użytkownika

### 🖼️ Zarządzanie Multimediami
- Upload i zarządzanie zdjęciami sal i stanowisk
- Automatyczna optymalizacja obrazów
- Galerie zdjęć z lazy loading

### 🛡️ Bezpieczeństwo
- JWT access tokens (15 min) + refresh tokens (7 dni)
- HttpOnly cookies dla maksymalnego bezpieczeństwa
- Account lockout po nieudanych próbach logowania
- Rate limiting na endpointy logowania
- Kompletny audit log wszystkich działań
- Role-based authorization

### 📊 Panel Administracyjny
- Statystyki użytkowników i rezerwacji
- Zarządzanie rolami użytkowników
- Przegląd logów działań (audit trail)
- Zarządzanie salami i stanowiskami

## 🏗️ Architektura

### Backend (.NET 8)
```
Backend/
├── Controllers/     # API endpoints
├── Models/         # Entity models
├── Services/       # Business logic
├── Data/          # Database context & migrations
├── Dto/           # Data transfer objects
└── Hubs/          # SignalR hubs
```

### Frontend (React + TypeScript)
```
Frontend/src/
├── components/    # React components
├── contexts/      # State management
├── services/      # API calls
├── pages/         # Page components
├── routes/        # Route protection
└── hooks/         # Custom hooks
```

## 🛠️ Stack Technologiczny

### Backend
- **Framework**: ASP.NET Core 8
- **ORM**: Entity Framework Core
- **Database**: PostgreSQL
- **Authentication**: JWT + ASP.NET Identity
- **Real-time**: SignalR
- **Email**: Azure Communication Services
- **Rate Limiting**: AspNetCoreRateLimit

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Fetch API
- **Real-time**: SignalR Client

## 🚀 Szybkie uruchomienie programu

### Automatyczne uruchomienie (Windows)
1. `npm_install.bat` (tylko dla pierwszego uruchomienia)
2. `run.bat` (uruchamia backend i frontend)

### Manualne uruchomienie

#### Wymagania
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 15+

#### Backend
```bash
cd Backend/Backend
dotnet restore
dotnet ef database update
dotnet run
```

#### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## ⚙️ Konfiguracja

### Appsettings.json
**Wymagane konfiguracje:**

1. **Baza danych**: PostgreSQL ze stworzoną bazą danych zgodną z connection stringiem
2. **JWT**: Skonfigurowany klucz, issuer i audience
3. **Azure Communication Services**: Connection string do wysyłania emaili (opcjonalne)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=LabReserve;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-here",
    "Issuer": "LabReserve",
    "Audience": "LabReserveApp"
  },
  "AzureCommunicationServices": {
    "ConnectionString": "your-azure-connection-string",
    "SenderEmail": "noreply@yourdomain.com"
  }
}
```

### Migracje bazy danych
Aplikacja automatycznie uruchamia migracje przy starcie. W przypadku problemów:
```bash
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

## 📱 Dostęp do aplikacji

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger (w trybie development)

## 🔐 Domyślne konta (po pierwszym uruchomieniu)

System automatycznie tworzy przykładowe konta - sprawdź kod w `IdentitySeedData.cs`.

## 📝 API Documentation

API jest dokumentowane przez Swagger UI dostępne pod `/swagger` w trybie development.

### Główne endpointy:
- `POST /api/account/login` - Logowanie
- `POST /api/account/register` - Rejestracja
- `GET /api/sala` - Lista sal
- `GET /api/stanowisko` - Lista stanowisk
- `POST /api/rezerwacja` - Tworzenie rezerwacji

## 📄 Licencja

Ten projekt jest licencjonowany na zasadach MIT License.

--
 
