SOULY — strona gabinetu (pliki do wdrożenia)
=============================================

ZAWARTOŚĆ
---------
index.html          → strona główna (one-page: hero z filmem, O nas, Zespół,
                      Podejście, Obszary, Usługi/cennik, Kontakt)
Rezerwacja.html     → podstrona rezerwacji z osadzonym kalendarzem Cal.com
tweaks-app.jsx      → panel "Tweaks" strony głównej (paleta, tempo filmu itp.)
tweaks-panel.jsx    → komponenty pomocnicze panelu Tweaks
assets/
  hero-bg.mp4         → film w tle sekcji hero (intro)
  team-anna.png       → zdjęcie: Anna Szarek-Bielawska
  team-agnieszka.png  → zdjęcie: Agnieszka Stelmach
  favicon.svg         → ikona strony (karta przeglądarki)
  favicon-32.png      → ikona zapasowa (starsze przeglądarki)
  apple-touch-icon.png→ ikona na ekranie głównym iPhone/iPad

JAK WDROŻYĆ
-----------
1. Wgraj CAŁY folder (z podfolderem assets/) na serwer, zachowując strukturę.
2. Plik startowy to index.html.
3. Wszystkie ścieżki są względne — wystarczy zwykły hosting plików statycznych
   (hosting WWW, Netlify, Vercel, GitHub Pages itp.). Bez konfiguracji serwera.
4. Czcionki (Bodoni Moda, Mulish) oraz kalendarz Cal.com ładują się z internetu
   — wymagane jest połączenie sieciowe u odwiedzającego.

Pełna instrukcja krok-po-kroku (Netlify + domena) jest w pliku JAK-WGRAC.txt
z poprzedniej paczki — jeśli go nie masz, poproś o ponowne wygenerowanie.

REZERWACJA (CAL.COM)
--------------------
• Rezerwacja działa przez Cal.com — pacjent NIE zakłada konta. Wybiera termin,
  podaje imię i e-mail, dostaje potwierdzenie. Specjalistki logują się do
  swojego panelu na cal.com (dostępność, kalendarz, przypomnienia).

• Podłączone linki są w pliku Rezerwacja.html, w sekcji "CAL" (góra skryptu):
      Anna Szarek-Bielawska → anna-szarek-bielawska-voov4l   (aktywny)
      Agnieszka Stelmach    → WSTAW-LINK                     (do uzupełnienia)

• UWAGA: kalendarz Cal.com NIE wyświetli się w oknie podglądu edytora
  (sandbox blokuje zewnętrzne osadzenia). Na wgranej, prawdziwej stronie
  działa normalnie — sprawdź po opublikowaniu na hostingu.

CO NOWEGO W TEJ WERSJI
----------------------
• Dodano favicon (ikona strony) i ikonę na ekran główny telefonu.
• Hero: poprawiony opis (lepsze rozumienie siebie; podejścia oparte
  na uważności i akceptacji), "online" pisane małą literą.
• Sekcja "O nas": nagłówek "...i przede wszystkim człowiek",
  pogrubione "bezpieczną i profesjonalną przestrzeń",
  większy odstęp przed cytatem.
• Fundament pracy: rozwinięte skróty CBT i MBCT, "Superwizja" bez "własna".
• Zaktualizowane zdjęcie Anny Szarek-Bielawskiej.

UWAGI
-----
• Dane kontaktowe, ceny i treści można edytować bezpośrednio w plikach HTML.
