const revealItems = document.querySelectorAll(".reveal");
const secretButton = document.querySelector("[data-secret-button]");
const secretMessage = document.querySelector("[data-secret-message]");
const introScreen = document.querySelector("#intro-screen");
const introTitles = document.querySelectorAll("[data-intro-step]");
const skipIntroButton = document.querySelector("[data-skip-intro]");
const smoothLinks = document.querySelectorAll('a[href^="#"]');

if (introScreen) {
  document.body.classList.add("intro-active");
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item) => observer.observe(item));

if (secretButton && secretMessage) {
  secretButton.addEventListener("click", () => {
    const isHidden = secretMessage.hasAttribute("hidden");

    if (isHidden) {
      secretMessage.removeAttribute("hidden");
      requestAnimationFrame(() => {
        secretMessage.classList.add("is-visible");
      });
      secretButton.textContent = "Secret Opened";
    } else {
      secretMessage.setAttribute("hidden", "");
      secretMessage.classList.remove("is-visible");
      secretButton.textContent = "Open Secret";
    }
  });
}

let introFinished = false;

const finishIntro = () => {
  if (!introScreen || introFinished) {
    return;
  }

  introFinished = true;
  introScreen.classList.add("is-hidden");
  document.body.classList.remove("intro-active");

  window.setTimeout(() => {
    introScreen.setAttribute("hidden", "");
  }, 800);
};

if (introScreen && introTitles.length) {
  window.setTimeout(() => {
    introTitles[0].classList.remove("is-active");
    if (introTitles[1]) {
      introTitles[1].classList.add("is-active");
    }
  }, 1800);

  window.setTimeout(() => {
    finishIntro();
  }, 3900);
}

if (skipIntroButton) {
  skipIntroButton.addEventListener("click", finishIntro);
}

smoothLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - 24;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  });
});
