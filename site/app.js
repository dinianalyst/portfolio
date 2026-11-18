const progressBar = document.getElementById("progressBar");
const video = document.getElementById("film");
const rotatingText = document.getElementById("rotatingText");
const sections = [...document.querySelectorAll(".panel")];
const navLinks = [...document.querySelectorAll("nav a")];
const phrases = [
  "RAG-powered assistants",
  "Python AI backends",
  "Generative AI applications",
  "LLM-powered solutions",
  "Machine learning systems",
  "AI tools with LangChain",
];
let duration = 0;
let phraseIndex = 0;
let targetTime = 0;
let videoFrame = 0;
let lastVideoSeek = 0;

video.addEventListener("loadedmetadata", () => {
  duration = video.duration;
  update();
});

video.addEventListener("loadeddata", () => {
  if (duration && !videoFrame) videoFrame = requestAnimationFrame(updateVideo);
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.setInterval(() => {
    rotatingText.classList.add("is-changing");
    window.setTimeout(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      rotatingText.textContent = phrases[phraseIndex];
      rotatingText.classList.remove("is-changing");
    }, 180);
  }, 1000);
}

function update() {
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const scrollRatio = maxScroll ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
  progressBar.style.width = (scrollRatio * 100) + "%";

  if (duration) {
    targetTime = scrollRatio * duration;
    if (!videoFrame) videoFrame = requestAnimationFrame(updateVideo);
  }

  let active = sections[0];
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top < innerHeight * .55) active = section;
  });
  navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === "#" + active.id));
}

function updateVideo(timestamp) {
  videoFrame = 0;
  if (!duration || video.readyState < 2) return;

  const difference = targetTime - video.currentTime;
  if (Math.abs(difference) < 1 / 30) {
    lastVideoSeek = 0;
    return;
  }

  if (!video.seeking && (!lastVideoSeek || timestamp - lastVideoSeek >= 1000 / 30)) {
    const step = Math.min(Math.abs(difference), 4 / 30);
    video.currentTime += Math.sign(difference) * step;
    lastVideoSeek = timestamp;
  }

  videoFrame = requestAnimationFrame(updateVideo);
}

addEventListener("scroll", update, { passive: true });
addEventListener("resize", update);
update();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .2 });

sections.forEach((section) => revealObserver.observe(section));

const menu = document.getElementById("menu");
const navigation = document.querySelector("nav");

menu.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => link.addEventListener("click", () => {
  navigation.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
}));
