const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const faqList = document.querySelector("[data-faq-list]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const desktopMedia = window.matchMedia("(min-width: 720px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const setMenuState = (isOpen) => {
  if (!nav || !navToggle) return;

  nav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  document.body.classList.toggle("nav-open", isOpen);
};

const closeMenu = () => setMenuState(false);

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
    setMenuState(isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(target) || navToggle.contains(target)) return;
    closeMenu();
  });

  const handleDesktopChange = (event) => {
    if (event.matches) closeMenu();
  };

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", handleDesktopChange);
  } else if (typeof desktopMedia.addListener === "function") {
    desktopMedia.addListener(handleDesktopChange);
  }
}

let ticking = false;

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 10);
};

const requestHeaderSync = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    syncHeader();
    ticking = false;
  });
};

syncHeader();
window.addEventListener("scroll", requestHeaderSync, { passive: true });

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => {
    item.classList.remove("is-ready");
    item.classList.add("is-visible");
  });
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
  );

  revealItems.forEach((item) => {
    item.classList.add("is-ready");

    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      item.classList.add("is-visible");
      return;
    }

    observer.observe(item);
  });
}

if (faqList) {
  const faqItems = faqList.querySelectorAll(".faq-item");

  faqItems.forEach((item, index) => {
    const button = item.querySelector("button");
    const answer = item.querySelector(".faq-answer");
    if (!button || !answer) return;

    const answerId = answer.id || `faq-answer-${index + 1}`;
    answer.id = answerId;
    button.setAttribute("aria-controls", answerId);
    answer.style.maxHeight = "0px";
  });

  faqList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest("button");
    if (!button || !faqList.contains(button)) return;

    const item = button.closest(".faq-item");
    const answer = item ? item.querySelector(".faq-answer") : null;
    if (!item || !answer) return;

    const isOpen = !item.classList.contains("is-open");
    item.classList.toggle("is-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : "0px";
  });
}

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => {
    const fallback = image.closest("[data-fallback]");
    if (fallback) fallback.classList.add("image-missing");
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const project = String(formData.get("project") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const recipient = "elicreafunky@gmail.com";
    const subject = `Demande de projet - ${project || "Éli Créa Funky"}`;
    const body = [
      `Nom : ${name}`,
      `Courriel : ${email}`,
      `Type de projet : ${project || "Non précisé"}`,
      "",
      "Message :",
      message
    ].join("\n");
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (formNote) {
      formNote.textContent = name
        ? `Merci ${name}. Votre courriel est prêt à être envoyé.`
        : "Merci. Votre courriel est prêt à être envoyé.";
    }

    window.location.assign(mailtoUrl);
  });
}
