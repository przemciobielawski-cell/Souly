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
  hero-bg.mp4       → film w tle sekcji hero (intro)
  team-anna.png     → zdjęcie: Anna Szarek-Bielawska
  team-agnieszka.png→ zdjęcie: Agnieszka Stelmach

JAK WDROŻYĆ
-----------
1. Wgraj CAŁY folder (z podfolderem assets/) na serwer, zachowując strukturę.
2. Plik startowy to index.html.
3. Wszystkie ścieżki są względne — wystarczy zwykły hosting plików statycznych
   (hosting WWW, Netlify, Vercel, GitHub Pages itp.). Bez konfiguracji serwera.
4. Czcionki (Bodoni Moda, Mulish) oraz kalendarz Cal.com ładują się z internetu
   — wymagane jest połączenie sieciowe u odwiedzającego.

REZERWACJA (CAL.COM)
--------------------
• Rezerwacja działa przez Cal.com — pacjent NIE zakłada konta. Wybiera termin,
  podaje imię i e-mail, dostaje potwierdzenie. Specjalistki logują się do
  swojego panelu na cal.com (dostępność, kalendarz, przypomnienia).

• Podłączone linki znajdziesz w pliku Rezerwacja.html, w sekcji "CAL"
  (na górze skryptu). Obecnie ustawione:
      Anna Szarek-Bielawska → anna-szarek-bielawska-voov4l   (aktywny)
      Agnieszka Stelmach    → WSTAW-LINK                     (do uzupełnienia)

• Aby dodać/zmienić link: otwórz Rezerwacja.html, znajdź sekcję CAL i wpisz
  część adresu po "cal.com/", np.  agnieszka: "souly/konsultacja-rodzice".
  Dopóki widnieje "WSTAW-LINK", zakładka tej osoby pokazuje komunikat
  "Kalendarz wkrótce" zamiast kalendarza.

• UWAGA: kalendarz Cal.com NIE wyświetli się w oknie podglądu edytora
  (sandbox blokuje zewnętrzne osadzenia). Na wgranej, prawdziwej stronie
  działa normalnie — sprawdź po opublikowaniu na hostingu.

UWAGI
-----
• Dane kontaktowe, ceny i treści można edytować bezpośrednio w plikach HTML.
