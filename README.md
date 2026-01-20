# Teamfloor

## Opis projektu
Teamfloor to aplikacja webowa do wizualizacji obecności zespołu oraz komunikacji opartej na integracji ze Slackiem.

## Architektura projektu

### 1. Frontend
- Stworzony przy użyciu frameworka Next.js (React).
- Główne komponenty:
  - **OfficeCanvas** - wizualizacja stanowisk zespołu (desks).
  - **DeskCard** i **Desk** - reprezentacja pojedynczego stanowiska z informacją o obecności (presence), statusie i liczbie nieprzeczytanych wiadomości.
  - **AdminPanel** - panel administracyjny do zarządzania dostępem użytkowników poprzez integrację z Slackiem.
- Stylowanie jest realizowane częściowo inline oraz poprzez globalne style.

### 2. Backend
- Next.js API routes pełnią funkcję backendu:
  - `/api/slack/login` - rozpoczęcie procesu OAuth dla Slacka.
  - `/api/slack/callback` - odbiór i obsługa callbacka OAutha Slacka, zapis instalacji w bazie.
  - `/api/slack/logout` - usunięcie instalacji Slacka z bazy.
  - `/api/slack/status` - sprawdzenie statusu połączenia z Slackiem.
  - `/api/slack/users` - pobranie listy użytkowników Slacka przez token zapisany w bazie.

### 3. Baza danych
- Używane jest Supabase jako warstwa bazy danych i backend-as-a-service.
- Dwie główne tabele:
  - `desks` - przechowuje informacje o stanowiskach zespołu (id, nazwa, obecność, slackUserId, status).
  - `slack_auth` i `slack_installations` - do przechowywania autoryzacji i instalacji Slack OAuth.

### 4. Integracja z Slackiem
- OAuth 2.0 do uwierzytelniania użytkownika i aplikacji.
- Tokeny są zapisywane na backendzie z pełnymi uprawnieniami (bot i user tokeny).
- Dane użytkowników Slack są pobierane i mapowane na stanowiska w aplikacji.

### 5. Aktualizacje w czasie rzeczywistym
- Supabase Realtime służy do nasłuchiwania zmian w tabeli `desks` i natychmiastowego aktualizowania widoku frontendu.

### 6. Inne
- Środowisko i konfiguracja opierają się na zmiennych środowiskowych (np. klucze Slack, Supabase).
- Komponenty React działają z flagą "use client" dla interakcji i efektów.

---

### Podsumowanie
Projekt jest klasycznym przykładem aplikacji fullstack opartej na Next.js z backendem realizowanym przez API routes i korzystaniu z Supabase jako backend BaaS. Integracja z zewnętrznym API (Slack) umożliwia rozszerzenie funkcji o autoryzację i dane użytkowników. Real-time updates zapewniają dynamiczną i responsywną interakcję użytkownika.