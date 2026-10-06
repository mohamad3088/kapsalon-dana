// ===== Prijzen (overgenomen van hun prijslijst in de zaak, foto op Google Maps) =====
const PRICES = {
  heren: {
    list: [
      ["Studentensnit", 20], ["Snit", 20], ["Baard tondeuse", 10], ["Baard scheermes", 15],
      ["Baard model", 15], ["Broske", 15], ["Kleuren", 35], ["Ontkrullen", 30],
    ],
  },
  dames: {
    list: [["Studentensnit", 30], ["Snit", 30]],
    table: {
      cols: ["Kort", "Halflang", "Lang"],
      rows: [
        ["Kleuren", 45, 60, 75], ["Balayage", 60, 70, 80], ["Mèches", 60, 70, 80],
        ["Snit & brushing", 45, 55, 60], ["Brushing", 30, 35, 40],
      ],
    },
  },
  kinderen: {
    list: [["Jongenssnit", 15], ["Meisjessnit", 20]],
    note: "Kinderen tot 12 jaar. Voor een design in het haar wordt een kleine meerprijs gerekend.",
  },
  producten: {
    list: [
      ["Wassen & lotion heren", 5], ["Wassen & lotion dames", 12], ["Conditioner", 5],
      ["Wax", 1], ["Mousse", 4], ["Lak", 4],
    ],
  },
};

// 0 = zondag … 6 = zaterdag. null = gesloten.
const HOURS = {
  0: ["09:00", "17:00"], 1: null, 2: ["10:00", "19:00"], 3: ["10:00", "19:00"],
  4: ["10:00", "19:00"], 5: ["10:00", "19:00"], 6: ["10:00", "18:00"],
};
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

// ===== Prijs-tabs =====
const panel = document.getElementById("pricePanel");
const tabs = [...document.querySelectorAll(".seg button")];

function renderPrices(kind) {
  const p = PRICES[kind];
  let html = "";
  if (p.table) html += `<p class="subhead">Knippen</p>`;
  html += `<div class="plist">${p.list.map(([name, price], i) =>
    `<div class="prow" style="animation-delay:${i * 40}ms"><span>${name}</span><i></i><b>€${price}</b></div>`).join("")}</div>`;
  if (p.table) {
    html += `<p class="subhead">Kleur &amp; brushing</p>
      <table class="ptable"><thead><tr><th>Behandeling</th>${p.table.cols.map(c => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${p.table.rows.map(([n, ...v]) => `<tr><td>${n}</td>${v.map(x => `<td>€${x}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  if (p.note) html += `<p class="pnote">${p.note}</p>`;
  panel.innerHTML = html;
  tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.tab === kind));
}
tabs.forEach(t => t.addEventListener("click", () => renderPrices(t.dataset.tab)));
document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => {
  renderPrices(b.dataset.goto);
  document.getElementById("prijzen").scrollIntoView({ behavior: "smooth" });
}));
renderPrices("heren");

// ===== Openingsuren + live status (Belgische tijd) =====
function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), mins: (+get("hour") % 24) * 60 + +get("minute") };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function renderHours() {
  const { day, mins } = brusselsNow();
  document.getElementById("hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");

  const today = HOURS[day];
  const isOpen = !!today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) text = `Nu open tot ${today[1]} — loop gerust binnen`;
  else if (today && mins < toMins(today[0])) text = `Gesloten · vandaag open vanaf ${today[0]}`;
  else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const d = (day + n) % 7;
    text = `Gesloten · ${n === 1 ? "morgen" : DAY_NAMES[d].toLowerCase()} open vanaf ${HOURS[d][0]}`;
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", isOpen);
  const pill = document.querySelector("[data-status]");
  pill.classList.toggle("is-open", isOpen);
  pill.textContent = isOpen ? `Nu open tot ${today[1]} · Heverlee` : "Naamsesteenweg 71 · Heverlee";
}
renderHours();
setInterval(renderHours, 60_000);

// ===== Nav =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ===== Reveal =====
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 100}ms`;
  io.observe(el);
});

document.getElementById("year").textContent = new Date().getFullYear();
