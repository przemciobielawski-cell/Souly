// Souly — booking + auth prototype
const { useState, useEffect, useMemo, useCallback } = React;

/* ───────── storage helpers ───────── */
const LS_USER = 'souly_user';
const LS_BOOK = 'souly_bookings';
const LS_AVAIL = 'souly_availability'; // explicit open/closed overrides set by specjalista
const LS_HOURS = 'souly_workhours'; // fixed working hours per therapist + weekday
const loadUser = () => { try { return JSON.parse(localStorage.getItem(LS_USER)); } catch(e){ return null; } };
const loadBookings = () => { try { return JSON.parse(localStorage.getItem(LS_BOOK)) || []; } catch(e){ return []; } };
const loadAvail = () => { try { return JSON.parse(localStorage.getItem(LS_AVAIL)) || {}; } catch(e){ return {}; } };
const loadHours = () => { try { return JSON.parse(localStorage.getItem(LS_HOURS)) || {}; } catch(e){ return {}; } };

/* ───────── date helpers ───────── */
const TODAY = new Date(2026, 4, 29); // 29 May 2026 (months 0-indexed)
TODAY.setHours(0,0,0,0);
const DOW = ['Niedz','Pon','Wt','Śr','Czw','Pt','Sob'];
const MON = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
const MON_SHORT = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
// Monday of the week containing d
const mondayOf = (d) => { const x = new Date(d); const wd = (x.getDay()+6)%7; return addDays(x, -wd); };

const THERAPISTS = [
  { id:'anna', name:'Anna Szarek-Bielawska', role:'Psycholożka · psychoterapeutka', img:'assets/team-anna.png' },
  { id:'agnieszka', name:'Agnieszka Stelmach', role:'Konsultacje dla rodziców', img:'assets/team-agnieszka.png' },
];

// Deterministic pseudo-random so "busy" slots are stable per day/therapist/time
function seeded(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return ((h>>>0)%1000)/1000; }

const BASE_TIMES = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];
// Slots offered per weekday (0=Sun..6=Sat). Weekends closed.
function timesForDay(date, therapistId){
  const wd = date.getDay();
  if (wd===0 || wd===6) return [];
  // Anna works Mon–Fri; Agnieszka Tue/Thu only (consultations)
  if (therapistId==='agnieszka' && !(wd===2 || wd===4)) return [];
  // Vary the offered window a bit by weekday
  if (wd===1) return BASE_TIMES.slice(2); // Monday starts later
  if (wd===5) return BASE_TIMES.slice(0,6); // Friday ends earlier
  return BASE_TIMES;
}

// Effective offered times: specjalista's fixed working hours override the default schedule.
// workHours shape: { [therapistId]: { [weekday 0-6]: ['09:00', ...] } }
function effectiveTimes(date, therapist, workHours){
  const wd = date.getDay();
  const wh = workHours && workHours[therapist];
  if (wh && wh[wd] !== undefined) {
    // Defined (possibly empty array = day off). Keep chronological order.
    return [...wh[wd]].sort();
  }
  return timesForDay(date, therapist);
}

/* ───────── shared availability + booking model ───────── */
const STAT_FROM = new Date(2026,6,1); // stationary visits bookable from 1 July 2026
const bookedKey = (d,t,th) => `${d}|${t}|${th}`;
const availKey  = (d,t,th) => `${th}|${d}|${t}`;
// Base (default) availability for a slot before any explicit override
function baseOpen(date, time, therapist){
  return seeded(ymd(date)+time+therapist) >= 0.45;
}
// Effective availability: explicit override wins, else the seeded default
function isOpen(avail, date, time, therapist){
  const k = availKey(ymd(date), time, therapist);
  return (k in avail) ? !!avail[k] : baseOpen(date, time, therapist);
}
// Find a booking occupying a slot (any source / any patient)
function findBooking(bookings, date, time, therapist){
  const ds = ymd(date);
  return bookings.find(b => b.date===ds && b.time===time && b.therapist===therapist) || null;
}
const SOURCE_LABEL = { online:'Online', telefon:'Telefon', osobiscie:'Osobiście' };

/* ═════════════ AUTH ═════════════ */
function GoogleIcon(){ return (
  <svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 7.1 29.5 5 24 5 16 5 9.1 9.5 6.3 14.7z" transform="translate(0 -2)"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 36 26.7 37 24 37c-5.3 0-9.6-3.4-11.3-8.1l-6.5 5C9 40.4 15.9 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.2 5.3C39.8 41 44 35 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
); }
function FacebookIcon(){ return (
  <svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6 4.39 10.97 10.13 11.87v-8.4H7.08v-3.47h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.47h-2.8v8.4C19.61 23.04 24 18.07 24 12.07z"/></svg>
); }

function AuthView({ onAuth }){
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState({});

  const social = (provider) => {
    const label = { google:'Google', facebook:'Facebook', instagram:'Instagram' }[provider];
    onAuth({ name: 'Pacjent', email: `konto@${provider}.com`, provider, label });
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (mode==='register' && !name.trim()) er.name = 'Podaj imię';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) er.email = 'Niepoprawny adres e-mail';
    if (pass.length < 6) er.pass = 'Min. 6 znaków';
    setErr(er);
    if (Object.keys(er).length) return;
    onAuth({ name: name.trim() || email.split('@')[0], email, provider:'email', label:'e-mail' });
  };

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="aside-mark"><span className="brand-dot"></span><span>Souly</span></div>
        <div className="aside-quote">
          <h2>Zadbaj o siebie — <span className="it">umów wizytę w kilka chwil.</span></h2>
          <p>Załóż konto, aby rezerwować terminy online, widzieć wolne godziny w czasie rzeczywistym i zarządzać swoimi wizytami w jednym miejscu.</p>
        </div>
        <div className="aside-feats">
          {[
            'Podgląd wolnych terminów obu specjalistek',
            'Rezerwacja i odwoływanie wizyt online',
            'Przypomnienia i historia spotkań',
          ].map((f,i)=>(
            <div className="aside-feat" key={i}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 6 9 17l-5-5"/></svg>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-eyebrow">{mode==='register' ? 'Załóż konto' : 'Witaj ponownie'}</div>
          <h1>{mode==='register' ? 'Szybka rejestracja' : 'Zaloguj się'}</h1>
          <p className="sub">{mode==='register' ? 'Wybierz najwygodniejszy sposób — zajmie to mniej niż minutę.' : 'Wpisz dane lub użyj konta społecznościowego.'}</p>

          <div className="social">
            <button className="social-btn" onClick={()=>social('google')}>
              <GoogleIcon/> Kontynuuj z Google
            </button>
            <button className="social-btn" onClick={()=>social('facebook')}>
              <FacebookIcon/> Kontynuuj z Facebookiem
            </button>
            <button className="social-btn" onClick={()=>social('instagram')}>
              <span className="ig-grad">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.5" r="1.2" fill="#fff" stroke="none"/></svg>
              </span>
              Kontynuuj z Instagramem
            </button>
          </div>

          <div className="divider">lub przez e-mail</div>

          <form onSubmit={submit} noValidate>
            {mode==='register' && (
              <div className={'field'+(err.name?' err':'')}>
                <label>Imię</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jak się do Ciebie zwracać?" />
                {err.name && <span className="errmsg">{err.name}</span>}
              </div>
            )}
            <div className={'field'+(err.email?' err':'')}>
              <label>Adres e-mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="twoj@email.pl" />
              {err.email && <span className="errmsg">{err.email}</span>}
            </div>
            <div className={'field'+(err.pass?' err':'')}>
              <label>Hasło</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Minimum 6 znaków" />
              {err.pass && <span className="errmsg">{err.pass}</span>}
            </div>
            <button type="submit" className="btn-primary">
              {mode==='register' ? 'Załóż konto i przejdź dalej' : 'Zaloguj się'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </form>

          <div className="switch">
            {mode==='register' ? 'Masz już konto? ' : 'Nie masz jeszcze konta? '}
            <button onClick={()=>{ setErr({}); setMode(mode==='register'?'login':'register'); }}>
              {mode==='register' ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
          </div>
          <p className="legal">Zakładając konto akceptujesz <a href="#">regulamin</a> i <a href="#">politykę prywatności</a>. To wersja demonstracyjna — dane zapisują się tylko w Twojej przeglądarce.</p>
        </div>
      </main>
    </div>
  );
}

/* ═════════════ BOOKING (PACJENT) ═════════════ */
function BookingView({ user, bookings, setBookings, availability, workHours, toast }){
  const [therapist, setTherapist] = useState('anna');
  const [format, setFormat] = useState('online'); // online | stacjonarnie
  const [weekStart, setWeekStart] = useState(() => mondayOf(TODAY));
  const [sel, setSel] = useState(null); // {date:'yyyy-mm-dd', time, label}
  const [confirming, setConfirming] = useState(false);

  const therapistObj = THERAPISTS.find(t=>t.id===therapist);
  const days = useMemo(()=> Array.from({length:7}, (_,i)=> addDays(weekStart, i)), [weekStart]);

  const isPast = (date) => date < TODAY;
  const atWeekFloor = weekStart <= mondayOf(TODAY);

  const slotState = (date, time) => {
    const bk = findBooking(bookings, date, time, therapist);
    if (bk) return (bk.owner && bk.owner===user.email) ? 'mine' : 'busy';
    // stationary before July → treat as unavailable
    if (format==='stacjonarnie' && date < STAT_FROM) return 'busy';
    if (isPast(date)) return 'busy';
    if (ymd(date)===ymd(TODAY)) {
      const hr = parseInt(time.slice(0,2),10);
      if (hr <= 12) return 'busy'; // earlier today already passed (demo: it's ~midday)
    }
    // specjalista may have closed this slot
    if (!isOpen(availability, date, time, therapist)) return 'busy';
    return 'free';
  };

  const pick = (date, time) => {
    setSel({ date: ymd(date), dateObj:new Date(date), time });
    setConfirming(true);
  };

  const confirm = () => {
    const b = {
      id: Date.now(),
      date: sel.date,
      time: sel.time,
      therapist,
      therapistName: therapistObj.name,
      format,
      source: 'online',
      patientName: user.name,
      owner: user.email,
      bookedBy: 'patient',
      created: Date.now(),
    };
    const next = [...bookings, b].sort((a,c)=> (a.date+a.time).localeCompare(c.date+c.time));
    setBookings(next);
    setConfirming(false);
    setSel(null);
    toast('Wizyta zarezerwowana ✓');
  };

  const cancel = (id) => {
    setBookings(bookings.filter(b=>b.id!==id));
    toast('Wizyta odwołana');
  };

  const rangeLabel = () => {
    const a = days[0], b = days[6];
    const am = MON_SHORT[a.getMonth()], bm = MON_SHORT[b.getMonth()];
    if (a.getMonth()===b.getMonth()) return `${a.getDate()}–${b.getDate()} ${MON[a.getMonth()]} ${a.getFullYear()}`;
    return `${a.getDate()} ${am} – ${b.getDate()} ${bm} ${b.getFullYear()}`;
  };

  const upcoming = bookings.filter(b => b.date >= ymd(TODAY) && b.owner===user.email);

  return (
    <div className="book">
      <div className="book-head">
        <div>
          <div className="eyebrow">Twój kalendarz wizyt</div>
          <h1>Wybierz <span className="it">wolny termin</span>, który Ci pasuje.</h1>
        </div>
      </div>

      <div className="notice-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>
        <span>Do końca <b>czerwca 2026</b> przyjmujemy wyłącznie <b>online</b>. Wizyty stacjonarne (ul. Jana Długosza 10/22, Wola) dostępne do rezerwacji od <b>1 lipca 2026</b>.</span>
      </div>

      <div className="controls">
        <div className="control">
          <span className="lbl">Specjalista</span>
          <div className="therapist-pick">
            {THERAPISTS.map(t=>(
              <button key={t.id} className={'tpick'+(therapist===t.id?' active':'')} onClick={()=>{setTherapist(t.id); setSel(null);}}>
                <img src={t.img} alt={t.name}/> {t.name.split(' ')[0]} {t.name.split(' ')[1]?.[0]}.
              </button>
            ))}
          </div>
        </div>
        <div className="control">
          <span className="lbl">Forma wizyty</span>
          <div className="seg">
            <button className={format==='online'?'active':''} onClick={()=>setFormat('online')}>Online</button>
            <button className={format==='stacjonarnie'?'active':''} onClick={()=>setFormat('stacjonarnie')}>Stacjonarnie</button>
          </div>
        </div>
      </div>

      <div className="weeknav">
        <div className="range">{rangeLabel()}</div>
        <div className="arrows">
          <button onClick={()=>setWeekStart(addDays(weekStart,-7))} disabled={atWeekFloor} aria-label="Poprzedni tydzień">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={()=>setWeekStart(addDays(weekStart,7))} aria-label="Następny tydzień">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="cal">
        {days.map((date,i)=>{
          const wd = date.getDay();
          const weekend = wd===0||wd===6;
          const times = effectiveTimes(date, therapist, workHours);
          const isToday = ymd(date)===ymd(TODAY);
          return (
            <div className={'day'+(weekend?' weekend':'')} key={i}>
              <div className="day-head">
                <span className="dow">{DOW[wd]}</span>
                <span className={'dnum'+(isToday?' today':'')}>{date.getDate()}<span className="mo">{MON_SHORT[date.getMonth()]}</span></span>
              </div>
              {times.length===0 ? (
                <div className="day-empty">{weekend?'—':'brak godzin'}</div>
              ) : (
                <div className="slots">
                  {times.map(t=>{
                    const st = slotState(date,t);
                    const isSel = sel && sel.date===ymd(date) && sel.time===t;
                    return (
                      <button key={t}
                        className={'slot '+st+(isSel?' sel':'')}
                        disabled={st!=='free'}
                        onClick={()=> st==='free' && pick(date,t)}>
                        {st==='mine' ? '✓ '+t : t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="legend">
        <span><i className="l-free"></i> Wolny termin</span>
        <span><i className="l-busy"></i> Zajęty</span>
        <span><i className="l-mine"></i> Twoja rezerwacja</span>
      </div>

      {/* My appointments */}
      <div className="myapps">
        <h3>Twoje wizyty</h3>
        {upcoming.length===0 ? (
          <p className="empty-apps">Nie masz jeszcze zaplanowanych wizyt. Wybierz wolny termin powyżej.</p>
        ) : (
          <div className="app-list">
            {upcoming.map(b=>{
              const d = new Date(b.date+'T00:00:00');
              const th = THERAPISTS.find(t=>t.id===b.therapist);
              return (
                <div className="app-row" key={b.id}>
                  <div className="when">
                    <span className="d">{d.getDate()} {MON[d.getMonth()]}</span>
                    <span className="t">{DOW[d.getDay()]} · {b.time}</span>
                  </div>
                  <div className="who">Wizyta u <b>{th?.name || b.therapistName}</b></div>
                  <span className="fmt">{b.format}</span>
                  <button className="cancel" onClick={()=>cancel(b.id)}>Odwołaj</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirming && sel && (
        <div className="modal-bg" onClick={(e)=>{ if(e.target.classList.contains('modal-bg')) setConfirming(false); }}>
          <div className="modal">
            <div className="badge">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </div>
            <h3>Potwierdź rezerwację</h3>
            <p className="sub" style={{color:'var(--muted)',fontSize:14}}>Sprawdź szczegóły wizyty przed potwierdzeniem.</p>
            <div className="summary">
              <div className="srow"><span className="k">Termin</span><span className="v">{sel.dateObj.getDate()} {MON[sel.dateObj.getMonth()]}, {DOW[sel.dateObj.getDay()]}</span></div>
              <div className="srow"><span className="k">Godzina</span><span className="v">{sel.time} – {String(parseInt(sel.time)+0).padStart(2,'0')}:50</span></div>
              <div className="srow"><span className="k">Specjalista</span><span className="v"><span className="who-mini"><img src={therapistObj.img} alt=""/>{therapistObj.name}</span></span></div>
              <div className="srow"><span className="k">Forma</span><span className="v" style={{textTransform:'capitalize'}}>{format}</span></div>
              <div className="srow"><span className="k">Czas trwania</span><span className="v">50 minut</span></div>
            </div>
            <div className="modal-actions">
              <button className="ghost" onClick={()=>setConfirming(false)}>Wróć</button>
              <button className="btn-primary" onClick={confirm}>Potwierdzam wizytę</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════ PANEL SPECJALISTY (ADMIN) ═════════════ */
function AdminView({ bookings, setBookings, availability, setAvailability, workHours, setWorkHours, toast }){
  const [therapist, setTherapist] = useState('anna');
  const [weekStart, setWeekStart] = useState(() => mondayOf(TODAY));
  const [action, setAction] = useState(null); // {date, dateObj, time, state, booking}
  const [manual, setManual] = useState(false); // manual-booking form open inside modal
  const [mForm, setMForm] = useState({ name:'', phone:'', source:'telefon', format:'online' });
  const [hoursOpen, setHoursOpen] = useState(false); // working-hours settings panel

  const therapistObj = THERAPISTS.find(t=>t.id===therapist);
  const days = useMemo(()=> Array.from({length:7}, (_,i)=> addDays(weekStart, i)), [weekStart]);
  const atWeekFloor = weekStart <= mondayOf(addDays(TODAY,-28)); // allow looking a bit back

  const slotState = (date, time) => {
    const bk = findBooking(bookings, date, time, therapist);
    if (bk) return 'booked';
    return isOpen(availability, date, time, therapist) ? 'open' : 'closed';
  };

  const openSlot = (date, time) => {
    const st = slotState(date, time);
    const bk = findBooking(bookings, date, time, therapist);
    setManual(false);
    setMForm({ name:'', phone:'', source:'telefon', format: date < STAT_FROM ? 'online' : 'online' });
    setAction({ date: ymd(date), dateObj: new Date(date), time, state: st, booking: bk });
  };

  const toggleAvail = (open) => {
    const k = availKey(action.date, action.time, therapist);
    setAvailability({ ...availability, [k]: open });
    setAction(null);
    toast(open ? 'Termin otwarty dla pacjentów' : 'Termin oznaczony jako niedostępny');
  };

  // Bulk open / close a whole day (all its offered, not-yet-booked slots)
  const setWholeDay = (date, open) => {
    const times = effectiveTimes(date, therapist, workHours);
    const next = { ...availability };
    times.forEach(t => {
      if (findBooking(bookings, date, t, therapist)) return; // never touch booked slots
      next[availKey(ymd(date), t, therapist)] = open;
    });
    setAvailability(next);
    toast(open ? 'Cały dzień otwarty' : 'Cały dzień zamknięty');
  };
  // Is the whole day currently open (every non-booked offered slot open)?
  const dayAllOpen = (date) => {
    const times = effectiveTimes(date, therapist, workHours).filter(t => !findBooking(bookings, date, t, therapist));
    if (times.length===0) return false;
    return times.every(t => isOpen(availability, date, t, therapist));
  };

  // Working hours editor: toggle a single hour on/off for a weekday
  const toggleWorkHour = (wd, time) => {
    // Derive current set from a representative date of that weekday
    const rep = addDays(mondayOf(TODAY), (wd+6)%7);
    const baseSet = (workHours[therapist] && workHours[therapist][wd] !== undefined)
      ? workHours[therapist][wd]
      : timesForDay(rep, therapist);
    const set = new Set(baseSet);
    if (set.has(time)) set.delete(time); else set.add(time);
    const arr = [...set].sort();
    setWorkHours({ ...workHours, [therapist]: { ...(workHours[therapist]||{}), [wd]: arr } });
  };
  const resetWorkHours = () => {
    const next = { ...workHours };
    delete next[therapist];
    setWorkHours(next);
    toast('Przywrócono domyślne godziny');
  };

  const saveManual = () => {
    if (!mForm.name.trim()) { toast('Podaj imię pacjenta'); return; }
    const b = {
      id: Date.now(),
      date: action.date,
      time: action.time,
      therapist,
      therapistName: therapistObj.name,
      format: mForm.format,
      source: mForm.source,
      patientName: mForm.name.trim(),
      phone: mForm.phone.trim(),
      owner: null,
      bookedBy: 'specjalista',
      created: Date.now(),
    };
    const next = [...bookings, b].sort((a,c)=> (a.date+a.time).localeCompare(c.date+c.time));
    setBookings(next);
    setAction(null);
    setManual(false);
    toast('Rezerwacja dodana ✓');
  };

  const cancelBooking = (id) => {
    setBookings(bookings.filter(b=>b.id!==id));
    setAction(null);
    toast('Wizyta odwołana');
  };

  const rangeLabel = () => {
    const a = days[0], b = days[6];
    const am = MON_SHORT[a.getMonth()], bm = MON_SHORT[b.getMonth()];
    if (a.getMonth()===b.getMonth()) return `${a.getDate()}–${b.getDate()} ${MON[a.getMonth()]} ${a.getFullYear()}`;
    return `${a.getDate()} ${am} – ${b.getDate()} ${bm} ${b.getFullYear()}`;
  };

  // week stats for selected therapist
  const stats = useMemo(()=>{
    let open=0, booked=0;
    days.forEach(d=>{
      effectiveTimes(d, therapist, workHours).forEach(t=>{
        const bk = findBooking(bookings, d, t, therapist);
        if (bk) booked++;
        else if (isOpen(availability, d, t, therapist)) open++;
      });
    });
    return { open, booked };
  }, [days, therapist, bookings, availability, workHours]);

  const weekBookings = useMemo(()=>{
    const a = ymd(days[0]), b = ymd(days[6]);
    return bookings.filter(x=> x.therapist===therapist && x.date>=a && x.date<=b)
      .sort((x,y)=> (x.date+x.time).localeCompare(y.date+y.time));
  }, [bookings, therapist, days]);

  return (
    <div className="book">
      <div className="book-head">
        <div>
          <div className="eyebrow">Panel specjalisty</div>
          <h1>Zarządzaj <span className="it">dostępnością</span> i rezerwacjami.</h1>
        </div>
        <div className="admin-stats">
          <div className="stat"><span className="n">{stats.open}</span><span className="l">wolnych w tym tygodniu</span></div>
          <div className="stat"><span className="n">{stats.booked}</span><span className="l">zarezerwowanych</span></div>
        </div>
      </div>

      <div className="notice-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>
        <span>Kliknij dowolny termin, aby <b>otworzyć/zamknąć dostępność</b> lub <b>dodać rezerwację</b> umówioną telefonicznie czy osobiście. Zmiany od razu widzą pacjenci w swoim kalendarzu.</span>
      </div>

      <div className="controls">
        <div className="control">
          <span className="lbl">Kalendarz specjalisty</span>
          <div className="therapist-pick">
            {THERAPISTS.map(t=>(
              <button key={t.id} className={'tpick'+(therapist===t.id?' active':'')} onClick={()=>{setTherapist(t.id);}}>
                <img src={t.img} alt={t.name}/> {t.name.split(' ')[0]} {t.name.split(' ')[1]?.[0]}.
              </button>
            ))}
          </div>
        </div>
        <div className="control">
          <span className="lbl">Harmonogram</span>
          <button className="hours-btn" onClick={()=>setHoursOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Ustaw stałe godziny pracy
          </button>
        </div>
      </div>

      <div className="weeknav">
        <div className="range">{rangeLabel()}</div>
        <div className="arrows">
          <button onClick={()=>setWeekStart(addDays(weekStart,-7))} disabled={atWeekFloor} aria-label="Poprzedni tydzień">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={()=>setWeekStart(addDays(weekStart,7))} aria-label="Następny tydzień">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="cal">
        {days.map((date,i)=>{
          const wd = date.getDay();
          const weekend = wd===0||wd===6;
          const times = effectiveTimes(date, therapist, workHours);
          const isToday = ymd(date)===ymd(TODAY);
          const allOpen = dayAllOpen(date);
          return (
            <div className={'day'+(weekend?' weekend':'')} key={i}>
              <div className="day-head">
                <div className="dh-left">
                  <span className="dow">{DOW[wd]}</span>
                  <span className={'dnum'+(isToday?' today':'')}>{date.getDate()}<span className="mo">{MON_SHORT[date.getMonth()]}</span></span>
                </div>
                {times.length>0 && (
                  <button className="day-toggle" title={allOpen?'Zamknij cały dzień':'Otwórz cały dzień'}
                    onClick={()=>setWholeDay(date, !allOpen)}>
                    {allOpen ? 'Zamknij dzień' : 'Otwórz dzień'}
                  </button>
                )}
              </div>
              {times.length===0 ? (
                <div className="day-empty">{weekend?'—':'wolne'}</div>
              ) : (
                <div className="slots">
                  {times.map(t=>{
                    const st = slotState(date,t);
                    const bk = st==='booked' ? findBooking(bookings, date, t, therapist) : null;
                    return (
                      <button key={t} className={'aslot '+st} onClick={()=>openSlot(date,t)}>
                        <span className="at">{t}</span>
                        {st==='booked'
                          ? <span className="ab">{(bk.patientName||'—').split(' ')[0]}{bk.source && bk.source!=='online' ? ' · '+(bk.source==='telefon'?'tel':'os') : ''}</span>
                          : <span className="ab">{st==='open'?'wolny':'zamknięty'}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="legend">
        <span><i className="l-open"></i> Wolny (widoczny dla pacjentów)</span>
        <span><i className="l-closed"></i> Zamknięty</span>
        <span><i className="l-booked"></i> Zarezerwowany</span>
      </div>

      {/* Week bookings list */}
      <div className="myapps">
        <h3>Rezerwacje w tym tygodniu — {therapistObj.name.split(' ')[0]}</h3>
        {weekBookings.length===0 ? (
          <p className="empty-apps">Brak rezerwacji w wybranym tygodniu.</p>
        ) : (
          <div className="app-list">
            {weekBookings.map(b=>{
              const d = new Date(b.date+'T00:00:00');
              return (
                <div className="app-row" key={b.id}>
                  <div className="when">
                    <span className="d">{d.getDate()} {MON[d.getMonth()]}</span>
                    <span className="t">{DOW[d.getDay()]} · {b.time}</span>
                  </div>
                  <div className="who"><b>{b.patientName||'—'}</b>{b.phone?<span style={{color:'var(--muted)'}}> · {b.phone}</span>:null}</div>
                  <span className={'src src-'+(b.source||'online')}>{SOURCE_LABEL[b.source]||'Online'}</span>
                  <span className="fmt">{b.format}</span>
                  <button className="cancel" onClick={()=>cancelBooking(b.id)}>Odwołaj</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* slot action modal */}
      {action && (
        <div className="modal-bg" onClick={(e)=>{ if(e.target.classList.contains('modal-bg')){ setAction(null); setManual(false);} }}>
          <div className="modal">
            {action.state==='booked' ? (
              <React.Fragment>
                <div className="badge"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 7 9 18l-5-5"/></svg></div>
                <h3>Termin zarezerwowany</h3>
                <div className="summary">
                  <div className="srow"><span className="k">Termin</span><span className="v">{action.dateObj.getDate()} {MON[action.dateObj.getMonth()]}, {action.time}</span></div>
                  <div className="srow"><span className="k">Pacjent</span><span className="v">{action.booking.patientName||'—'}</span></div>
                  {action.booking.phone && <div className="srow"><span className="k">Telefon</span><span className="v">{action.booking.phone}</span></div>}
                  <div className="srow"><span className="k">Źródło</span><span className="v">{SOURCE_LABEL[action.booking.source]||'Online'}</span></div>
                  <div className="srow"><span className="k">Forma</span><span className="v" style={{textTransform:'capitalize'}}>{action.booking.format}</span></div>
                </div>
                <div className="modal-actions">
                  <button className="ghost" onClick={()=>setAction(null)}>Zamknij</button>
                  <button className="btn-primary" style={{background:'#9a3b28'}} onClick={()=>cancelBooking(action.booking.id)}>Odwołaj wizytę</button>
                </div>
              </React.Fragment>
            ) : manual ? (
              <React.Fragment>
                <div className="badge"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg></div>
                <h3>Dodaj rezerwację</h3>
                <p style={{color:'var(--muted)',fontSize:14,marginBottom:4}}>{action.dateObj.getDate()} {MON[action.dateObj.getMonth()]}, {DOW[action.dateObj.getDay()]} · {action.time} · {therapistObj.name.split(' ')[0]}</p>
                <div className="field" style={{marginTop:16}}>
                  <label>Imię i nazwisko pacjenta</label>
                  <input value={mForm.name} onChange={e=>setMForm({...mForm,name:e.target.value})} placeholder="np. Katarzyna Nowak" autoFocus />
                </div>
                <div className="field">
                  <label>Telefon (opcjonalnie)</label>
                  <input value={mForm.phone} onChange={e=>setMForm({...mForm,phone:e.target.value})} placeholder="+48 ..." />
                </div>
                <div className="field">
                  <label>Sposób umówienia</label>
                  <div className="seg" style={{width:'100%'}}>
                    <button className={mForm.source==='telefon'?'active':''} style={{flex:1}} onClick={()=>setMForm({...mForm,source:'telefon'})}>Telefon</button>
                    <button className={mForm.source==='osobiscie'?'active':''} style={{flex:1}} onClick={()=>setMForm({...mForm,source:'osobiscie'})}>Osobiście</button>
                  </div>
                </div>
                <div className="field">
                  <label>Forma wizyty</label>
                  <div className="seg" style={{width:'100%'}}>
                    <button className={mForm.format==='online'?'active':''} style={{flex:1}} onClick={()=>setMForm({...mForm,format:'online'})}>Online</button>
                    <button className={mForm.format==='stacjonarnie'?'active':''} style={{flex:1}} onClick={()=>setMForm({...mForm,format:'stacjonarnie'})}>Stacjonarnie</button>
                  </div>
                </div>
                <div className="modal-actions" style={{marginTop:14}}>
                  <button className="ghost" onClick={()=>setManual(false)}>Wróć</button>
                  <button className="btn-primary" onClick={saveManual}>Zapisz rezerwację</button>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="badge"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
                <h3>{action.dateObj.getDate()} {MON[action.dateObj.getMonth()]} · {action.time}</h3>
                <p style={{color:'var(--muted)',fontSize:14,marginBottom:2}}>
                  Status: <b style={{color: action.state==='open'?'var(--olive)':'var(--muted)'}}>{action.state==='open'?'wolny — widoczny dla pacjentów':'zamknięty'}</b>
                </p>
                <div className="action-stack">
                  <button className="btn-primary" onClick={()=>{ setManual(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                    Dodaj rezerwację (telefon / osobiście)
                  </button>
                  {action.state==='open'
                    ? <button className="ghost wide" onClick={()=>toggleAvail(false)}>Oznacz jako niedostępny</button>
                    : <button className="ghost wide" onClick={()=>toggleAvail(true)}>Otwórz dla pacjentów</button>}
                  <button className="ghost wide subtle" onClick={()=>setAction(null)}>Anuluj</button>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      )}

      {/* working-hours settings panel */}
      {hoursOpen && (
        <div className="modal-bg" onClick={(e)=>{ if(e.target.classList.contains('modal-bg')) setHoursOpen(false); }}>
          <div className="modal hours-modal">
            <div className="badge"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
            <h3>Stałe godziny pracy</h3>
            <p style={{color:'var(--muted)',fontSize:14,marginBottom:6}}>
              {therapistObj.name} — zaznacz godziny, w których standardowo przyjmujesz. To wyznacza, które terminy w ogóle pojawiają się w kalendarzu.
            </p>
            <div className="hours-grid">
              {[1,2,3,4,5].map(wd=>{
                const rep = addDays(mondayOf(TODAY), (wd+6)%7);
                const active = new Set(effectiveTimes(rep, therapist, workHours));
                return (
                  <div className="hours-row" key={wd}>
                    <span className="hday">{['','Poniedziałek','Wtorek','Środa','Czwartek','Piątek'][wd]}</span>
                    <div className="htimes">
                      {BASE_TIMES.map(t=>(
                        <button key={t}
                          className={'htime'+(active.has(t)?' on':'')}
                          onClick={()=>toggleWorkHour(wd,t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions" style={{marginTop:18}}>
              <button className="ghost" onClick={resetWorkHours}>Przywróć domyślne</button>
              <button className="btn-primary" onClick={()=>{ setHoursOpen(false); toast('Godziny pracy zapisane ✓'); }}>Gotowe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function App(){
  const [user, setUser] = useState(loadUser);
  const [bookings, setBookings] = useState(loadBookings);
  const [availability, setAvailability] = useState(loadAvail);
  const [workHours, setWorkHours] = useState(loadHours);
  const [role, setRole] = useState('patient'); // 'patient' | 'specjalista' (demo switch)
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(()=>{ if(user) localStorage.setItem(LS_USER, JSON.stringify(user)); }, [user]);
  useEffect(()=>{ localStorage.setItem(LS_BOOK, JSON.stringify(bookings)); }, [bookings]);
  useEffect(()=>{ localStorage.setItem(LS_AVAIL, JSON.stringify(availability)); }, [availability]);
  useEffect(()=>{ localStorage.setItem(LS_HOURS, JSON.stringify(workHours)); }, [workHours]);

  const toast = useCallback((msg)=>{ setToastMsg(msg); setTimeout(()=>setToastMsg(null), 2600); }, []);

  const logout = () => { setUser(null); setRole('patient'); localStorage.removeItem(LS_USER); };
  const initials = (n) => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

  return (
    <React.Fragment>
      <div className="topbar">
        <a href="index.html" className="brand"><span className="brand-dot"></span><span>Souly</span></a>
        <div className="topbar-right">
          {user ? (
            <React.Fragment>
              <div className="role-switch" title="Tryb demonstracyjny — przełącz widok">
                <button className={role==='patient'?'active':''} onClick={()=>setRole('patient')}>Pacjent</button>
                <button className={role==='specjalista'?'active':''} onClick={()=>setRole('specjalista')}>Specjalista</button>
              </div>
              <div className="user-chip"><span className="av">{initials(user.name)}</span><span>{user.name}</span></div>
              <button className="logout" onClick={logout}>Wyloguj</button>
            </React.Fragment>
          ) : (
            <a href="index.html" className="back">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
              Powrót na stronę
            </a>
          )}
        </div>
      </div>

      {!user
        ? <AuthView onAuth={(u)=>{ setUser(u); toast('Witaj, '+u.name+'!'); }} />
        : role==='specjalista'
          ? <AdminView bookings={bookings} setBookings={setBookings} availability={availability} setAvailability={setAvailability} workHours={workHours} setWorkHours={setWorkHours} toast={toast} />
          : <BookingView user={user} bookings={bookings} setBookings={setBookings} availability={availability} workHours={workHours} toast={toast} />
      }

      {toastMsg && (
        <div className={'toast show'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
          {toastMsg}
        </div>
      )}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
