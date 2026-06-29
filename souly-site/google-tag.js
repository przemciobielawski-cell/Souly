// ════════════════════════════════════════════════════════════════════
//  Souly — Google tag (gtag.js) z Google Consent Mode v2
//  • Tag jest obecny na KAŻDEJ stronie od razu (Google go wykrywa).
//  • Domyślnie zgoda = „denied” → BRAK cookies / śledzenia przed akceptacją.
//  • Baner cookies (cookie-consent.js) po kliknięciu „Akceptuję” wywołuje
//    gtag('consent','update', …'granted') i dopiero wtedy startuje pomiar.
//  Ten plik musi być wczytany w <head>, PRZED cookie-consent.js.
// ════════════════════════════════════════════════════════════════════
(function () {
  var GA_ID = "G-83MPZPSR41"; // ← identyfikator GA4 (Souly)

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // 1) Domyślne zgody — wszystko odmówione do czasu decyzji użytkownika
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  // 2) Jeśli użytkownik już wcześniej zaakceptował — od razu podnieś zgodę,
  //    żeby pomiar działał bez czekania na ponowne kliknięcie.
  try {
    if (localStorage.getItem("souly_cookie_consent") === "all") {
      gtag("consent", "update", { analytics_storage: "granted" });
    }
  } catch (e) {}

  // 3) Inicjalizacja tagu (obecny na stronie niezależnie od zgody)
  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });

  // 4) Wczytanie biblioteki gtag.js
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
})();
