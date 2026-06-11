// ============================================================
// Keeper data — transcribed from the original dossier artwork
// ============================================================
const KEEPERS = [
  {
    id: "Tessa",
    focus: "52% 10%",
    name: "Tessa Horton",
    role: "Scholar",
    origin: "Ohio, USA",
    ability: "Ingenio",
    color: "#a78bfa",
    traits: [
      "Comprehends the chemical and physical properties of crystals, intuits their intrinsic structures, and harnesses their vibrational energy.",
      "Engineers crystals into tools, such as a laser or a communication device.",
      "Guides commoners toward discovering more effective ways to positively utilize crystals in scientific, medical, and engineering endeavors.",
    ],
  },
  {
    id: "Tu",
    flip: true,
    focus: "72% 10%",
    name: "Tú Chen",
    role: "Scholar",
    origin: "Shaoguan, Guangdong Province, China",
    ability: "Magro",
    color: "#f5b54a",
    traits: [
      "Can amass, compress, and shape Rare Earths.",
      "Drawn to Rare Earths, even in the smallest of quantities.",
      "Able to manipulate other magnetic elements in the periodic table and other magnetic rocks as well, but excels with Rare Earths.",
      "Guides commoners toward improving rare earth mining, engineering standards, and developing better sustainable methods.",
    ],
  },
  {
    id: "Aedan",
    focus: "60% 10%",
    name: "Aedan Colston",
    role: "Scholar",
    origin: "West Yorkshire, England",
    ability: "Ferro",
    color: "#fb923c",
    traits: [
      "Senses iron, phosphorus, and other metals deep in the Earth.",
      "Manipulates rock samples with any concentrations of iron or phosphorus through heat manipulation.",
      "Guides commoners in improving mining and engineering standards and developing better sustainable methods.",
    ],
  },
  {
    id: "Demyan",
    focus: "60% 10%",
    name: "Demyan Ivanova",
    role: "Scholar",
    origin: "Riga, Latvia",
    ability: "Resogem",
    color: "#f472b6",
    traits: [
      "Attuned to negative energy stored in gemstones, crystals, and certain elements of the periodic table.",
      "Utilizes negative energy to disarm those who intend to harm others.",
      "Extracts dangerous pieces from humanity, avoiding hazardous Debilis and Commoner encounters.",
      "Familiar with the black market criminal underworld, both human and otherworldly.",
      "Resogem Debilis are particularly dangerous — they purposefully use this skill to harm and manipulate others for their own gain.",
    ],
  },
  {
    id: "Elise",
    focus: "55% 10%",
    name: "Élise Peters-Comtois",
    role: "Scholar",
    origin: "Paris, France",
    ability: "Techto",
    color: "#34d4b8",
    traits: [
      "Senses vibrations and shifting of the Earth, to the deepest internal crust.",
      "Discerns when an earthquake or tsunami is imminent from thousands of miles away, much faster than an expert commoner or their latest technology can detect.",
      "Generates an earthquake of some magnitude by harnessing naturally existing fault lines below the surface, to protect Commoners and the Earth from Debilis.",
      "Guides commoners toward more sensitive and faster earthquake alert systems.",
    ],
  },
  {
    id: "Jurgen",
    flip: true,
    focus: "78% 10%",
    name: "Jürgen Tilver",
    role: "Teacher",
    origin: "Scotland",
    ability: "Magro",
    color: "#f5b54a",
    traits: [
      "Can amass, compress, and shape Rare Earths.",
      "Drawn to Rare Earths, even in the smallest of quantities.",
      "Able to manipulate other magnetic elements in the periodic table and other magnetic rocks as well, but excels with Rare Earths.",
      "Guides commoners toward improving rare earth mining, engineering standards, and developing better sustainable methods.",
    ],
  },
  {
    id: "KameKona",
    focus: "60% 10%",
    name: "KameKona",
    role: "Scholar",
    origin: "Hawaii, USA",
    ability: "Volco",
    color: "#f87171",
    traits: [
      "Harnesses energy from volcanoes and can control igneous rock and lava streams through heat manipulation.",
      "Highly attuned to volcanoes and their activity.",
      "Detects volcanic activity far sooner than expert commoner volcanologists or their latest technologies.",
      "No Volco is capable of causing a volcano to erupt.",
    ],
  },
  {
    id: "Ming",
    focus: "42% 10%",
    name: "Ming Sen",
    role: "Scholar",
    origin: "Outram, Singapore",
    ability: "Emogem",
    color: "#4ade80",
    traits: [
      "Harnesses beneficial energy from gemstones, crystals, and certain elements from the periodic table.",
      "Heals others with the curative energy.",
      "Manipulates the emotions and behavior of others for the greater good — used primarily as a defensive measure, to disarm Debilis or Commoners who threaten or hurt others.",
      "Guides commoners toward developments in the field of alternative medicine.",
      "Emogem Debilis are dangerous to the commoner population, as they use their ability to manipulate others for their own gain.",
    ],
  },
  {
    id: "Reese",
    focus: "60% 10%",
    name: "Reese Rolding",
    role: "Teacher",
    origin: "Australia",
    ability: "Resogem",
    color: "#f472b6",
    traits: [
      "Attuned to negative energy stored in gemstones, crystals, and certain elements of the periodic table.",
      "Utilizes negative energy to disarm those who intend to harm others.",
      "Extracts dangerous pieces from humanity, avoiding hazardous Debilis and Commoner encounters.",
      "Familiar with the black market criminal underworld, both human and otherworldly.",
      "Resogem Debilis are particularly dangerous — they purposefully use this skill to harm and manipulate others for their own gain.",
    ],
  },
];

// ============================================================
// Mobile nav toggle
// ============================================================
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

links.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// ============================================================
// Keeper grid
// ============================================================
const grid = document.getElementById("keeperGrid");

KEEPERS.forEach((k, i) => {
  const li = document.createElement("li");
  li.className = "keeper-card reveal";
  li.style.setProperty("--gem", k.color);
  li.innerHTML = `
    <button class="keeper-btn" type="button" aria-label="Open dossier for ${k.name}">
      <img src="images/keepers/${k.id}-card.webp" alt="Portrait of ${k.name}" loading="lazy" />
      <span class="keeper-overlay">
        <span class="keeper-name">${k.name}</span>
        <span class="keeper-ability">${k.ability}</span>
      </span>
    </button>`;
  li.querySelector("button").addEventListener("click", () => openDossier(i));
  grid.appendChild(li);
});

// ============================================================
// Dossier modal
// ============================================================
const dossier = document.getElementById("dossier");
const dossierImg = document.getElementById("dossierImg");
const dossierName = document.getElementById("dossierName");
const dossierRole = document.getElementById("dossierRole");
const dossierOrigin = document.getElementById("dossierOrigin");
const dossierAbility = document.getElementById("dossierAbility");
const dossierTraits = document.getElementById("dossierTraits");
const dossierCount = document.getElementById("dossierCount");
let currentKeeper = 0;
let lastFocused = null;

function renderDossier(index) {
  currentKeeper = (index + KEEPERS.length) % KEEPERS.length;
  const k = KEEPERS[currentKeeper];
  const src = `images/keepers/${k.id}-portrait.webp`;
  if (dossierImg.src !== new URL(src, location.href).href) {
    dossierImg.classList.add("loading");
    dossierImg.onload = () => dossierImg.classList.remove("loading");
    dossierImg.src = src;
  }
  dossierImg.alt = `Portrait of ${k.name}`;
  dossierImg.style.objectPosition = k.focus;
  dossierName.textContent = k.name;
  dossierRole.textContent = k.role;
  dossierOrigin.textContent = k.origin;
  dossierAbility.textContent = `Ability: ${k.ability}`;
  const card = dossier.querySelector(".dossier-card");
  card.style.setProperty("--gem", k.color);
  card.classList.toggle("flipped", Boolean(k.flip));
  dossierTraits.innerHTML = "";
  k.traits.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    dossierTraits.appendChild(li);
  });
  dossierCount.textContent = `${currentKeeper + 1} / ${KEEPERS.length}`;
}

function openDossier(index) {
  lastFocused = document.activeElement;
  renderDossier(index);
  dossier.hidden = false;
  document.body.style.overflow = "hidden";
  dossier.querySelector(".dossier-close").focus();
}

function closeDossier() {
  dossier.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

dossier.querySelector(".dossier-close").addEventListener("click", closeDossier);
dossier.querySelector(".dossier-prev").addEventListener("click", () => renderDossier(currentKeeper - 1));
dossier.querySelector(".dossier-next").addEventListener("click", () => renderDossier(currentKeeper + 1));

dossier.addEventListener("click", (e) => {
  if (e.target === dossier) closeDossier();
});

document.addEventListener("keydown", (e) => {
  if (dossier.hidden) return;
  if (e.key === "Escape") closeDossier();
  if (e.key === "ArrowLeft") renderDossier(currentKeeper - 1);
  if (e.key === "ArrowRight") renderDossier(currentKeeper + 1);
});

// Preload the dossier portraits so swapping Keepers is instant
window.addEventListener("load", () => {
  KEEPERS.forEach((k) => {
    const img = new Image();
    img.src = `images/keepers/${k.id}-portrait.webp`;
  });
});

// ============================================================
// Interactive book cover — cursor-tracking 3D tilt
// ============================================================
const tilt = document.getElementById("bookTilt");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (tilt && !reducedMotion) {
  const glare = tilt.querySelector(".book-glare");

  tilt.addEventListener("mousemove", (e) => {
    const r = tilt.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateY(${px * 22}deg) rotateX(${py * -16}deg) scale(1.03)`;
    glare.style.opacity = "1";
    glare.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.28), transparent 55%)`;
  });

  tilt.addEventListener("mouseleave", () => {
    tilt.style.transform = "";
    glare.style.opacity = "0";
  });
}

// ============================================================
// Scroll-reveal animations
// ============================================================
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
