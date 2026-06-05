// ════════════════════════════════════════════════════════════════════
//  Souly — baner zgody na pliki cookies (RODO / ePrivacy)
//  • pokazuje się przy pierwszej wizycie
//  • Google Analytics ładuje się DOPIERO po kliknięciu "Akceptuję"
//  • wybór zapamiętywany w przeglądarce (localStorage)
//  • link "Ustawienia plików cookies" w stopce otwiera baner ponownie
//
//  KONFIGURACJA: wpisz swój identyfikator Google Analytics poniżej.
//  Dopóki widnieje "G-XXXXXXXXXX", analityka NIE jest ładowana
//  (baner działa, ale nie uruchamia żadnych skryptów zewnętrznych).
// ════════════════════════════════════════════════════════════════════
(function () {
  var GA_ID = "G-83MPZPSR41";               // ← identyfikator GA4 (Souly)
  var STORE_KEY = "souly_cookie_consent";   // 'all' | 'essential'
  var POLICY_URL = "Polityka-prywatnosci.html";

  function getConsent() { try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(STORE_KEY, v); } catch (e) {} }

  // ---- Google Analytics (ładowane tylko po zgodzie) ----
  function loadGA() {
    if (!GA_ID || GA_ID.indexOf("G-XXXX") === 0) return; // brak realnego ID — nic nie ładuj
    if (window.__souly_ga_loaded) return;
    window.__souly_ga_loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }

  // ---- styles ----
  function injectStyles() {
    if (document.getElementById("souly-cookie-style")) return;
    var css = ''
      + '.souly-cookie{position:fixed;left:0;right:0;bottom:0;z-index:200;display:flex;justify-content:center;'
      + 'padding:16px clamp(14px,3vw,28px);pointer-events:none}'
      + '.souly-cookie .cc-card{pointer-events:auto;max-width:880px;width:100%;display:flex;align-items:center;gap:22px;'
      + 'background:rgba(247,241,227,.97);backdrop-filter:blur(12px);border:1px solid rgba(31,42,68,.14);'
      + 'border-radius:18px;padding:18px 22px;box-shadow:0 24px 60px -28px rgba(31,42,68,.55);'
      + 'transform:translateY(16px);opacity:0;transition:transform .5s cubic-bezier(.2,.7,.2,1),opacity .5s ease}'
      + '.souly-cookie.in .cc-card{transform:none;opacity:1}'
      + '.souly-cookie .cc-ico{flex:0 0 40px;width:40px;height:40px;border-radius:11px;background:rgba(92,107,60,.13);'
      + 'color:#5C6B3C;display:flex;align-items:center;justify-content:center}'
      + '.souly-cookie .cc-txt{flex:1;font-family:"Mulish",system-ui,sans-serif;font-size:13.5px;line-height:1.6;color:#1B2235}'
      + '.souly-cookie .cc-txt a{color:#5C6B3C;text-decoration:underline;text-underline-offset:2px}'
      + '.souly-cookie .cc-actions{display:flex;gap:10px;flex:0 0 auto}'
      + '.souly-cookie button{font-family:"Mulish",system-ui,sans-serif;font-size:13px;font-weight:600;cursor:pointer;'
      + 'border-radius:999px;padding:11px 18px;border:1px solid transparent;transition:all .2s;white-space:nowrap}'
      + '.souly-cookie .cc-ess{background:transparent;color:#3A4666;border-color:rgba(31,42,68,.2)}'
      + '.souly-cookie .cc-ess:hover{border-color:#5C6B3C;color:#5C6B3C}'
      + '.souly-cookie .cc-all{background:#1F2A44;color:#F7F1E3}'
      + '.souly-cookie .cc-all:hover{background:#5C6B3C}'
      + '@media(max-width:680px){.souly-cookie .cc-card{flex-direction:column;align-items:flex-start;gap:14px}'
      + '.souly-cookie .cc-actions{width:100%}.souly-cookie .cc-actions button{flex:1}}'
      + '@media(prefers-reduced-motion:reduce){.souly-cookie .cc-card{transition:none}}';
    var st = document.createElement("style");
    st.id = "souly-cookie-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ---- banner ----
  var bannerEl = null;
  function showBanner() {
    injectStyles();
    if (bannerEl) { requestAnimationFrame(function(){ bannerEl.classList.add("in"); }); return; }
    var wrap = document.createElement("div");
    wrap.className = "souly-cookie";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Zgoda na pliki cookies");
    wrap.innerHTML =
      '<div class="cc-card">'
      + '<div class="cc-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><circle cx="9" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1" fill="currentColor" stroke="none"/></svg></div>'
      + '<div class="cc-txt">Używamy plików cookies, aby strona działała poprawnie i&nbsp;— za Twoją zgodą — do anonimowych statystyk odwiedzin. Szczegóły w&nbsp;<a href="' + POLICY_URL + '">polityce prywatności</a>.</div>'
      + '<div class="cc-actions">'
      + '<button class="cc-ess" type="button">Tylko niezbędne</button>'
      + '<button class="cc-all" type="button">Akceptuję</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(wrap);
    bannerEl = wrap;
    wrap.querySelector(".cc-all").addEventListener("click", function () { setConsent("all"); loadGA(); hideBanner(); });
    wrap.querySelector(".cc-ess").addEventListener("click", function () { setConsent("essential"); hideBanner(); });
    requestAnimationFrame(function(){ wrap.classList.add("in"); });
  }
  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove("in");
    var el = bannerEl;
    setTimeout(function(){ if (el && el.parentNode) el.parentNode.removeChild(el); if (el === bannerEl) bannerEl = null; }, 500);
  }

  // ---- public API: reopen settings (used by footer link) ----
  window.soulyCookies = {
    open: function () { showBanner(); },
    reset: function () { try { localStorage.removeItem(STORE_KEY); } catch (e) {} showBanner(); }
  };

  // ---- init ----
  function init() {
    var c = getConsent();
    if (c === "all") { loadGA(); }
    else if (c === "essential") { /* nic nie ładujemy */ }
    else { showBanner(); } // brak decyzji → pokaż baner

    // podłącz linki "Ustawienia plików cookies" w stopkach (jeśli są)
    var links = document.querySelectorAll("[data-cookie-settings]");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (e) { e.preventDefault(); window.soulyCookies.open(); });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
