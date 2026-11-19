const progressBar = document.getElementById("progressBar");
const video = document.getElementById("film");
const rotatingText = document.getElementById("rotatingText");
const sections = [...document.querySelectorAll(".panel")];
const navLinks = [...document.querySelectorAll("nav a")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
let previousScrollY = scrollY;
let scrollDirectionTimeout = 0;

video.addEventListener("loadedmetadata", initializeVideo);
initializeVideo();

function initializeVideo() {
  if (!Number.isFinite(video.duration)) return;
  duration = video.duration;
  update();
}

video.addEventListener("loadeddata", () => {
  scheduleVideoSeek();
});

video.addEventListener("seeked", () => {
  if (Math.abs(targetTime - video.currentTime) >= 1 / 30) scheduleVideoSeek();
});

if (!prefersReducedMotion) {
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
  document.body.classList.toggle("at-home", scrollY <= 1);
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const scrollRatio = maxScroll ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
  progressBar.style.width = (scrollRatio * 100) + "%";

  if (duration && !prefersReducedMotion) {
    targetTime = scrollRatio * duration;
    scheduleVideoSeek();
  }

  let active = sections[0];
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top < innerHeight * .55) active = section;
  });
  navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === "#" + active.id));
}

function scheduleVideoSeek() {
  if (!duration || videoFrame) return;
  videoFrame = requestAnimationFrame(updateVideo);
}

function updateScrollDirection() {
  const currentScrollY = scrollY;
  if (currentScrollY < previousScrollY) {
    document.body.classList.add("scrolling-up");
    window.clearTimeout(scrollDirectionTimeout);
    scrollDirectionTimeout = window.setTimeout(() => {
      document.body.classList.remove("scrolling-up");
    }, 450);
  } else if (currentScrollY > previousScrollY) {
    window.clearTimeout(scrollDirectionTimeout);
    document.body.classList.remove("scrolling-up");
  }
  previousScrollY = currentScrollY;
  update();
}

function updateVideo() {
  videoFrame = 0;
  if (!duration || video.readyState < 2 || video.seeking) return;

  const difference = targetTime - video.currentTime;
  if (Math.abs(difference) >= 1 / 30) video.currentTime = targetTime;
}

addEventListener("scroll", updateScrollDirection, { passive: true });
addEventListener("resize", () => {
  previousScrollY = scrollY;
  update();
});
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

const resumeDownload = document.querySelector("[data-resume-download]");
const resumeDownloadStatus = document.getElementById("resumeDownloadStatus");
const resumeLaunchScene = document.getElementById("resumeLaunchScene");
let resumeDownloadTimeout = 0;

resumeDownload.addEventListener("click", () => {
  const resumeCard = resumeDownload.closest(".resume-card");
  window.clearTimeout(resumeDownloadTimeout);
  resumeCard.classList.remove("is-downloading");
  resumeLaunchScene.classList.remove("is-active");
  void resumeCard.offsetWidth;
  resumeCard.classList.add("is-downloading");
  if (!prefersReducedMotion) resumeLaunchScene.classList.add("is-active");
  resumeDownloadStatus.textContent = "Your résumé download has started.";

  resumeDownloadTimeout = window.setTimeout(() => {
    resumeCard.classList.remove("is-downloading");
    resumeLaunchScene.classList.remove("is-active");
    resumeDownloadStatus.textContent = "";
  }, 3200);
});

const demoForm = document.getElementById("ragDemoForm");
const demoQuestion = document.getElementById("ragQuestion");
const demoAnswer = document.getElementById("demoAnswer");
const demoResponses = [
  {
    match: /(chunk|overlap|split)/i,
    answer: "The handbook recommends chunks around 500–800 characters with roughly 100–150 characters of overlap to preserve context across boundaries.",
    source: "AI_Engineering_RAG_Handbook.txt · Page 1",
  },
  {
    match: /(unsupported|hallucination|made.?up|not found|outside|invent)/i,
    answer: "When the retrieved context does not support an answer, the assistant should say the information was not found instead of making up a response.",
    source: "DocuMind AI · Grounding and citation design",
  },
  {
    match: /(sample|document|file|corpus|which)/i,
    answer: "The sample corpus includes an AI engineering RAG handbook, an enterprise ML systems report, and a quantum-computing foundations document.",
    source: "DocuMind AI README · Sample corpus",
  },
];

function answerDemo(question) {
  const response = demoResponses.find((item) => item.match.test(question));
  demoAnswer.replaceChildren();

  const answer = document.createElement("p");
  answer.className = "demo-response";
  answer.textContent = response
    ? response.answer
    : "This offline preview covers three sample topics. Try asking about chunking, unsupported answers, or the sample documents.";
  demoAnswer.append(answer);

  if (response) {
    const citation = document.createElement("p");
    citation.className = "demo-citation";
    citation.textContent = "SOURCE · " + response.source;
    demoAnswer.append(citation);
  }
}

demoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  answerDemo(demoQuestion.value.trim());
});

document.querySelectorAll("[data-demo-question]").forEach((button) => {
  button.addEventListener("click", () => {
    demoQuestion.value = button.dataset.demoQuestion;
    answerDemo(demoQuestion.value);
  });
});
