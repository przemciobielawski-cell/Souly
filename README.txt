SOULY — strona gabinetu (komplet plików do wdrożenia)
======================================================

STRUKTURA
---------
index.html                → strona główna (hero z filmem, O nas, Zespół,
                            Podejście, Obszary pracy, Usługi/cennik z klikalnymi
                            kartami, Kontakt z mapą, stały przycisk „Umów wizytę”)
Rezerwacja.html           → rezerwacja wizyt (kalendarz Cal.com)
Polityka-prywatnosci.html → polityka prywatności (RODO)
Regulamin.html            → regulamin świadczenia usług (wizyty, terapia)
Regulamin-strony.html     → regulamin strony (usługi drogą elektroniczną)
cookie-consent.js         → baner zgody na cookies (+ warunkowe Google Analytics)
self-test.js              → popup z testem „Jak blisko jesteś ze sobą?”
tweaks-app.jsx /
tweaks-panel.jsx          → panel podglądu wariantów (opcjonalny)
assets/
  hero-bg.mp4             → film w tle sekcji hero
  team-anna.png           → zdjęcie: Anna Szarek-Bielawska
  team-agnieszka.png      → zdjęcie: Agnieszka Stelmach
  favicon.svg / favicon-32.png / apple-touch-icon.png → ikony

JAK WDROŻYĆ
-----------
1. Wgraj zawartość folderu do GŁÓWNEGO katalogu serwera/repozytorium,
   zachowując strukturę (folder assets/ w środku).
   WAŻNE (GitHub Pages): index.html musi być w korzeniu repo — nie w
   zagnieżdżonym podfolderze.
2. Plik startowy: index.html.
3. Strona statyczna — GitHub Pages, Netlify, Vercel, Cloudflare Pages
   lub zwykły hosting WWW. Bez konfiguracji serwera.

DO SKONFIGUROWANIA
------------------
• REZERWACJA — w Rezerwacja.html, sekcja „CAL” (góra skryptu):
      Anna     → anna-szarek-bielawska-voov4l   (aktywny)
      Agnieszka→ WSTAW-LINK                      (do uzupełnienia)
• GOOGLE ANALYTICS — w cookie-consent.js: var GA_ID = "G-XXXXXXXXXX";
  Analityka rusza dopiero po kliknięciu „Akceptuję” w banerze.

PODGLĄD vs SERWER
-----------------
Mapa Google (Kontakt) i kalendarz Cal.com (Rezerwacja) NIE wyświetlą się
w oknie podglądu edytora (blokada osadzeń) — na wgranej stronie działają.

CO NOWEGO W TEJ WERSJI
----------------------
• Numer telefonu: +48 788 056 459 (strona główna + rezerwacja).
• Stały, pływający przycisk „Umów wizytę” (prawy dolny róg) — znika przy
  stopce, by nie zasłaniać linków. Test po lewej zachowuje się tak samo.
• Karty w sekcji „Usługi i cennik” są klikalne — prowadzą do rezerwacji
  (Badania psychologiczne: „Zapytaj o termin”).
• Poprawka intro: tekst nigdy nie pojawia się przed końcem filmu
  (twarda gwarancja minimalnego czasu intro + restart wideo od zera).

UWAGI
-----
• Dane kontaktowe, ceny i treści edytuje się bezpośrednio w plikach HTML.
• Dokumenty prawne to standardowe szablony — przed publikacją warto, by
  przejrzał je prawnik.
