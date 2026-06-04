// ════════════════════════════════════════════════════════════════════
//  Souly — popup z testem uważności emocjonalnej „Jak blisko jesteś ze sobą?”
//  • wyzwalany przy przewinięciu do sekcji „Obszary pracy” (#obszary)
//  • pokazywany automatycznie raz (zapamiętane w przeglądarce)
//  • pływający przycisk pozwala otworzyć test ponownie
//  • krok po kroku: pytanie → wynik (3 progi) → CTA do rezerwacji
//
//  EDYCJA TREŚCI: pytania i opisy wyników znajdziesz w tablicach
//  QUESTIONS i RESULTS poniżej.
// ════════════════════════════════════════════════════════════════════
(function () {
  "use strict";

  var SEEN_KEY = "souly_selftest_seen";

  // ---- Pytania (skala 1–5), pogrupowane w 4 obszary ----
  var QUESTIONS = [
    { area: "Kontakt z własnymi emocjami", text: "Potrafię rozpoznać, co naprawdę przeżywam w danym momencie — nawet jeśli emocje są trudne lub niejednoznaczne." },
    { area: "Kontakt z własnymi emocjami", text: "Nie ignoruję własnych potrzeb emocjonalnych, żeby „po prostu funkcjonować”." },
    { area: "Kontakt z własnymi emocjami", text: "Mam przestrzeń, by zatrzymać się i zauważyć swoje emocje, zamiast od razu je tłumić lub analizować." },
    { area: "Kontakt z własnymi emocjami", text: "Gdy czuję napięcie, potrafię określić, z czego ono wynika." },

    { area: "Relacja ze sobą", text: "Traktuję siebie z taką samą życzliwością, jaką okazuję bliskim osobom." },
    { area: "Relacja ze sobą", text: "Nie mam poczucia, że ciągle muszę bardziej się starać, by być wystarczająco dobrym/dobrą." },
    { area: "Relacja ze sobą", text: "Potrafię odpoczywać bez poczucia winy." },
    { area: "Relacja ze sobą", text: "Moje poczucie własnej wartości nie zależy od opinii innych ludzi." },

    { area: "Uważność i przeciążenie", text: "Na co dzień funkcjonuję raczej świadomie niż „automatycznie”." },
    { area: "Uważność i przeciążenie", text: "Podczas odpoczynku potrafię być tu i teraz, zamiast myśleć o tym, co było lub co ma się wydarzyć." },
    { area: "Uważność i przeciążenie", text: "Gdy ciało wysyła sygnały przeciążenia, nie ignoruję ich." },
    { area: "Uważność i przeciążenie", text: "Potrafię zauważyć moment, w którym potrzebuję zatrzymania lub regeneracji." },

    { area: "Relacje i granice", text: "Nie mam trudności z odmawianiem, szczególnie gdy coś przekracza moje granice." },
    { area: "Relacje i granice", text: "Czuję się bezpiecznie, mówiąc innym o swoich potrzebach." },
    { area: "Relacje i granice", text: "Nie dostosowuję się do innych kosztem siebie." },
    { area: "Relacje i granice", text: "Mam relacje, w których mogę być autentycznie sobą." }
  ];

  var SCALE = [
    { v: 1, label: "zdecydowanie nie" },
    { v: 2, label: "raczej nie" },
    { v: 3, label: "czasami" },
    { v: 4, label: "raczej tak" },
    { v: 5, label: "zdecydowanie tak" }
  ];

  // ---- Progi wyników (suma 16–80) ----
  var RESULTS = [
    {
      min: 16, max: 35,
      title: "Funkcjonuję, ale jestem daleko od siebie",
      body: "Prawdopodobnie od dłuższego czasu działasz przede wszystkim w trybie przetrwania: wypełniasz obowiązki, reagujesz na potrzeby innych i „dajesz radę”. Kontakt z własnymi emocjami i potrzebami osłabia przeciążenie, napięcie lub życie w chronicznym stresie. To nie oznacza słabości — czasem organizm po prostu adaptuje się do zbyt długiego wysiłku. Nie potrzebujesz większej motywacji, lecz zatrzymania i regeneracji."
    },
    {
      min: 36, max: 60,
      title: "Jestem w drodze do większej równowagi",
      body: "Prawdopodobnie masz już pewną świadomość siebie i swoich emocji, ale nie zawsze udaje Ci się pozostać w kontakcie ze sobą na co dzień. Doświadczasz wewnętrznego napięcia między potrzebą odpoczynku a presją działania, między autentycznością a dostosowywaniem się do innych. To dobry moment, by pogłębić relację ze sobą — spokojnie, bez narzucania sobie presji."
    },
    {
      min: 61, max: 80,
      title: "Mam uważny kontakt ze sobą",
      body: "Prawdopodobnie potrafisz zauważać swoje emocje, granice i potrzeby oraz reagować na nie z większą świadomością. Nie oznacza to braku trudności — raczej zdolność do bycia ze sobą również wtedy, gdy pojawia się napięcie czy niepewność. Uważność wobec siebie nie jest stanem idealnym. To relacja, którą buduje się każdego dnia, czasem zaczynając od nowa."
    }
  ];

  var CTA_COPY = "Czasem już samo zatrzymanie się przy własnych odpowiedziach jest początkiem zmiany. Jeśli czujesz, że chcesz lepiej zrozumieć siebie, swoje emocje lub relacje — psychoterapia może stać się bezpieczną przestrzenią do tego procesu.";
  var DISCLAIMER = "Ten test ma charakter wyłącznie informacyjny i służy autorefleksji — nie jest narzędziem diagnostycznym ani nie zastępuje konsultacji ze specjalistą.";

  // ---------------------------------------------------------------
  var answers = new Array(QUESTIONS.length).fill(null);
  var current = 0; // 0 = intro screen handled separately
  var overlay, modal, bodyEl, fab;

  function seen() { try { return localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) {} }

  // ---- styles ----
  function injectStyles() {
    if (document.getElementById("souly-selftest-style")) return;
    var css =
      '.st-overlay{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;'
      + 'background:rgba(20,26,42,.55);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;visibility:hidden;'
      + 'transition:opacity .4s ease,visibility 0s linear .4s}'
      + '.st-overlay.open{opacity:1;visibility:visible;transition:opacity .4s ease}'
      + '.st-modal{position:relative;width:100%;max-width:560px;max-height:92vh;display:flex;flex-direction:column;'
      + 'background:#F7F1E3;border-radius:26px;box-shadow:0 40px 90px -30px rgba(20,26,42,.6);overflow:hidden;'
      + 'transform:translateY(22px) scale(.98);opacity:0;transition:transform .55s cubic-bezier(.2,.7,.2,1),opacity .55s ease}'
      + '.st-overlay.open .st-modal{transform:none;opacity:1}'
      + '.st-close{position:absolute;top:15px;right:15px;z-index:6;width:38px;height:38px;border-radius:50%;background:rgba(31,42,68,.07);'
      + 'color:#1F2A44;font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:background .2s}'
      + '.st-close:hover{background:rgba(31,42,68,.15)}'
      + '.st-body{padding:46px 42px 42px;overflow-y:auto;font-family:"Mulish",system-ui,sans-serif;color:#1B2235}'
      + '@media(max-width:520px){.st-body{padding:42px 24px 28px}}'
      + '.st-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.16em;'
      + 'text-transform:uppercase;color:#5C6B3C;margin-bottom:16px}'
      + '.st-eyebrow::before{content:"";width:24px;height:1px;background:#5C6B3C}'
      + '.st-title{font-family:"Bodoni Moda","Times New Roman",serif;font-weight:400;font-size:clamp(30px,5vw,40px);line-height:1.08;color:#1F2A44;letter-spacing:-.01em}'
      + '.st-title .it{font-style:italic;color:#5C6B3C}'
      + '.st-sub{font-size:14.5px;color:rgba(27,34,53,.62);margin-top:12px;line-height:1.6}'
      + '.st-scalekey{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 6px}'
      + '.st-scalekey span{font-size:11.5px;color:#3A4666;background:#EFE6D2;border:1px solid rgba(31,42,68,.1);border-radius:999px;padding:5px 11px}'
      + '.st-note{margin-top:22px;background:#EFE6D2;border:1px solid rgba(31,42,68,.1);border-left:3px solid #5C6B3C;'
      + 'border-radius:12px;padding:14px 16px;font-size:12.5px;color:rgba(27,34,53,.72);line-height:1.6}'
      + '.st-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;width:100%;margin-top:24px;padding:15px;'
      + 'border-radius:13px;background:#1F2A44;color:#F7F1E3;font-size:14.5px;font-weight:700;border:none;cursor:pointer;'
      + 'font-family:"Mulish",system-ui,sans-serif;transition:background .25s,transform .25s}'
      + '.st-btn:hover{background:#5C6B3C;transform:translateY(-1px)}'
      // quiz
      + '.st-qhead{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px}'
      + '.st-area{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#5C6B3C}'
      + '.st-count{font-family:"Bodoni Moda",serif;font-style:italic;font-size:15px;color:rgba(27,34,53,.55)}'
      + '.st-track{height:4px;border-radius:999px;background:#E4D7BC;overflow:hidden;margin-bottom:30px}'
      + '.st-fill{height:100%;background:#5C6B3C;border-radius:999px;width:0;transition:width .5s cubic-bezier(.2,.7,.2,1)}'
      + '.st-question{font-family:"Bodoni Moda","Times New Roman",serif;font-weight:400;font-size:clamp(22px,3.2vw,28px);'
      + 'line-height:1.28;color:#1F2A44;min-height:118px}'
      + '.st-scale{display:flex;gap:10px;margin-top:26px}'
      + '.st-scale button{flex:1;aspect-ratio:1;border-radius:14px;border:1px solid rgba(31,42,68,.16);background:#fff;'
      + 'font-family:"Bodoni Moda",serif;font-size:20px;color:#1F2A44;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center}'
      + '.st-scale button:hover{border-color:#5C6B3C;transform:translateY(-2px)}'
      + '.st-scale button.sel{background:#1F2A44;color:#F7F1E3;border-color:#1F2A44}'
      + '.st-ends{display:flex;justify-content:space-between;margin-top:10px;font-size:11.5px;color:rgba(27,34,53,.55)}'
      + '.st-back{margin-top:24px;background:none;border:none;cursor:pointer;color:rgba(27,34,53,.55);font-size:13px;'
      + 'font-family:"Mulish",sans-serif;font-weight:600;display:inline-flex;align-items:center;gap:7px;padding:4px 0;transition:color .2s}'
      + '.st-back:hover{color:#1F2A44}'
      // result
      + '.st-rmeter{display:flex;gap:6px;margin-bottom:22px}'
      + '.st-rmeter i{flex:1;height:6px;border-radius:999px;background:#E4D7BC}'
      + '.st-rmeter i.on{background:#5C6B3C}'
      + '.st-rscore{font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5C6B3C;margin-bottom:8px}'
      + '.st-rbody{font-size:15px;color:#1B2235;line-height:1.72;margin-top:16px}'
      + '.st-cta{margin-top:24px;padding-top:22px;border-top:1px solid rgba(31,42,68,.12);font-size:14.5px;color:rgba(27,34,53,.72);line-height:1.7}'
      + '.st-retake{margin-top:14px;background:none;border:none;cursor:pointer;color:rgba(27,34,53,.5);font-size:12.5px;'
      + 'font-family:"Mulish",sans-serif;text-decoration:underline;text-underline-offset:2px;display:block;text-align:center;width:100%}'
      + '.st-retake:hover{color:#5C6B3C}'
      + '.st-screen{animation:stFade .45s ease both}'
      + '@keyframes stFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
      // FAB
      + '.st-fab{position:fixed;left:20px;bottom:20px;z-index:120;display:inline-flex;align-items:center;gap:9px;padding:12px 18px;'
      + 'border-radius:999px;background:#1F2A44;color:#F7F1E3;font-size:13px;font-weight:700;border:none;cursor:pointer;'
      + 'font-family:"Mulish",sans-serif;box-shadow:0 16px 34px -16px rgba(20,26,42,.7);transform:translateY(20px);opacity:0;'
      + 'visibility:hidden;transition:all .4s ease}'
      + '.st-fab.show{transform:none;opacity:1;visibility:visible}'
      + '.st-fab:hover{background:#5C6B3C;transform:translateY(-2px)}'
      + '@media(max-width:520px){.st-fab{left:14px;bottom:14px;font-size:12px;padding:11px 15px}}'
      + '@media(prefers-reduced-motion:reduce){.st-overlay,.st-modal,.st-fill,.st-screen,.st-fab,.st-btn,.st-scale button{transition:none!important;animation:none!important}}';
    var st = document.createElement("style");
    st.id = "souly-selftest-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ---- build shell ----
  function buildShell() {
    overlay = document.createElement("div");
    overlay.className = "st-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Test uważności emocjonalnej");
    modal = document.createElement("div");
    modal.className = "st-modal";
    var close = document.createElement("button");
    close.className = "st-close";
    close.setAttribute("aria-label", "Zamknij test");
    close.innerHTML = "&times;";
    close.addEventListener("click", closeModal);
    bodyEl = document.createElement("div");
    bodyEl.className = "st-body";
    modal.appendChild(close);
    modal.appendChild(bodyEl);
    overlay.appendChild(modal);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
    });
  }

  function esc(s) { return s; }

  // ---- screens ----
  function renderIntro() {
    bodyEl.innerHTML =
      '<div class="st-screen">'
      + '<div class="st-eyebrow">Krótki test · ok. 2 minuty</div>'
      + '<h2 class="st-title">Jak blisko jesteś <span class="it">ze sobą?</span></h2>'
      + '<p class="st-sub">Test uważności emocjonalnej. Przeczytaj każde stwierdzenie i zaznacz odpowiedź, która najlepiej opisuje Twoje doświadczenie z ostatnich kilku tygodni.</p>'
      + '<div class="st-scalekey"><span>1 — zdecydowanie nie</span><span>3 — czasami</span><span>5 — zdecydowanie tak</span></div>'
      + '<div class="st-note">' + DISCLAIMER + '</div>'
      + '<button class="st-btn" id="stStart">Rozpocznij test'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>'
      + '</div>';
    bodyEl.querySelector("#stStart").addEventListener("click", function () { current = 0; renderQuestion(); });
    bodyEl.scrollTop = 0;
  }

  function renderQuestion() {
    var q = QUESTIONS[current];
    var total = QUESTIONS.length;
    var pct = ((current) / total) * 100;
    var html =
      '<div class="st-screen">'
      + '<div class="st-qhead"><span class="st-area">' + q.area + '</span>'
      + '<span class="st-count">' + (current + 1) + ' / ' + total + '</span></div>'
      + '<div class="st-track"><div class="st-fill" style="width:' + pct + '%"></div></div>'
      + '<div class="st-question">' + q.text + '</div>'
      + '<div class="st-scale">';
    for (var i = 0; i < SCALE.length; i++) {
      var sel = answers[current] === SCALE[i].v ? " sel" : "";
      html += '<button class="' + ("st-opt" + sel) + '" data-v="' + SCALE[i].v + '">' + SCALE[i].v + '</button>';
    }
    html += '</div>'
      + '<div class="st-ends"><span>zdecydowanie nie</span><span>zdecydowanie tak</span></div>'
      + '<button class="st-back" id="stBack"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>'
      + (current === 0 ? "Wróć do wstępu" : "Poprzednie pytanie") + '</button>'
      + '</div>';
    bodyEl.innerHTML = html;
    // animate fill to next step shortly after mount
    var fill = bodyEl.querySelector(".st-fill");
    requestAnimationFrame(function () { fill.style.width = (((current + (answers[current] ? 1 : 0)) / total) * 100) + "%"; });

    var btns = bodyEl.querySelectorAll(".st-scale button");
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener("click", function () {
        var v = parseInt(this.getAttribute("data-v"), 10);
        answers[current] = v;
        for (var k = 0; k < btns.length; k++) btns[k].classList.remove("sel");
        this.classList.add("sel");
        fill.style.width = (((current + 1) / total) * 100) + "%";
        setTimeout(function () {
          if (current < total - 1) { current++; renderQuestion(); }
          else renderResult();
        }, 300);
      });
    }
    bodyEl.querySelector("#stBack").addEventListener("click", function () {
      if (current === 0) renderIntro();
      else { current--; renderQuestion(); }
    });
    bodyEl.scrollTop = 0;
  }

  function renderResult() {
    var sum = answers.reduce(function (a, b) { return a + (b || 0); }, 0);
    var band = RESULTS[0], idx = 0;
    for (var i = 0; i < RESULTS.length; i++) {
      if (sum >= RESULTS[i].min && sum <= RESULTS[i].max) { band = RESULTS[i]; idx = i; }
    }
    var meter = "";
    for (var m = 0; m < 3; m++) meter += '<i class="' + (m <= idx ? "on" : "") + '"></i>';
    bodyEl.innerHTML =
      '<div class="st-screen">'
      + '<div class="st-eyebrow">Twój wynik</div>'
      + '<div class="st-rmeter">' + meter + '</div>'
      + '<div class="st-rscore">' + sum + ' / 80 punktów</div>'
      + '<h2 class="st-title">' + band.title + '</h2>'
      + '<p class="st-rbody">' + band.body + '</p>'
      + '<div class="st-cta">' + CTA_COPY + '</div>'
      + '<a class="st-btn" href="Rezerwacja.html">Umów konsultację'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>'
      + '<button class="st-retake" id="stRetake">Rozwiąż test ponownie</button>'
      + '<div class="st-note" style="margin-top:18px">' + DISCLAIMER + '</div>'
      + '</div>';
    bodyEl.querySelector("#stRetake").addEventListener("click", function () {
      answers = new Array(QUESTIONS.length).fill(null);
      current = 0;
      renderIntro();
    });
    bodyEl.scrollTop = 0;
  }

  // ---- open / close ----
  function openModal(reset) {
    if (reset) { answers = new Array(QUESTIONS.length).fill(null); current = 0; }
    renderIntro();
    overlay.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  }
  function closeModal() {
    overlay.classList.remove("open");
    document.documentElement.style.overflow = "";
    markSeen();
    revealFab();
  }

  // ---- floating reopen button ----
  function buildFab() {
    fab = document.createElement("button");
    fab.className = "st-fab";
    fab.setAttribute("aria-label", "Otwórz test uważności");
    fab.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l1.9 4.6L18.5 9l-3.5 3 1 5L12 14.8 8 17l1-5L5.5 9l4.6-1.4z"/></svg>'
      + 'Test: jak blisko jesteś ze sobą?';
    fab.addEventListener("click", function () { openModal(true); hideFab(); });
    document.body.appendChild(fab);
  }
  var fabVisible = false;
  function revealFab() { if (fab) { fab.classList.add("show"); fabVisible = true; } }
  function hideFab() { if (fab) { fab.classList.remove("show"); fabVisible = false; } }

  // ---- trigger ----
  function init() {
    injectStyles();
    buildShell();
    buildFab();

    var section = document.getElementById("obszary");

    if (seen()) {
      // returning visitor: just offer the FAB after they scroll past the hero
      var onScroll = function () {
        if (window.scrollY > window.innerHeight * 0.6) { revealFab(); window.removeEventListener("scroll", onScroll); }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return;
    }

    if (!section || !("IntersectionObserver" in window)) {
      // fallback: show after scrolling halfway
      var fb = function () {
        if (window.scrollY > window.innerHeight * 0.5) { openModal(true); window.removeEventListener("scroll", fb); }
      };
      window.addEventListener("scroll", fb, { passive: true });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !seen()) {
          openModal(true);
          io.disconnect();
        }
      });
    }, { threshold: 0.25 });
    io.observe(section);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
