SOULY — strona gabinetu (pliki do wdrożenia)
=============================================

ZAWARTOŚĆ
---------
index.html               → strona główna (hero z filmem, O nas, Zespół,
                           Podejście, Obszary, Usługi/cennik, Kontakt z mapą)
Rezerwacja.html          → podstrona rezerwacji z kalendarzem Cal.com
Polityka-prywatnosci.html→ podstrona z polityką prywatności (RODO)
tweaks-app.jsx           → panel "Tweaks" strony głównej
tweaks-panel.jsx         → komponenty pomocnicze panelu Tweaks
assets/
  hero-bg.mp4            → film w tle sekcji hero (intro)
  team-anna.png         → zdjęcie: Anna Szarek-Bielawska
  team-agnieszka.png    → zdjęcie: Agnieszka Stelmach
  favicon.svg / favicon-32.png / apple-touch-icon.png → ikony strony

JAK WDROŻYĆ
-----------
1. Wgraj zawartość folderu do GŁÓWNEGO katalogu serwera/repozytorium,
   zachowując strukturę (folder assets/ w środku).
   WAŻNE (GitHub Pages / Railway): pliki muszą być w korzeniu, nie w
   zagnieżdżonym podfolderze — index.html ma być na samej górze.
2. Plik startowy to index.html.
3. Strona jest statyczna — działa na GitHub Pages, Netlify, Vercel,
   Cloudflare Pages lub zwykłym hostingu WWW. Bez konfiguracji serwera.
4. Czcionki (Bodoni Moda, Mulish), kalendarz Cal.com oraz mapa Google
   ładują się z internetu.

REZERWACJA (CAL.COM)
--------------------
• Rezerwacja działa przez Cal.com — pacjent NIE zakłada konta.
• Linki są w pliku Rezerwacja.html, sekcja "CAL" (góra skryptu):
      Anna Szarek-Bielawska → anna-szarek-bielawska-voov4l   (aktywny)
      Agnieszka Stelmach    → WSTAW-LINK                     (do uzupełnienia)
• ZGODY (checkboxy "zapoznałem się z..."): dodaje się PO STRONIE Cal.com,
  w ustawieniach Event Type → Advanced → Booking questions → pole typu
  Checkbox, oznaczone jako Required. Tam też można wstawić linki do
  polityki prywatności i regulaminu.

MAPA I KALENDARZ — PODGLĄD
--------------------------
• Mapa Google (sekcja Kontakt) i kalendarz Cal.com NIE wyświetlą się
  w oknie podglądu edytora (sandbox blokuje zewnętrzne osadzenia).
  Na wgranej, prawdziwej stronie działają normalnie.

CO NOWEGO W TEJ WERSJI
----------------------
• Sekcja Kontakt: dodana mapa Google (ul. Jana Długosza 10, Warszawa)
  z etykietą adresu i przyciskiem "Wyznacz trasę".
• Nowa podstrona: Polityka prywatności (link w stopce strony głównej).
• Sekcja Podejście: nowe treści kafelków I–IV, tytuły wyśrodkowane,
  teksty wycentrowane w pozostałej przestrzeni.
• Sekcja Obszary pracy: nowy nagłówek, podtytuł i ułożenie 9 trudności
  (czytanie pionowe w 3 kolumnach na desktopie).
• Cennik: karta "Psychoterapia indywidualna" — "Regularne spotkania",
  "Stałe miejsce w grafiku".
• Zaktualizowane zdjęcie Anny Szarek-Bielawskiej.

DO ZROBIENIA / OPCJONALNIE
--------------------------
• Uzupełnić link Cal.com dla Agnieszki Stelmach.
• Rozważyć dodanie regulaminu / zasad współpracy (osobna podstrona).
• Dodać zgody (checkboxy) w ustawieniach Cal.com.

UWAGI
-----
• Dane kontaktowe, ceny i treści można edytować bezpośrednio w plikach HTML.
