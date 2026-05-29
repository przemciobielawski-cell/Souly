SOULY — strona gabinetu (pliki do wdrożenia)
=============================================

ZAWARTOŚĆ
---------
index.html          → strona główna (one-page: hero z filmem, O nas, Zespół,
                      Podejście, Obszary, Usługi/cennik, Kontakt)
Rejestracja.html    → panel rejestracji/logowania + rezerwacja wizyt
                      (widok pacjenta i specjalisty)
booking-app.jsx     → logika panelu rezerwacji (ładowana przez Rejestracja.html)
tweaks-app.jsx      → panel "Tweaks" strony głównej (paleta, tempo filmu itp.)
tweaks-panel.jsx    → komponenty pomocnicze panelu Tweaks
assets/
  hero-bg.mp4       → film w tle sekcji hero (intro)
  team-anna.png     → zdjęcie: Anna Szarek-Bielawska
  team-agnieszka.png→ zdjęcie: Agnieszka Stelmach

JAK WDROŻYĆ
-----------
1. Wgraj CAŁY folder (z podfolderem assets/) na serwer, zachowując strukturę.
2. Plik startowy to index.html.
3. Wszystkie ścieżki są względne — nie wymaga żadnej konfiguracji serwera.
   Wystarczy zwykły hosting plików statycznych (np. hosting WWW, Netlify,
   Vercel, GitHub Pages itp.).
4. Czcionki (Bodoni Moda, Mulish) i biblioteka React ładują się z internetu
   (Google Fonts / unpkg) — wymagane jest połączenie sieciowe u odwiedzającego.

UWAGI
-----
• Panel rezerwacji to wersja DEMONSTRACYJNA. Konta, logowanie społecznościowe
  (Google/Facebook/Instagram) oraz rezerwacje są symulowane i zapisują się
  wyłącznie w przeglądarce użytkownika (localStorage). Do działania "na żywo"
  (prawdziwe konta, wspólny kalendarz, powiadomienia) potrzebny jest backend
  i prawdziwa autoryzacja OAuth.
• Dane kontaktowe, ceny i treści można edytować bezpośrednio w plikach HTML.
