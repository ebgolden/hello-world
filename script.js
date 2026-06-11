// Mobile nav toggle
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

// Keeper dossier lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector(".lightbox-img");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
const keeperBtns = [...document.querySelectorAll(".keeper-btn")];
let currentKeeper = 0;
let lastFocused = null;

function showKeeper(index) {
  currentKeeper = (index + keeperBtns.length) % keeperBtns.length;
  const btn = keeperBtns[currentKeeper];
  const img = btn.querySelector("img");
  lightboxImg.src = img.src;
  lightboxImg.alt = `Enlarged Keeper dossier: ${btn.dataset.keeper}`;
  lightboxCaption.textContent = btn.dataset.keeper;
}

function openLightbox(index) {
  lastFocused = document.activeElement;
  showKeeper(index);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightbox.querySelector(".lightbox-close").focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

keeperBtns.forEach((btn, i) => btn.addEventListener("click", () => openLightbox(i)));
lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showKeeper(currentKeeper - 1));
lightbox.querySelector(".lightbox-next").addEventListener("click", () => showKeeper(currentKeeper + 1));

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showKeeper(currentKeeper - 1);
  if (e.key === "ArrowRight") showKeeper(currentKeeper + 1);
});

// Scroll-reveal animations
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
