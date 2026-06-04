SOULY — strona gabinetu (komplet plików do wdrożenia)
======================================================

STRUKTURA
---------
index.html                → strona główna (hero z filmem, O nas, Zespół,
                            Podejście, Obszary pracy, Usługi/cennik,
                            Kontakt z mapą, stopka z linkami)
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
3. Strona statyczna — działa na GitHub Pages, Netlify, Vercel,
   Cloudflare Pages lub zwykłym hostingu WWW. Bez konfiguracji serwera.

CO TRZEBA / MOŻNA SKONFIGUROWAĆ
-------------------------------
• REZERWACJA — w Rezerwacja.html, sekcja „CAL” (góra skryptu):
      Anna     → anna-szarek-bielawska-voov4l   (aktywny)
      Agnieszka→ WSTAW-LINK                      (do uzupełnienia)
  Zgody (checkboxy „zapoznałem się z...”) dodaje się po stronie Cal.com:
  Event Type → Advanced → Booking questions → pole Checkbox (Required).

• GOOGLE ANALYTICS — w cookie-consent.js, na górze:
      var GA_ID = "G-XXXXXXXXXX";   ← wstaw swój identyfikator GA4
  Analityka uruchamia się dopiero po kliknięciu „Akceptuję” w banerze.
  Dopóki jest placeholder, żadne skrypty zewnętrzne nie są ładowane.

• TEST (popup) — treść pytań i wyników w pliku self-test.js
  (tablice QUESTIONS i RESULTS). Pokazuje się raz przy przewinięciu do
  sekcji „Obszary pracy”; pływający przycisk pozwala otworzyć go ponownie.

PODGLĄD vs SERWER
-----------------
Mapa Google (Kontakt) oraz kalendarz Cal.com (Rezerwacja) NIE wyświetlą
się w oknie podglądu edytora (sandbox blokuje zewnętrzne osadzenia).
Na wgranej, prawdziwej stronie działają normalnie.

DOKUMENTY PRAWNE
----------------
Polityka prywatności i oba regulaminy to standardowe szablony — przed
publikacją warto, by przejrzał je prawnik (zwłaszcza zapisy o
odpowiedzialności, reklamacjach i prawach autorskich).

UWAGI
-----
• Dane kontaktowe, ceny i treści można edytować bezpośrednio w plikach HTML.
• Adres administratora w dokumentach (ul. Dzikich Jabłoni 4/2) to siedziba
  firmy; adres gabinetu na stronie to ul. Jana Długosza 10 m. 22 — to celowe.
